begin;

select plan(7);

select has_function(
  'public',
  'get_associated_students',
  array['uuid'],
  'associated students read model exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_associated_students(uuid)',
    'execute'
  ),
  'authenticated users can call the guarded read model'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_associated_students(uuid)',
    'execute'
  ),
  'anonymous users cannot list associated students'
);

delete from auth.users
where id in (
  select user_id
  from public.user_roles
  where role = 'coach'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '17000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'coach-list@example.test', '', now(),
    '{}', '{"role":"coach"}', now(), now()
  ),
  (
    '17000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'complete@example.test', '', now(),
    '{}', '{"role":"eleve"}', now(), now()
  ),
  (
    '17000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'incomplete@example.test', '', now(),
    '{}', '{"role":"eleve"}', now(), now()
  );

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language
)
values (
  '17000000-0000-4000-8000-000000000002',
  'Complete Student',
  '+33000000170',
  'complete@example.test',
  5,
  30,
  'fr'
);

select set_config(
  'request.jwt.claim.sub',
  '17000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  $$select count(*)
    from public.get_associated_students('17000000-0000-4000-8000-000000000001')
    where user_id in (
      '17000000-0000-4000-8000-000000000002',
      '17000000-0000-4000-8000-000000000003'
    )$$,
  'values (2::bigint)',
  'the coach sees complete and incomplete associated students'
);
select results_eq(
  $$select full_name, email, profile_complete
    from public.get_associated_students('17000000-0000-4000-8000-000000000001')
    where user_id = '17000000-0000-4000-8000-000000000003'$$,
  $$values ('incomplete@example.test'::text, 'incomplete@example.test'::text, false)$$,
  'an incomplete profile falls back to the authentication email'
);
select results_eq(
  $$select full_name, profile_complete
    from public.get_associated_students('17000000-0000-4000-8000-000000000001')
    where user_id = '17000000-0000-4000-8000-000000000002'$$,
  $$values ('Complete Student'::text, true)$$,
  'a completed profile keeps its student name'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '17000000-0000-4000-8000-000000000003',
  true
);
set local role authenticated;

select throws_ok(
  $$select * from public.get_associated_students('17000000-0000-4000-8000-000000000001')$$,
  '42501',
  'coach role required',
  'a student cannot list the coach private roster'
);

select * from finish();

rollback;
