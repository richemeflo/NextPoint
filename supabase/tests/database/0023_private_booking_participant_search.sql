begin;

select plan(9);

select has_function(
  'public',
  'normalize_student_name',
  array['text'],
  'student names can be normalized consistently'
);
select has_function(
  'public',
  'get_requestable_booking_participants',
  array['text', 'integer'],
  'partner search RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_requestable_booking_participants(text,integer)',
    'execute'
  ),
  'authenticated users can search for a partner'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_requestable_booking_participants(text,integer)',
    'execute'
  ),
  'anonymous users cannot search student names'
);
select is(
  public.normalize_student_name('  Élodie-Martin  '),
  'elodie martin',
  'accented and punctuated names are normalized'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '23000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'coach-search@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{"role":"coach"}', now(), now()
  ),
  (
    '23000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'requester-search@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{"role":"eleve"}', now(), now()
  ),
  (
    '23000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'elodie-search@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{"role":"eleve"}', now(), now()
  ),
  (
    '23000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'camille-search@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{"role":"eleve"}', now(), now()
  );

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language,
  account_status, sex
) values
  (
    '23000000-0000-4000-8000-000000000002', 'Alice Bernard', '0600000002',
    'requester-search@example.test', 5, 30, 'fr', 'active', 'female'
  ),
  (
    '23000000-0000-4000-8000-000000000003', 'Élodie Martin', '0600000003',
    'elodie-search@example.test', 5, 30, 'fr', 'active', 'female'
  ),
  (
    '23000000-0000-4000-8000-000000000004', 'Camille Durand', '0600000004',
    'camille-search@example.test', 5, 30, 'fr', 'active', 'female'
  );

select set_config(
  'request.jwt.claim.sub',
  '23000000-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

select is_empty(
  $$select * from public.get_requestable_booking_participants('e', 8)$$,
  'a one-character query reveals no students'
);
select results_eq(
  $$select student_id, full_name
    from public.get_requestable_booking_participants('ELO', 8)$$,
  $$values (
    '23000000-0000-4000-8000-000000000003'::uuid,
    'Élodie Martin'::text
  )$$,
  'the first name matches without accents or case sensitivity'
);
select results_eq(
  $$select student_id, full_name
    from public.get_requestable_booking_participants('mart', 8)$$,
  $$values (
    '23000000-0000-4000-8000-000000000003'::uuid,
    'Élodie Martin'::text
  )$$,
  'the last name can be searched independently'
);
select is_empty(
  $$select * from public.get_requestable_booking_participants('lod', 8)$$,
  'a query does not match the middle of a name token'
);

select * from finish();

rollback;
