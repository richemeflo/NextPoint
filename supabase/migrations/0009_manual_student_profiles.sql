create type public.student_account_status as enum (
  'pending_activation',
  'active',
  'suspended',
  'deleted'
);

alter table public.student_profiles
  add column account_status public.student_account_status
    not null default 'active';

comment on column public.student_profiles.account_status is
  'Authentication lifecycle, distinct from the coach-student relationship status.';

create or replace function public.normalize_student_email(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(trim(value));
$$;

create or replace function public.normalize_student_phone(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(trim(value), '[^0-9+]', '', 'g');
$$;

revoke all on function public.normalize_student_email(text) from public;
revoke all on function public.normalize_student_phone(text) from public;
grant execute on function public.normalize_student_email(text)
  to authenticated, service_role;
grant execute on function public.normalize_student_phone(text)
  to authenticated, service_role;

create unique index uniq_student_profiles_normalized_email
  on public.student_profiles (public.normalize_student_email(email));

create unique index uniq_student_profiles_normalized_phone
  on public.student_profiles (public.normalize_student_phone(phone));

create table public.student_activation_tokens (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique
    check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

comment on table public.student_activation_tokens is
  'Hashed, one-time activation tokens for coach-provisioned student accounts.';

create index idx_student_activation_tokens_student_created
  on public.student_activation_tokens (student_id, created_at desc);

alter table public.student_activation_tokens enable row level security;

revoke all on table public.student_activation_tokens
  from anon, authenticated;
grant all on table public.student_activation_tokens to service_role;

drop policy student_profiles_select_own
  on public.student_profiles;
drop policy student_profiles_update_own_eleve
  on public.student_profiles;

create policy student_profiles_select_own_active
  on public.student_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and account_status = 'active'
  );

create policy student_profiles_update_own_active_eleve
  on public.student_profiles
  for update
  to authenticated
  using (
    (select auth.uid()) = user_id
    and account_status = 'active'
  )
  with check (
    (select auth.uid()) = user_id
    and account_status = 'active'
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'eleve'
    )
  );

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
    or trim(coalesce(p_phone, '')) !~ '^\+?[0-9][0-9 .()-]{5,29}$'
    or trim(coalesce(p_email, '')) !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    or p_padel_level not between 1 and 10
    or p_age not between 5 and 100
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
    trim(p_phone),
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

create or replace function public.create_student_activation_token(
  p_coach_id uuid,
  p_student_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns public.student_activation_tokens
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_token public.student_activation_tokens;
begin
  if p_expires_at <> now() + interval '24 hours'
    and abs(extract(epoch from (p_expires_at - now())) - 86400) > 5
  then
    raise exception 'activation expiry must be 24 hours'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.student_profiles
    join public.student_coach_relationships
      on student_coach_relationships.student_id = student_profiles.user_id
    where student_profiles.user_id = p_student_id
      and student_profiles.account_status = 'pending_activation'
      and student_coach_relationships.coach_id = p_coach_id
      and student_coach_relationships.status = 'active'
  ) then
    raise exception 'student account is not activatable'
      using errcode = '42501';
  end if;

  update public.student_activation_tokens
  set revoked_at = now()
  where student_id = p_student_id
    and consumed_at is null
    and revoked_at is null;

  insert into public.student_activation_tokens (
    student_id,
    created_by,
    token_hash,
    expires_at
  )
  values (
    p_student_id,
    p_coach_id,
    p_token_hash,
    p_expires_at
  )
  returning * into created_token;

  return created_token;
end;
$$;

create or replace function public.claim_student_activation_token(
  p_token_hash text
)
returns public.student_activation_tokens
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_token public.student_activation_tokens;
begin
  select *
  into claimed_token
  from public.student_activation_tokens
  where token_hash = p_token_hash
  for update;

  if claimed_token.id is null
    or claimed_token.consumed_at is not null
    or claimed_token.revoked_at is not null
    or claimed_token.expires_at <= now()
    or not exists (
      select 1
      from public.student_profiles
      where student_profiles.user_id = claimed_token.student_id
        and student_profiles.account_status = 'pending_activation'
    )
  then
    raise exception 'activation token is invalid'
      using errcode = '22023';
  end if;

  update public.student_activation_tokens
  set consumed_at = now()
  where id = claimed_token.id
  returning * into claimed_token;

  return claimed_token;
end;
$$;

create or replace function public.rollback_student_activation_claim(
  p_token_id uuid
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.student_activation_tokens
  set consumed_at = null
  where id = p_token_id
    and revoked_at is null
    and exists (
      select 1
      from public.student_profiles
      where student_profiles.user_id = student_activation_tokens.student_id
        and student_profiles.account_status = 'pending_activation'
    );
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

  update public.student_profiles
  set account_status = 'active'
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
revoke all on function public.create_student_activation_token(
  uuid, uuid, text, timestamptz
) from public;
revoke all on function public.claim_student_activation_token(text) from public;
revoke all on function public.rollback_student_activation_claim(uuid) from public;
revoke all on function public.finalize_student_activation(uuid, uuid) from public;

grant execute on function public.complete_manual_student_provisioning(
  uuid, uuid, text, text, text, smallint, smallint, public.student_sex
) to service_role;
grant execute on function public.create_student_activation_token(
  uuid, uuid, text, timestamptz
) to service_role;
grant execute on function public.claim_student_activation_token(text)
  to service_role;
grant execute on function public.rollback_student_activation_claim(uuid)
  to service_role;
grant execute on function public.finalize_student_activation(uuid, uuid)
  to service_role;
