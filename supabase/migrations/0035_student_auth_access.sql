create or replace function public.get_current_student_account_status()
returns public.student_account_status
language sql
stable
security definer
set search_path = ''
as $$
  select student_profiles.account_status
  from public.student_profiles
  where student_profiles.user_id = (select auth.uid());
$$;

comment on function public.get_current_student_account_status() is
  'Returns the authenticated student account status, or null before profile onboarding.';

revoke all on function public.get_current_student_account_status() from public;
grant execute on function public.get_current_student_account_status()
  to authenticated;
