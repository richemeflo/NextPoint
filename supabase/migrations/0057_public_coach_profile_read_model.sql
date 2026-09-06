begin;

revoke select on table public.coach_profiles from anon;

drop policy if exists coach_profiles_select_public
  on public.coach_profiles;

create policy coach_profiles_select_own_coach
  on public.coach_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'coach'
    )
  );

create or replace function public.get_public_coach_profile()
returns table (
  display_name text,
  bio text,
  phone text,
  email text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coach_profiles.display_name,
    coach_profiles.bio,
    coach_profiles.phone,
    coach_profiles.email
  from public.coach_profiles
  order by coach_profiles.created_at, coach_profiles.user_id
  limit 1;
$$;

revoke all on function public.get_public_coach_profile() from public;
grant execute on function public.get_public_coach_profile() to anon, authenticated;

commit;
