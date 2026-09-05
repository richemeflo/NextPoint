begin;

select plan(10);

select has_function(
  'public',
  'has_current_legal_acceptance',
  array[]::name[],
  'current legal acceptance check exists'
);
select has_function(
  'public',
  'record_current_legal_acceptance',
  array[]::name[],
  'Google legal acceptance command exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.has_current_legal_acceptance()',
    'execute'
  ),
  'authenticated users can check their legal acceptance'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.record_current_legal_acceptance()',
    'execute'
  ),
  'authenticated users can record their own Google acceptance'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.record_current_legal_acceptance()',
    'execute'
  ),
  'anonymous users cannot record legal acceptance'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '21000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'google-student@example.test',
  '',
  now(),
  '{"provider":"google","providers":["google"]}',
  '{"role":"coach"}',
  now(),
  now()
);

select results_eq(
  $$select role from public.user_roles
    where user_id = '21000000-0000-4000-8000-000000000001'$$,
  $$values ('eleve'::public.app_role)$$,
  'Google signup always receives the student role'
);

select set_config(
  'request.jwt.claim.sub',
  '21000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select is(
  public.has_current_legal_acceptance(),
  false,
  'new Google account starts without legal acceptance'
);

select lives_ok(
  $$select public.record_current_legal_acceptance()$$,
  'authenticated user can record Google acceptance'
);

select is(
  public.has_current_legal_acceptance(),
  true,
  'Google acceptance is visible after recording it'
);

select results_eq(
  $$select source
    from public.legal_acceptances
    where user_id = '21000000-0000-4000-8000-000000000001'
      and terms_version = '2026-08-19'
      and privacy_policy_version = '2026-08-19'$$,
  $$values ('account_completion'::text)$$,
  'Google acceptance records the expected source'
);

select * from finish();

rollback;
