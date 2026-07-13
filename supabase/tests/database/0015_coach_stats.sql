begin;

select plan(10);

select has_function(
  'public',
  'get_coach_stats',
  array['timestamp with time zone', 'timestamp with time zone'],
  'coach stats read model RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_coach_stats(timestamp with time zone,timestamp with time zone)',
    'execute'
  ),
  'authenticated users can call the guarded stats RPC'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'coach@example.test', '', now(), '{}',
    '{"role":"coach"}', now(), now()
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'student-one@example.test', '', now(), '{}',
    '{"role":"eleve"}', now(), now()
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'student-two@example.test', '', now(), '{}',
    '{"role":"eleve"}', now(), now()
  );

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language
)
values
  ('20000000-0000-4000-8000-000000000001', 'Ada Lovelace', '+33000000001', 'ada@example.test', 5, 30, 'fr'),
  ('20000000-0000-4000-8000-000000000002', 'Grace Hopper', '+33000000002', 'grace@example.test', 6, 32, 'fr');

insert into public.pricing_rates (
  id, coach_id, label, amount_cents, currency, duration_minutes, lesson_type
)
values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Cours 1h', 4500, 'EUR', 60, 'individual'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'Cours 1h30', 6000, 'EUR', 90, 'individual');

insert into public.bookings (
  id, coach_id, student_id, pricing_rate_id, lesson_type, status, origin,
  starts_at, ends_at, duration_minutes, location
)
values
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 'individual', 'confirmed', 'coach_created', '2026-07-02T10:00:00Z', '2026-07-02T11:00:00Z', 60, 'Les Bruyères Centre Sportif'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000002', 'individual', 'modified', 'coach_created', '2026-07-03T10:00:00Z', '2026-07-03T11:30:00Z', 90, 'Les Bruyères Centre Sportif'),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'individual', 'cancelled', 'coach_created', '2026-07-04T10:00:00Z', '2026-07-04T11:00:00Z', 60, 'Les Bruyères Centre Sportif'),
  ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'individual', 'refused', 'coach_created', '2026-07-05T10:00:00Z', '2026-07-05T11:00:00Z', 60, 'Les Bruyères Centre Sportif'),
  ('40000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'individual', 'expired', 'coach_created', '2026-07-06T10:00:00Z', '2026-07-06T11:00:00Z', 60, 'Les Bruyères Centre Sportif'),
  ('40000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 'individual', 'confirmed', 'coach_created', '2026-06-20T10:00:00Z', '2026-06-20T11:00:00Z', 60, 'Les Bruyères Centre Sportif');

insert into public.booking_participants (booking_id, student_id)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001');

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
set local role authenticated;

select results_eq(
  $$select completed_courses from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  'values (2::bigint)',
  'only confirmed and still-confirmed modified courses are counted'
);
select results_eq(
  $$select completed_minutes from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  'values (150::bigint)',
  'completed minutes are aggregated for the requested period'
);
select results_eq(
  $$select estimated_revenue_cents from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  'values (10500::bigint)',
  'estimated revenue uses available applied pricing without payment data'
);
select results_eq(
  $$select currency from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  $$values ('EUR'::text)$$,
  'estimated revenue keeps the available pricing currency'
);
select results_eq(
  $$select active_students -> 0 ->> 'fullName' from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  $$values ('Ada Lovelace'::text)$$,
  'active students are derived only from matching completed courses'
);
select results_eq(
  $$select completed_courses from public.get_coach_stats('2026-05-01T00:00:00Z', '2026-06-01T00:00:00Z')$$,
  'values (0::bigint)',
  'an empty period returns a usable zero aggregate'
);
select throws_ok(
  $$select * from public.get_coach_stats('2026-08-01T00:00:00Z', '2026-07-01T00:00:00Z')$$,
  '22023',
  'invalid stats period',
  'an invalid period is refused'
);

reset role;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
set local role authenticated;

select throws_ok(
  $$select * from public.get_coach_stats('2026-07-01T00:00:00Z', '2026-08-01T00:00:00Z')$$,
  '42501',
  'coach role required',
  'a student cannot access private coach statistics'
);

select * from finish();

rollback;
