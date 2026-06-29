create type public.lesson_pack_status as enum (
  'active',
  'exhausted'
);

create table public.lesson_packs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  included_sessions smallint not null
    check (included_sessions between 1 and 100),
  used_sessions smallint not null default 0
    check (used_sessions >= 0 and used_sessions <= included_sessions),
  remaining_sessions smallint generated always as (
    included_sessions - used_sessions
  ) stored,
  status public.lesson_pack_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'active' and used_sessions < included_sessions)
    or (status = 'exhausted' and used_sessions = included_sessions)
  )
);

comment on table public.lesson_packs is
  'Individual lesson credit tracking only. No payment, invoice or transaction data.';

create unique index uniq_lesson_packs_active_owner_student
  on public.lesson_packs (coach_id, student_id)
  where status = 'active';

create index idx_lesson_packs_student_created
  on public.lesson_packs (student_id, created_at desc);

alter table public.lesson_packs enable row level security;

revoke all on table public.lesson_packs from anon, authenticated;
grant select on table public.lesson_packs to authenticated;
grant all on table public.lesson_packs to service_role;

create policy lesson_packs_select_participant
  on public.lesson_packs
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or (
      coach_id = (select auth.uid())
      and exists (
        select 1
        from public.student_coach_relationships
        where student_coach_relationships.coach_id = (select auth.uid())
          and student_coach_relationships.student_id =
            lesson_packs.student_id
          and student_coach_relationships.status = 'active'
      )
    )
  );

create trigger lesson_packs_set_updated_at
  before update on public.lesson_packs
  for each row execute function public.set_updated_at();

create or replace function public.assign_lesson_pack(
  p_student_id uuid,
  p_included_sessions smallint
)
returns public.lesson_packs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
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

  if p_included_sessions not between 1 and 100 then
    raise exception 'invalid included sessions' using errcode = '22023';
  end if;

  insert into public.lesson_packs (
    coach_id,
    student_id,
    included_sessions
  )
  values (
    current_coach_id,
    p_student_id,
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
    'Pack de cours individuels attribué',
    p_included_sessions || ' cours inclus',
    created_pack.id,
    now()
  );

  return created_pack;
end;
$$;

create or replace function public.consume_lesson_pack_session(
  p_pack_id uuid
)
returns public.lesson_packs
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  consumed_pack public.lesson_packs;
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

  update public.lesson_packs
  set used_sessions = used_sessions + 1,
      status = case
        when used_sessions + 1 = included_sessions
          then 'exhausted'::public.lesson_pack_status
        else 'active'::public.lesson_pack_status
      end,
      updated_at = now()
  where id = p_pack_id
    and coach_id = current_coach_id
    and status = 'active'
    and used_sessions < included_sessions
    and exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = current_coach_id
        and student_coach_relationships.student_id =
          lesson_packs.student_id
        and student_coach_relationships.status = 'active'
    )
  returning * into consumed_pack;

  if consumed_pack.id is null then
    raise exception 'lesson pack has no remaining session or is unauthorized'
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
    consumed_pack.coach_id,
    consumed_pack.student_id,
    'lesson_pack_consumed',
    case
      when consumed_pack.status = 'exhausted'
        then 'exhausted'::public.student_history_event_status
      else 'active'::public.student_history_event_status
    end,
    'Session de pack consommée',
    consumed_pack.remaining_sessions || ' cours restant(s)',
    consumed_pack.id,
    now()
  );

  return consumed_pack;
end;
$$;

revoke all on function public.assign_lesson_pack(uuid, smallint)
  from public;
revoke all on function public.consume_lesson_pack_session(uuid)
  from public;
grant execute on function public.assign_lesson_pack(uuid, smallint)
  to authenticated;
grant execute on function public.consume_lesson_pack_session(uuid)
  to authenticated;
