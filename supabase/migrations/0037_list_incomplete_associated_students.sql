create or replace function public.get_associated_students(p_coach_id uuid)
returns table (
  user_id uuid,
  full_name text,
  email text,
  phone text,
  padel_level smallint,
  age smallint,
  sex public.student_sex,
  account_status public.student_account_status,
  profile_complete boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_coach_id is distinct from (select auth.uid())
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'coach'
    )
  then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  return query
  select
    relationships.student_id,
    coalesce(
      nullif(trim(student_profiles.full_name), ''),
      auth_users.email,
      relationships.student_id::text
    ),
    coalesce(student_profiles.email, auth_users.email, ''),
    student_profiles.phone,
    student_profiles.padel_level,
    student_profiles.age,
    student_profiles.sex,
    student_profiles.account_status,
    student_profiles.user_id is not null
  from public.student_coach_relationships as relationships
  join auth.users as auth_users
    on auth_users.id = relationships.student_id
  left join public.student_profiles
    on student_profiles.user_id = relationships.student_id
  where relationships.coach_id = p_coach_id
    and relationships.status = 'active'
  order by coalesce(
    nullif(trim(student_profiles.full_name), ''),
    auth_users.email,
    relationships.student_id::text
  );
end;
$$;

comment on function public.get_associated_students(uuid) is
  'Lists every active coach-student association, including accounts without a completed profile.';

revoke all on function public.get_associated_students(uuid) from public;
grant execute on function public.get_associated_students(uuid) to authenticated;
