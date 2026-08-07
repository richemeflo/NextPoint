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
        and not exists (
          select 1
          from public.lesson_packs as other_active_pack
          where other_active_pack.coach_id = target_pack.coach_id
            and other_active_pack.student_id = target_pack.student_id
            and other_active_pack.status = 'active'
            and other_active_pack.id <> target_pack.id
        )
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

comment on function public.adjust_lesson_pack_sessions(uuid, smallint) is
  'Atomically adjusts included lesson credits without changing used sessions.';

revoke all on function public.adjust_lesson_pack_sessions(uuid, smallint)
  from public;
grant execute on function public.adjust_lesson_pack_sessions(uuid, smallint)
  to authenticated;
