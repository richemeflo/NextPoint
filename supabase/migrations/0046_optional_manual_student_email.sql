alter table public.student_profiles
  drop constraint if exists student_profiles_email_check;

alter table public.student_profiles
  add constraint student_profiles_email_check check (
    trim(email) = ''
    or trim(email) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

drop index if exists public.uniq_student_profiles_normalized_email;
create unique index uniq_student_profiles_normalized_email
  on public.student_profiles (public.normalize_student_email(email))
  where trim(email) <> '';

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
    or (
      trim(coalesce(p_email, '')) <> ''
      and trim(p_email) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    )
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
    public.normalize_student_email(coalesce(p_email, '')),
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

create or replace function public.finalize_student_activation(
  p_token_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_email text;
  login_email text;
  login_metadata jsonb;
begin
  if not exists (
    select 1
    from public.student_activation_tokens
    where id = p_token_id
      and student_id = p_student_id
      and consumed_at is not null
      and revoked_at is null
      and expires_at > now()
  ) then
    raise exception 'activation claim not found'
      using errcode = '22023';
  end if;

  select public.normalize_student_email(student_profiles.email)
  into profile_email
  from public.student_profiles
  where student_profiles.user_id = p_student_id
    and student_profiles.account_status = 'pending_activation'
  for update;

  if not found then
    raise exception 'student account is not pending activation'
      using errcode = '22023';
  end if;

  if profile_email = '' then
    select
      public.normalize_student_email(coalesce(users.email, '')),
      coalesce(users.raw_user_meta_data, '{}'::jsonb)
    into login_email, login_metadata
    from auth.users
    where users.id = p_student_id;

    if not found
      or login_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
      or login_email ~* '@activation\.equationpadel\.invalid$'
      or coalesce(login_metadata ->> 'contact_email_missing', 'true') <> 'false'
    then
      raise exception 'student login email is required'
        using errcode = '22023';
    end if;
  else
    login_email := profile_email;
  end if;

  update public.student_profiles
  set account_status = 'active',
      email = login_email
  where user_id = p_student_id
    and account_status = 'pending_activation';

  if not found then
    raise exception 'student account is not pending activation'
      using errcode = '22023';
  end if;

  update public.student_activation_tokens
  set revoked_at = coalesce(revoked_at, now())
  where student_id = p_student_id
    and id <> p_token_id
    and consumed_at is null;
end;
$$;

revoke all on function public.complete_manual_student_provisioning(
  uuid, uuid, text, text, text, smallint, smallint, public.student_sex
) from public;
revoke all on function public.finalize_student_activation(uuid, uuid)
  from public;

grant execute on function public.complete_manual_student_provisioning(
  uuid, uuid, text, text, text, smallint, smallint, public.student_sex
) to service_role;
grant execute on function public.finalize_student_activation(uuid, uuid)
  to service_role;

comment on column public.student_profiles.email is
  'Optional contact email. Empty means activation links must be shared manually; the student supplies a login email during activation.';
