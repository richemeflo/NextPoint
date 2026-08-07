create or replace function public.is_coach_registration_open()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.user_roles
    where role = 'coach'
  );
$$;

revoke all on function public.is_coach_registration_open() from public;
grant execute on function public.is_coach_registration_open() to anon, authenticated;
