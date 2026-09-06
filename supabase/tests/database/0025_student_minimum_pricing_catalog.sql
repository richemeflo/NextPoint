begin;

select plan(4);

select has_function(
  'public', 'get_student_minimum_pricing_rates', array[]::text[],
  'student minimum pricing catalog RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.get_student_minimum_pricing_rates()', 'execute'),
  'authenticated students can load their minimum pricing catalog'
);
select ok(
  not has_function_privilege('anon', 'public.get_student_minimum_pricing_rates()', 'execute'),
  'anonymous users cannot load a student pricing catalog'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('25000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'catalog-coach@example.test', '', now(), '{}', '{"role":"coach"}', now(), now()),
  ('25000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'catalog-student@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now()),
  ('25000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'catalog-other-student@example.test', '', now(), '{}', '{"role":"eleve"}', now(), now());

insert into public.student_profiles (
  user_id, full_name, phone, email, padel_level, age, preferred_language
)
values (
  '25000000-0000-4000-8000-000000000002',
  'Catalog Student', '+33000000252', 'catalog-student@example.test', 5, 22, 'fr'
);

insert into public.pricing_rates (
  id, coach_id, label, amount_cents, currency, duration_minutes, lesson_type,
  applicability_contexts
)
values
  ('25000000-0000-4000-8000-000000000010', '25000000-0000-4000-8000-000000000001', 'General 60', 4500, 'EUR', 60, 'individual', '{}'),
  ('25000000-0000-4000-8000-000000000011', '25000000-0000-4000-8000-000000000001', 'Weekend 60', 4000, 'EUR', 60, 'individual', '{weekend}'),
  ('25000000-0000-4000-8000-000000000012', '25000000-0000-4000-8000-000000000001', 'Student weekend 60', 3900, 'EUR', 60, 'individual', '{student,weekend}'),
  ('25000000-0000-4000-8000-000000000013', '25000000-0000-4000-8000-000000000001', 'Senior weekend 60', 100, 'EUR', 60, 'individual', '{senior,weekend}'),
  ('25000000-0000-4000-8000-000000000014', '25000000-0000-4000-8000-000000000001', 'Personal weekend 60', 3500, 'EUR', 60, 'individual', '{weekend}'),
  ('25000000-0000-4000-8000-000000000015', '25000000-0000-4000-8000-000000000001', 'Other student weekend 60', 2000, 'EUR', 60, 'individual', '{weekend}'),
  ('25000000-0000-4000-8000-000000000016', '25000000-0000-4000-8000-000000000001', 'Holiday 60', 100, 'EUR', 60, 'individual', '{public_holiday}');

insert into public.pricing_rate_students (pricing_rate_id, student_id)
values
  ('25000000-0000-4000-8000-000000000014', '25000000-0000-4000-8000-000000000002'),
  ('25000000-0000-4000-8000-000000000015', '25000000-0000-4000-8000-000000000003');

select set_config('request.jwt.claim.sub', '25000000-0000-4000-8000-000000000002', true);
set local role authenticated;

select results_eq(
  $$select id from public.get_student_minimum_pricing_rates()
    where lesson_type = 'individual' and duration_minutes = 60
    order by amount_cents, id$$,
  $$values
    ('25000000-0000-4000-8000-000000000016'::uuid),
    ('25000000-0000-4000-8000-000000000014'::uuid),
    ('25000000-0000-4000-8000-000000000010'::uuid)$$,
  'catalog keeps the minimum rates for holiday, weekend, and weekday contexts and includes the targeted rate only for its student'
);

select * from finish();

rollback;
