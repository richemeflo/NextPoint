alter table public.student_profiles
  drop constraint if exists student_profiles_email_check;

alter table public.student_profiles
  add constraint student_profiles_email_check check (
    trim(email) <> ''
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ) not valid;

drop index if exists public.uniq_student_profiles_normalized_email;
create unique index uniq_student_profiles_normalized_email
  on public.student_profiles (public.normalize_student_email(email))
  where trim(email) <> '';

alter table public.student_profiles
  alter column age drop not null;

create or replace function public.complete_manual_student_provisioning(
  p_coach_id uuid,
  p_student_id uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_padel_level smallint,
  p_age smallint,
  p_sex public.student_sex
)
returns public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_profile public.student_profiles;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = p_coach_id
      and user_roles.role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = p_student_id
      and user_roles.role = 'eleve'
  ) then
    raise exception 'student role required' using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_full_name, ''))) not between 2 and 100
    or (
      trim(coalesce(p_phone, '')) <> ''
      and trim(p_phone) !~ '^\+?[0-9][0-9 .()-]{5,29}$'
    )
    or trim(coalesce(p_email, '')) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    or p_padel_level not between 1 and 10
    or (p_age is not null and p_age not between 5 and 100)
  then
    raise exception 'invalid manual student profile' using errcode = '22023';
  end if;

  insert into public.student_profiles (
    user_id,
    full_name,
    phone,
    email,
    padel_level,
    age,
    sex,
    preferred_language,
    account_status
  )
  values (
    p_student_id,
    trim(p_full_name),
    trim(coalesce(p_phone, '')),
    public.normalize_student_email(p_email),
    p_padel_level,
    p_age,
    p_sex,
    'fr',
    'pending_activation'
  )
  returning * into created_profile;

  insert into public.student_coach_relationships (
    coach_id,
    student_id,
    status,
    association_method
  )
  values (
    p_coach_id,
    p_student_id,
    'active',
    'manual'
  )
  on conflict (coach_id, student_id) do update
    set status = 'active',
        association_method = 'manual',
        updated_at = now();

  return created_profile;
end;
$$;

comment on column public.student_profiles.email is
  'Required contact email used to provision and activate the student account.';

comment on column public.student_profiles.age is
  'Optional for coach-created records; students provide it when completing their profile.';
