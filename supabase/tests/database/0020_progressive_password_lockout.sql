begin;

select plan(17);

select has_table(
  'public',
  'password_sign_in_lockouts',
  'password lockout state table exists'
);
select has_function(
  'public',
  'hook_password_verification_attempt',
  array['jsonb']::name[],
  'password verification hook exists'
);
select ok(
  has_function_privilege(
    'supabase_auth_admin',
    'public.hook_password_verification_attempt(jsonb)',
    'execute'
  ),
  'Supabase Auth can execute the hook'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.hook_password_verification_attempt(jsonb)',
    'execute'
  ) and not has_function_privilege(
    'anon',
    'public.hook_password_verification_attempt(jsonb)',
    'execute'
  ),
  'client roles cannot execute the hook'
);
select ok(
  has_table_privilege(
    'supabase_auth_admin',
    'public.password_sign_in_lockouts',
    'select,insert,update,delete'
  ),
  'Supabase Auth can maintain lockout state'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.password_sign_in_lockouts',
    'select'
  ) and not has_table_privilege(
    'anon',
    'public.password_sign_in_lockouts',
    'select'
  ),
  'client roles cannot read lockout state'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values (
  '20000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'password-lockout@example.test',
  '',
  now(),
  '{}',
  '{"role":"eleve"}',
  now(),
  now()
);

select is(
  public.hook_password_verification_attempt(
    '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
  ),
  '{"decision":"continue"}'::jsonb,
  'the first failure continues to the normal invalid-credentials response'
);

select public.hook_password_verification_attempt(
  '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
) from generate_series(1, 3);

select is(
  public.hook_password_verification_attempt(
    '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
  )->'error'->>'http_code',
  '429',
  'the fifth failure locks the account'
);
select ok(
  (select locked_until between now() + interval '4 minutes 59 seconds'
                           and now() + interval '5 minutes 1 second'
   from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  'the first lock lasts five minutes'
);

select is(
  public.hook_password_verification_attempt(
    '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
  )->'error'->>'http_code',
  '429',
  'attempts made during a lock remain blocked'
);
select is(
  (select failed_attempts
   from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  5,
  'attempts made during a lock do not extend the failure sequence'
);

update public.password_sign_in_lockouts
set failed_attempts = 9,
    locked_until = now() - interval '1 second'
where user_id = '20000000-0000-4000-8000-000000000001';

select is(
  public.hook_password_verification_attempt(
    '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
  )->'error'->>'http_code',
  '429',
  'the tenth failure locks the account again'
);
select ok(
  (select locked_until between now() + interval '14 minutes 59 seconds'
                           and now() + interval '15 minutes 1 second'
   from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  'the second lock lasts fifteen minutes'
);

update public.password_sign_in_lockouts
set failed_attempts = 24,
    locked_until = now() - interval '1 second'
where user_id = '20000000-0000-4000-8000-000000000001';

select public.hook_password_verification_attempt(
  '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
);

select ok(
  (select locked_until between now() + interval '119 minutes 59 seconds'
                           and now() + interval '120 minutes 1 second'
   from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  'the fifth lock lasts two hours'
);

update public.password_sign_in_lockouts
set failed_attempts = 49,
    locked_until = now() - interval '1 second'
where user_id = '20000000-0000-4000-8000-000000000001';

select public.hook_password_verification_attempt(
  '{"user_id":"20000000-0000-4000-8000-000000000001","valid":false}'
);

select ok(
  (select locked_until between now() + interval '23 hours 59 minutes 59 seconds'
                           and now() + interval '24 hours 1 second'
   from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  'progressive locks are capped at twenty-four hours'
);

update public.password_sign_in_lockouts
set locked_until = now() - interval '1 second'
where user_id = '20000000-0000-4000-8000-000000000001';

select is(
  public.hook_password_verification_attempt(
    '{"user_id":"20000000-0000-4000-8000-000000000001","valid":true}'
  ),
  '{"decision":"continue"}'::jsonb,
  'a successful password resets the failure sequence'
);
select is(
  (select count(*) from public.password_sign_in_lockouts
   where user_id = '20000000-0000-4000-8000-000000000001'),
  0::bigint,
  'successful verification removes the lockout state'
);

select * from finish();

rollback;
