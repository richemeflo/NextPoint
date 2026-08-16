begin;

select plan(16);

select has_table('public', 'legal_acceptances', 'legal acceptance evidence table exists');
select has_column('public', 'legal_acceptances', 'terms_version', 'terms version is recorded');
select has_column(
  'public',
  'legal_acceptances',
  'privacy_policy_version',
  'privacy policy version is recorded'
);
select has_column('public', 'legal_acceptances', 'accepted_at', 'acceptance timestamp is recorded');
select col_is_fk('public', 'legal_acceptances', 'user_id', 'acceptance belongs to an auth user');
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.legal_acceptances'::regclass
  ),
  true,
  'RLS is enabled on legal acceptances'
);
select ok(
  has_table_privilege('authenticated', 'public.legal_acceptances', 'select'),
  'authenticated users can read their evidence through RLS'
);
select ok(
  not has_table_privilege('authenticated', 'public.legal_acceptances', 'insert')
    and not has_table_privilege('authenticated', 'public.legal_acceptances', 'update')
    and not has_table_privilege('authenticated', 'public.legal_acceptances', 'delete'),
  'clients cannot forge or alter acceptance evidence'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'legal_acceptances'
      and policyname = 'legal_acceptances_select_own'
  ),
  'acceptance evidence has an own-user read policy'
);
select has_function(
  'public',
  'purge_expired_personal_data',
  array[]::name[],
  'retention purge function exists'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.purge_expired_personal_data()',
    'execute'
  ),
  'service role can enforce retention periods'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.purge_expired_personal_data()',
    'execute'
  ),
  'authenticated users cannot run the global retention purge'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.purge_expired_personal_data()',
    'execute'
  ),
  'anonymous users cannot run the global retention purge'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '18000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'legal-acceptance@example.test',
  '',
  now(),
  '{}',
  '{"role":"eleve","legal_acceptance_source":"signup","terms_version":"2026-08-16","privacy_policy_version":"2026-08-16"}',
  now(),
  now()
);

select results_eq(
  $$select terms_version, privacy_policy_version, source
    from public.legal_acceptances
    where user_id = '18000000-0000-4000-8000-000000000001'$$,
  $$values ('2026-08-16'::text, '2026-08-16'::text, 'signup'::text)$$,
  'signup metadata creates server-side acceptance evidence'
);

select set_config(
  'request.jwt.claim.sub',
  '18000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  $$select count(*) from public.legal_acceptances$$,
  'values (1::bigint)',
  'a user can read their own acceptance evidence'
);
select throws_ok(
  $$insert into public.legal_acceptances (
      user_id, terms_version, privacy_policy_version, source
    ) values (
      '18000000-0000-4000-8000-000000000001', 'forged', 'forged', 'signup'
    )$$,
  '42501',
  null,
  'a user cannot forge acceptance evidence'
);

select * from finish();

rollback;
