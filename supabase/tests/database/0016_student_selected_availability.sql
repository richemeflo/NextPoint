begin;

select plan(28);

select has_function(
  'public', 'get_student_availability_occurrences',
  array['timestamp with time zone', 'timestamp with time zone'],
  'student availability read model exists'
);
select has_function(
  'public', 'request_booking',
  array['uuid', 'timestamp with time zone', 'integer', 'text', 'text', 'uuid[]'],
  'student-selected booking command exists'
);
select ok(
  to_regprocedure('public.request_booking(uuid,text,text,uuid[])') is null,
  'legacy fixed-slot request command is removed'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('16000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'range-coach@example.test', '', now(), '{}', '{"role":"coach"}', now(), now()),
  ('16000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'range-student-1@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now()),
  ('16000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'range-student-2@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now()),
  ('16000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'range-student-3@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now());

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language
)
values
  ('16000000-0000-4000-8000-000000000002', 'Student One', '+33000000161', 'range-student-1@example.test', 5, 25, 'fr'),
  ('16000000-0000-4000-8000-000000000003', 'Student Two', '+33000000162', 'range-student-2@example.test', 5, 25, 'fr'),
  ('16000000-0000-4000-8000-000000000004', 'Student Three', '+33000000163', 'range-student-3@example.test', 5, 25, 'fr');

insert into public.pricing_rates (
  id, coach_id, label, amount_cents, currency, duration_minutes, lesson_type
)
values
  ('16000000-0000-4000-8000-000000000010', '16000000-0000-4000-8000-000000000001', 'Range 60', 4500, 'EUR', 60, 'individual'),
  ('16000000-0000-4000-8000-000000000011', '16000000-0000-4000-8000-000000000001', 'Range 90', 6000, 'EUR', 90, 'individual');

select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000001', true);
set local role authenticated;

select lives_ok(
  $$select public.create_availability_range(
    '2027-07-01T12:00:00Z', '2027-07-01T16:00:00Z', 60,
    'Les Bruyères Centre Sportif', 'none', null
  )$$,
  'coach creates a continuous 14:00-18:00 Paris range'
);
select results_eq(
  $$select count(*) from public.availability_slots
    where coach_id = '16000000-0000-4000-8000-000000000001'$$,
  'values (1::bigint)',
  'one continuous occurrence is generated'
);
select results_eq(
  $$select duration_minutes from public.availability_slots
    where coach_id = '16000000-0000-4000-8000-000000000001'$$,
  'values (240)',
  'the occurrence retains the entire four-hour range'
);
select results_eq(
  $$select count(*) from public.get_student_availability_occurrences(
      '2027-07-01T00:00:00Z', '2027-07-02T00:00:00Z'
    )$$,
  'values (0::bigint)',
  'a coach cannot use the student availability read model'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select throws_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2020-07-01T13:00:00Z', 60, 'individual', '', '{}'
  )$$,
  '22023', 'past booking',
  'a request cannot target the past'
);
select lives_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T13:00:00Z', 60, 'individual', '', '{}'
  )$$,
  'first exact request is accepted'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select lives_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T13:00:00Z', 60, 'individual', '', '{}'
  )$$,
  'second exact request is accepted'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000004', true);
set local role authenticated;
select throws_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T13:00:00Z', 60, 'individual', '', '{}'
  )$$,
  '23514', 'pending limit reached',
  'a third request on identical bounds is refused'
);
select lives_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T13:30:00Z', 60, 'individual', '', '{}'
  )$$,
  'another student may request overlapping bounds'
);
select throws_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T13:45:00Z', 60, 'individual', '', '{}'
  )$$,
  '23P01', 'student booking overlap',
  'the same student cannot create an overlapping request'
);
select results_eq(
  $$select jsonb_array_length(occupations)
    from public.get_student_availability_occurrences('2027-07-01T00:00:00Z', '2027-07-02T00:00:00Z')$$,
  'values (0)',
  'pending requests are not exposed as occupations'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.approve_booking(
    (select id from public.bookings where student_id = '16000000-0000-4000-8000-000000000002' and status = 'pending')
  )$$,
  'coach confirms one request atomically'
);
select results_eq(
  $$select count(*) from public.bookings
    where status = 'refused' and coach_id = '16000000-0000-4000-8000-000000000001'$$,
  'values (2::bigint)',
  'all other overlapping pending requests are refused'
);
select results_eq(
  $$select count(*) from public.bookings
    where status = 'confirmed' and origin = 'student_request'$$,
  'values (1::bigint)',
  'the selected request remains confirmed'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000003', true);
set local role authenticated;
select results_eq(
  $$select jsonb_array_length(occupations)
    from public.get_student_availability_occurrences('2027-07-01T00:00:00Z', '2027-07-02T00:00:00Z')$$,
  'values (1)',
  'student read model exposes occupied bounds without booking identities'
);
select results_eq(
  $$select array(
      select jsonb_object_keys(occupations -> 0)
      from public.get_student_availability_occurrences('2027-07-01T00:00:00Z', '2027-07-02T00:00:00Z')
      order by 1
    )$$,
  $$values (array['endsAt', 'startsAt']::text[])$$,
  'occupation JSON exposes bounds and no booking or student identity'
);
select results_eq(
  $$select count(*) from public.get_student_availability_occurrences(
      '2027-01-01T00:00:00Z', '2028-01-01T00:00:00Z'
    )$$,
  'values (0::bigint)',
  'an excessive read window is rejected closed'
);
select lives_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '16000000-0000-4000-8000-000000000001'),
    '2027-07-01T14:00:00Z', 60, 'individual', '', '{}'
  )$$,
  'a request in a remaining free fragment is accepted'
);

reset role;
select set_config('request.jwt.claim.sub', '16000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select * from public.create_coach_booking(
    array['16000000-0000-4000-8000-000000000002'::uuid],
    '2027-07-01T14:30:00Z', 60, 'Les Bruyères Centre Sportif', 'individual', null
  )$$,
  'coach freely creates a course that overlaps a pending request'
);
select results_eq(
  $$select status::text from public.bookings
    where student_id = '16000000-0000-4000-8000-000000000003'
      and starts_at = '2027-07-01T14:00:00Z'$$,
  $$values ('refused'::text)$$,
  'coach-created course refuses the overlapping request'
);
select lives_ok(
  $$select * from public.create_coach_booking(
    array['16000000-0000-4000-8000-000000000002'::uuid],
    '2027-07-01T13:30:00Z', 60, 'Les Bruyères Centre Sportif', 'individual', null
  )$$,
  'coach can also create a course over an already confirmed course'
);
select results_eq(
  $$select count(*) from public.bookings where origin = 'coach_created'$$,
  'values (2::bigint)',
  'both unrestricted coach courses are retained'
);
select lives_ok(
  $$select public.create_availability_range(
    '2027-07-02T12:00:00Z', '2027-07-02T15:00:00Z', 60,
    'Les Bruyères Centre Sportif', 'none', null
  )$$,
  'coach creates another editable continuous occurrence'
);
select lives_ok(
  $$select public.update_availability_slot(
    (select id from public.availability_slots where starts_at = '2027-07-02T12:00:00Z'),
    '2027-07-02T12:30:00Z', '2027-07-02T15:30:00Z', 180,
    'Les Bruyères Centre Sportif', false
  )$$,
  'coach can edit an unblocked continuous occurrence'
);
select ok(
  strpos(
    pg_get_functiondef('public.approve_booking(uuid)'::regprocedure),
    'pg_advisory_xact_lock'
  ) < strpos(
    pg_get_functiondef('public.approve_booking(uuid)'::regprocedure),
    'for update'
  ),
  'approval acquires the shared coach lock before any booking row lock'
);

select * from finish();

rollback;
