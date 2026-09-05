begin;

select plan(24);

select ok(
  to_regtype('public.email_notification_kind') is not null,
  'email notification kind enum exists'
);
select ok(
  to_regtype('public.email_delivery_status') is not null,
  'email delivery status enum exists'
);
select has_table(
  'public',
  'notification_email_preferences',
  'email preferences table exists'
);
select has_table(
  'public',
  'notification_email_deliveries',
  'private email delivery queue exists'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.notification_email_preferences'::regclass
  ),
  true,
  'RLS is enabled on email preferences'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.notification_email_deliveries'::regclass
  ),
  true,
  'RLS is enabled on the email delivery queue'
);
select ok(
  has_table_privilege('authenticated', 'public.notification_email_preferences', 'select'),
  'authenticated users can read their RLS-filtered preferences'
);
select ok(
  not has_table_privilege('authenticated', 'public.notification_email_deliveries', 'select'),
  'authenticated clients cannot inspect the email delivery queue'
);
select has_function(
  'public',
  'update_student_email_preferences',
  array['boolean', 'boolean'],
  'student preference RPC exists'
);
select has_function(
  'public',
  'update_coach_email_preferences',
  array['boolean', 'boolean', 'smallint', 'time without time zone'],
  'coach preference RPC exists'
);
select has_function(
  'public',
  'enqueue_due_coach_weekly_email_reminders',
  array['timestamp with time zone'],
  'weekly reminder enqueue RPC exists'
);
select has_function(
  'public',
  'claim_pending_email_deliveries',
  array['integer'],
  'email delivery claim RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.update_student_email_preferences(boolean,boolean)',
    'execute'
  ),
  'authenticated students can update their preferences'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.update_coach_email_preferences(boolean,boolean,smallint,time without time zone)',
    'execute'
  ),
  'authenticated coaches can update their preferences'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.update_student_email_preferences(boolean,boolean)',
    'execute'
  ),
  'anonymous users cannot update student preferences'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.update_coach_email_preferences(boolean,boolean,smallint,time without time zone)',
    'execute'
  ),
  'anonymous users cannot update coach preferences'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.enqueue_due_coach_weekly_email_reminders(timestamp with time zone)',
    'execute'
  ),
  'service role can enqueue weekly reminders'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.claim_pending_email_deliveries(integer)',
    'execute'
  ),
  'service role can claim queued emails'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.enqueue_due_coach_weekly_email_reminders(timestamp with time zone)',
    'execute'
  ),
  'authenticated clients cannot enqueue weekly reminders'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.claim_pending_email_deliveries(integer)',
    'execute'
  ),
  'authenticated clients cannot claim queued emails'
);
select has_trigger(
  'public',
  'bookings',
  'bookings_queue_email_notifications',
  'booking status transitions queue opted-in emails'
);
select has_trigger(
  'public',
  'booking_participants',
  'booking_participants_queue_confirmation_email',
  'confirmed group participants queue opted-in emails'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values (
  '22000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'email-pref-student@example.test',
  '',
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"eleve"}',
  now(),
  now()
);

select set_config(
  'request.jwt.claim.sub',
  '22000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select lives_ok(
  $$select public.update_student_email_preferences(true, true)$$,
  'student can opt in through the guarded RPC'
);
select results_eq(
  $$select student_booking_confirmed, student_booking_cancelled
    from public.notification_email_preferences
    where user_id = '22000000-0000-4000-8000-000000000001'$$,
  $$values (true, true)$$,
  'student preference choices are persisted'
);

select * from finish();

rollback;
