alter table public.legal_acceptances
  drop constraint if exists legal_acceptances_source_check;

alter table public.legal_acceptances
  add constraint legal_acceptances_source_check
  check (source in ('signup', 'student_activation', 'account_completion'));

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  is_google_identity boolean;
begin
  is_google_identity :=
    new.raw_app_meta_data ->> 'provider' = 'google'
    or coalesce(new.raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google';

  requested_role := case
    when is_google_identity then 'eleve'
    else new.raw_user_meta_data ->> 'role'
  end;

  if requested_role not in ('coach', 'eleve') then
    raise exception 'invalid application role'
      using errcode = '22023';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role::public.app_role);

  return new;
end;
$$;

revoke all on function public.handle_new_user_role() from public;

create or replace function public.record_signup_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'terms_version' = '2026-08-19'
    and new.raw_user_meta_data ->> 'privacy_policy_version' = '2026-08-19'
    and new.raw_user_meta_data ->> 'legal_acceptance_source' = 'signup'
  then
    insert into public.legal_acceptances (
      user_id,
      terms_version,
      privacy_policy_version,
      source,
      accepted_at
    )
    values (
      new.id,
      '2026-08-19',
      '2026-08-19',
      'signup',
      now()
    )
    on conflict (user_id, terms_version, privacy_policy_version) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.record_signup_legal_acceptance() from public;

insert into public.legal_acceptances (
  user_id,
  terms_version,
  privacy_policy_version,
  source,
  accepted_at
)
select
  users.id,
  '2026-08-19',
  '2026-08-19',
  'signup',
  coalesce(users.created_at, now())
from auth.users users
where users.raw_user_meta_data ->> 'terms_version' = '2026-08-19'
  and users.raw_user_meta_data ->> 'privacy_policy_version' = '2026-08-19'
  and users.raw_user_meta_data ->> 'legal_acceptance_source' = 'signup'
on conflict (user_id, terms_version, privacy_policy_version) do nothing;

create or replace function public.has_current_legal_acceptance()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.legal_acceptances
    where user_id = (select auth.uid())
      and terms_version = '2026-08-19'
      and privacy_policy_version = '2026-08-19'
  );
$$;

create or replace function public.record_current_legal_acceptance()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'authentication required'
      using errcode = '42501';
  end if;

  insert into public.legal_acceptances (
    user_id,
    terms_version,
    privacy_policy_version,
    source,
    accepted_at
  )
  values (
    current_user_id,
    '2026-08-19',
    '2026-08-19',
    'account_completion',
    now()
  )
  on conflict (user_id, terms_version, privacy_policy_version) do nothing;
end;
$$;

revoke all on function public.has_current_legal_acceptance() from public;
revoke all on function public.record_current_legal_acceptance() from public;
grant execute on function public.has_current_legal_acceptance() to authenticated;
grant execute on function public.record_current_legal_acceptance() to authenticated;
