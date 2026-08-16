create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null check (char_length(terms_version) between 8 and 40),
  privacy_policy_version text not null
    check (char_length(privacy_policy_version) between 8 and 40),
  source text not null check (source in ('signup', 'student_activation')),
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, terms_version, privacy_policy_version)
);

comment on table public.legal_acceptances is
  'Server-side evidence of acceptance for each published terms and privacy-policy version.';

create index legal_acceptances_user_accepted_idx
  on public.legal_acceptances (user_id, accepted_at desc);

alter table public.legal_acceptances enable row level security;

revoke all on table public.legal_acceptances from anon, authenticated;
grant select on table public.legal_acceptances to authenticated;
grant all on table public.legal_acceptances to service_role;

create policy legal_acceptances_select_own
  on public.legal_acceptances
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.record_signup_legal_acceptance()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'terms_version' = '2026-08-16'
    and new.raw_user_meta_data ->> 'privacy_policy_version' = '2026-08-16'
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
      new.raw_user_meta_data ->> 'terms_version',
      new.raw_user_meta_data ->> 'privacy_policy_version',
      'signup',
      now()
    )
    on conflict (user_id, terms_version, privacy_policy_version) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.record_signup_legal_acceptance() from public;

create trigger on_auth_user_created_record_legal_acceptance
  after insert on auth.users
  for each row execute function public.record_signup_legal_acceptance();
