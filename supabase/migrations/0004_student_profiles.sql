create type public.app_language as enum ('fr', 'en', 'es');

create table public.student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 2 and 100),
  phone text not null check (char_length(trim(phone)) between 6 and 30),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  padel_level smallint not null check (padel_level between 1 and 10),
  age smallint not null check (age between 5 and 100),
  preferred_language public.app_language not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.student_profiles is
  'Private student-owned profile data used by NextPoint P0.';

alter table public.student_profiles enable row level security;

revoke all on table public.student_profiles from anon;
revoke delete on table public.student_profiles from authenticated;
grant select, insert, update on table public.student_profiles to authenticated;
grant select on table public.student_profiles to service_role;

create policy student_profiles_select_own
  on public.student_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy student_profiles_insert_own_eleve
  on public.student_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'eleve'
    )
  );

create policy student_profiles_update_own_eleve
  on public.student_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'eleve'
    )
  );

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row execute function public.set_updated_at();
