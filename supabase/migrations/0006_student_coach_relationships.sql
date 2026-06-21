create table public.student_coach_relationships (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  association_method text not null default 'automatic'
    check (association_method in ('automatic', 'invitation', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_coach_relationships_distinct_users
    check (coach_id <> student_id),
  constraint student_coach_relationships_unique_pair
    unique (coach_id, student_id)
);

comment on table public.student_coach_relationships is
  'Coach-student associations. P0 creates one active automatic relationship per student.';

create unique index uniq_student_coach_relationships_active_student
  on public.student_coach_relationships (student_id)
  where status = 'active';

alter table public.student_coach_relationships enable row level security;

revoke all on table public.student_coach_relationships from anon;
revoke insert, update, delete on table public.student_coach_relationships
  from authenticated;
grant select on table public.student_coach_relationships
  to authenticated, service_role;

create policy student_coach_relationships_select_participant
  on public.student_coach_relationships
  for select
  to authenticated
  using (
    (select auth.uid()) = coach_id
    or (select auth.uid()) = student_id
  );

create policy student_profiles_select_associated_coach
  on public.student_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = (select auth.uid())
        and student_coach_relationships.student_id = student_profiles.user_id
        and student_coach_relationships.status = 'active'
    )
  );

create trigger student_coach_relationships_set_updated_at
  before update on public.student_coach_relationships
  for each row execute function public.set_updated_at();

create or replace function public.assign_student_to_single_coach(
  student_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  single_coach_id uuid;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = student_user_id
      and user_roles.role = 'eleve'
  ) then
    return;
  end if;

  select user_roles.user_id
  into single_coach_id
  from public.user_roles
  where user_roles.role = 'coach'
  limit 1;

  if single_coach_id is null then
    return;
  end if;

  insert into public.student_coach_relationships (
    coach_id,
    student_id,
    status,
    association_method
  )
  values (
    single_coach_id,
    student_user_id,
    'active',
    'automatic'
  )
  on conflict (coach_id, student_id) do update
    set status = 'active',
        updated_at = now();
end;
$$;

revoke all on function public.assign_student_to_single_coach(uuid) from public;

create or replace function public.handle_single_coach_relationship()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'eleve' then
    perform public.assign_student_to_single_coach(new.user_id);
  elsif new.role = 'coach' then
    insert into public.student_coach_relationships (
      coach_id,
      student_id,
      status,
      association_method
    )
    select
      new.user_id,
      user_roles.user_id,
      'active',
      'automatic'
    from public.user_roles
    where user_roles.role = 'eleve'
    on conflict (coach_id, student_id) do update
      set status = 'active',
          updated_at = now();
  end if;

  return new;
end;
$$;

revoke all on function public.handle_single_coach_relationship() from public;

create trigger user_roles_assign_single_coach
  after insert or update of role on public.user_roles
  for each row execute function public.handle_single_coach_relationship();

insert into public.student_coach_relationships (
  coach_id,
  student_id,
  status,
  association_method
)
select
  coach.user_id,
  student.user_id,
  'active',
  'automatic'
from public.user_roles coach
cross join public.user_roles student
where coach.role = 'coach'
  and student.role = 'eleve'
on conflict (coach_id, student_id) do update
  set status = 'active',
      updated_at = now();
