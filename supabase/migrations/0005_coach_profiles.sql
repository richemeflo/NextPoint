create table public.coach_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 100),
  bio text not null check (char_length(trim(bio)) between 20 and 500),
  phone text not null check (char_length(trim(phone)) between 6 and 30),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  preferred_language public.app_language not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.coach_profiles is
  'Public single-coach profile and coach-owned account preferences.';

alter table public.coach_profiles enable row level security;

revoke all on table public.coach_profiles from anon;
revoke delete on table public.coach_profiles from authenticated;
grant select on table public.coach_profiles to anon, authenticated, service_role;
grant insert, update on table public.coach_profiles to authenticated;

create policy coach_profiles_select_public
  on public.coach_profiles
  for select
  to anon, authenticated
  using (true);

create policy coach_profiles_insert_own_coach
  on public.coach_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'coach'
    )
  );

create policy coach_profiles_update_own_coach
  on public.coach_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'coach'
    )
  );

create trigger coach_profiles_set_updated_at
  before update on public.coach_profiles
  for each row execute function public.set_updated_at();
