alter table public.lesson_packs
  add column if not exists pricing_rate_id uuid
    references public.pricing_rates(id) on delete restrict,
  add column if not exists lesson_type text not null default 'individual'
    check (lesson_type in ('individual', 'duo', 'group')),
  add column if not exists duration_minutes integer not null default 60
    check (duration_minutes in (60, 90));

comment on table public.lesson_packs is
  'Lesson credit tracking scoped to one coach, one student and one pricing type. No payment, invoice or transaction data.';

drop index if exists public.uniq_lesson_packs_active_owner_student;

create unique index if not exists uniq_lesson_packs_active_owner_student_pricing
  on public.lesson_packs (
    coach_id,
    student_id,
    lesson_type,
    duration_minutes,
    coalesce(pricing_rate_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where status = 'active';

drop function if exists public.assign_lesson_pack(uuid, smallint);
drop function if exists public.assign_lesson_pack(uuid, smallint, uuid, text, integer);

create function public.assign_lesson_pack(
  p_student_id uuid,
  p_included_sessions smallint,
  p_pricing_rate_id uuid,
  p_lesson_type text,
  p_duration_minutes integer
)
returns public.lesson_packs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  selected_rate public.pricing_rates;
  created_pack public.lesson_packs;
begin
  if current_coach_id is null
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.student_coach_relationships
    where student_coach_relationships.coach_id = current_coach_id
      and student_coach_relationships.student_id = p_student_id
      and student_coach_relationships.status = 'active'
  ) then
    raise exception 'active coach-student relationship required'
      using errcode = '42501';
  end if;

  if p_included_sessions not between 1 and 100
    or p_duration_minutes not in (60, 90)
    or p_lesson_type not in ('individual', 'duo', 'group')
  then
    raise exception 'invalid lesson pack input' using errcode = '22023';
  end if;

  select *
    into selected_rate
  from public.pricing_rates
  where pricing_rates.id = p_pricing_rate_id
    and pricing_rates.coach_id = current_coach_id
    and pricing_rates.is_active
    and pricing_rates.deleted_at is null
    and pricing_rates.lesson_type = p_lesson_type
    and pricing_rates.duration_minutes = p_duration_minutes
    and (
      not exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
      )
      or exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
          and pricing_rate_students.student_id = p_student_id
      )
    );

  if selected_rate.id is null then
    raise exception 'pricing rate not found or not applicable'
      using errcode = 'P0002';
  end if;

  insert into public.lesson_packs (
    coach_id,
    student_id,
    pricing_rate_id,
    lesson_type,
    duration_minutes,
    included_sessions
  )
  values (
    current_coach_id,
    p_student_id,
    selected_rate.id,
    selected_rate.lesson_type,
    selected_rate.duration_minutes,
    p_included_sessions
  )
  returning * into created_pack;

  insert into public.student_history_events (
    coach_id,
    student_id,
    event_type,
    status,
    title,
    description,
    source_id,
    occurred_at
  )
  values (
    current_coach_id,
    p_student_id,
    'lesson_pack_assigned',
    'active',
    'Pack de cours attribué',
    p_included_sessions || ' cours inclus · ' ||
      selected_rate.lesson_type || ' · ' ||
      selected_rate.duration_minutes || ' min',
    created_pack.id,
    now()
  );

  return created_pack;
end;
$$;

create or replace function public.adjust_lesson_pack_sessions(
  p_pack_id uuid,
  p_delta smallint
)
returns public.lesson_packs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  adjusted_pack public.lesson_packs;
begin
  if p_delta is null or p_delta not in (-1, 1) then
    raise exception 'lesson pack adjustment must be -1 or 1'
      using errcode = '22023';
  end if;

  if current_coach_id is null
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  update public.lesson_packs as target_pack
  set included_sessions = included_sessions + p_delta,
      status = case
        when included_sessions + p_delta = used_sessions
          then 'exhausted'::public.lesson_pack_status
        else 'active'::public.lesson_pack_status
      end,
      updated_at = now()
  where target_pack.id = p_pack_id
    and target_pack.coach_id = current_coach_id
    and exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = current_coach_id
        and student_coach_relationships.student_id = target_pack.student_id
        and student_coach_relationships.status = 'active'
    )
    and (
      (
        p_delta = -1
        and target_pack.included_sessions > greatest(
          target_pack.used_sessions,
          1
        )
      )
      or (
        p_delta = 1
        and target_pack.included_sessions < 100
      )
    )
  returning target_pack.* into adjusted_pack;

  if adjusted_pack.id is null then
    raise exception 'lesson pack cannot be adjusted or is unauthorized'
      using errcode = '22023';
  end if;

  insert into public.student_history_events (
    coach_id,
    student_id,
    event_type,
    status,
    title,
    description,
    source_id,
    occurred_at
  )
  values (
    adjusted_pack.coach_id,
    adjusted_pack.student_id,
    'lesson_pack_adjusted'::public.student_history_event_type,
    case
      when adjusted_pack.status = 'exhausted'
        then 'exhausted'::public.student_history_event_status
      else 'active'::public.student_history_event_status
    end,
    case
      when p_delta = 1 then 'Crédit de pack ajouté'
      else 'Crédit de pack retiré'
    end,
    adjusted_pack.remaining_sessions || ' cours restant(s)',
    adjusted_pack.id,
    now()
  );

  return adjusted_pack;
end;
$$;

revoke all on function public.assign_lesson_pack(
  uuid, smallint, uuid, text, integer
) from public;
revoke all on function public.adjust_lesson_pack_sessions(uuid, smallint)
  from public;

grant execute on function public.assign_lesson_pack(
  uuid, smallint, uuid, text, integer
) to authenticated;
grant execute on function public.adjust_lesson_pack_sessions(uuid, smallint)
  to authenticated;
