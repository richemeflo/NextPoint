begin;

select plan(9);

select is(
  public.is_pricing_public_holiday('2027-05-01'::date),
  true,
  'pricing public holiday helper recognizes fixed French public holidays'
);

select has_function(
  'public',
  'select_booking_pricing_rate',
  array['uuid', 'uuid', 'text', 'integer', 'timestamp with time zone'],
  'contextual pricing selector receives the requested start time'
);
select ok(
  to_regprocedure('public.select_booking_pricing_rate(uuid,uuid,text,integer)') is null,
  'legacy pricing selector without date context is removed'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('24000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pricing-context-coach@example.test', '', now(), '{}', '{"role":"coach"}', now(), now()),
  ('24000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pricing-context-student@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now());

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language
)
values (
  '24000000-0000-4000-8000-000000000002',
  'Pricing Context Student',
  '+33000000242',
  'pricing-context-student@example.test',
  5,
  22,
  'fr'
);

insert into public.pricing_rates (
  id, coach_id, label, amount_cents, currency, duration_minutes, lesson_type,
  applicability_contexts
)
values
  ('24000000-0000-4000-8000-000000000010', '24000000-0000-4000-8000-000000000001', 'General 60', 4500, 'EUR', 60, 'individual', '{}'),
  ('24000000-0000-4000-8000-000000000011', '24000000-0000-4000-8000-000000000001', 'Weekend 60', 4000, 'EUR', 60, 'individual', '{weekend}'),
  ('24000000-0000-4000-8000-000000000012', '24000000-0000-4000-8000-000000000001', 'Student weekend 60', 3900, 'EUR', 60, 'individual', '{student,weekend}'),
  ('24000000-0000-4000-8000-000000000013', '24000000-0000-4000-8000-000000000001', 'Senior weekend 60', 100, 'EUR', 60, 'individual', '{senior,weekend}'),
  ('24000000-0000-4000-8000-000000000014', '24000000-0000-4000-8000-000000000001', 'Personal weekend 60', 3500, 'EUR', 60, 'individual', '{weekend}'),
  ('24000000-0000-4000-8000-000000000015', '24000000-0000-4000-8000-000000000001', 'Personal general 60', 4700, 'EUR', 60, 'individual', '{}'),
  ('24000000-0000-4000-8000-000000000016', '24000000-0000-4000-8000-000000000001', 'Holiday 60', 100, 'EUR', 60, 'individual', '{public_holiday}');

insert into public.pricing_rate_students (pricing_rate_id, student_id)
values
  ('24000000-0000-4000-8000-000000000014', '24000000-0000-4000-8000-000000000002'),
  ('24000000-0000-4000-8000-000000000015', '24000000-0000-4000-8000-000000000002');

select results_eq(
  $$select id from public.select_booking_pricing_rate(
      '24000000-0000-4000-8000-000000000001',
      '24000000-0000-4000-8000-000000000002',
      'individual',
      60,
      '2027-07-03T10:00:00Z'
    )$$,
  $$values ('24000000-0000-4000-8000-000000000010'::uuid)$$,
  'weekday requests choose the minimum generally applicable rate'
);

select results_eq(
  $$select id from public.select_booking_pricing_rate(
      '24000000-0000-4000-8000-000000000001',
      '24000000-0000-4000-8000-000000000002',
      'individual',
      60,
      '2027-07-04T10:00:00Z'
    )$$,
  $$values ('24000000-0000-4000-8000-000000000014'::uuid)$$,
  'weekend requests choose the minimum applicable rate including personalized rates'
);

select results_eq(
  $$select id from public.select_booking_pricing_rate(
      '24000000-0000-4000-8000-000000000001',
      '24000000-0000-4000-8000-000000000002',
      'individual',
      60,
      '2027-05-01T10:00:00Z'
    )$$,
  $$values ('24000000-0000-4000-8000-000000000016'::uuid)$$,
  'public holiday requests include public holiday pricing in the minimum'
);

select set_config('request.jwt.claim.sub', '24000000-0000-4000-8000-000000000001', true);
set local role authenticated;
select lives_ok(
  $$select public.create_availability_range(
    '2027-07-04T09:00:00Z',
    '2027-07-04T12:00:00Z',
    60,
    'Les Bruyères Centre Sportif',
    'none',
    null
  )$$,
  'coach creates a weekend availability range'
);

reset role;
select set_config('request.jwt.claim.sub', '24000000-0000-4000-8000-000000000002', true);
set local role authenticated;
select lives_ok(
  $$select public.request_booking(
    (select id from public.availability_slots where coach_id = '24000000-0000-4000-8000-000000000001'),
    '2027-07-04T10:00:00Z',
    60,
    'individual',
    '',
    '{}'
  )$$,
  'student can request the weekend slot'
);

select results_eq(
  $$select pricing_rate_id from public.bookings
    where student_id = '24000000-0000-4000-8000-000000000002'
      and starts_at = '2027-07-04T10:00:00Z'$$,
  $$values ('24000000-0000-4000-8000-000000000014'::uuid)$$,
  'the booking stores the minimum applicable weekend pricing rate'
);

select * from finish();

rollback;
