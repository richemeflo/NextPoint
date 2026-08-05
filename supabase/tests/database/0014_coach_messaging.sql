begin;

select plan(40);

select has_table('public', 'coach_message_threads', 'coach message threads table exists');
select has_table('public', 'coach_messages', 'coach messages table exists');
select col_is_fk(
  'public',
  'coach_message_threads',
  'booking_id',
  'message thread references its booking context'
);
select col_is_fk(
  'public',
  'coach_messages',
  'thread_id',
  'message references its contextual thread'
);
select has_column(
  'public',
  'coach_message_threads',
  'coach_read_at',
  'thread stores the coach read state'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.coach_message_threads'::regclass),
  true,
  'RLS is enabled on coach message threads'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.coach_messages'::regclass),
  true,
  'RLS is enabled on coach messages'
);
select ok(
  has_table_privilege('authenticated', 'public.coach_message_threads', 'select'),
  'authenticated coaches can issue RLS-filtered thread reads'
);
select ok(
  has_table_privilege('authenticated', 'public.coach_messages', 'select'),
  'authenticated coaches can issue RLS-filtered message reads'
);
select ok(
  not has_table_privilege('authenticated', 'public.coach_message_threads', 'insert')
    and not has_table_privilege('authenticated', 'public.coach_message_threads', 'update')
    and not has_table_privilege('authenticated', 'public.coach_message_threads', 'delete'),
  'authenticated clients cannot mutate threads directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.coach_messages', 'insert')
    and not has_table_privilege('authenticated', 'public.coach_messages', 'update')
    and not has_table_privilege('authenticated', 'public.coach_messages', 'delete'),
  'authenticated clients cannot mutate messages directly'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'coach_message_threads'
      and policyname = 'coach_message_threads_select_owner'
  ),
  'thread policy limits reads to the owner coach'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'coach_messages'
      and policyname = 'coach_messages_select_owner'
  ),
  'message policy follows the protected owner thread'
);
select has_function(
  'public',
  'send_coach_message',
  array['uuid', 'text'],
  'guarded coach reply RPC exists'
);
select has_function(
  'public',
  'mark_coach_message_thread_read',
  array['uuid'],
  'guarded coach read-state RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.send_coach_message(uuid,text)',
    'execute'
  ),
  'authenticated coach can reply through the guarded RPC'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.mark_coach_message_thread_read(uuid)',
    'execute'
  ),
  'authenticated coach can mark an owned thread read through the guarded RPC'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'coach_message_threads_owner_activity_idx'
  ),
  'coach inbox activity lookup is indexed'
);

-- Keep the fixture deterministic when the local development database already
-- contains its single allowed coach. The surrounding transaction restores it.
delete from auth.users
where id in (
  select user_id
  from public.user_roles
  where role = 'coach'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'coach-one@example.test',
    '',
    now(),
    '{}',
    '{"role":"coach"}',
    now(),
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@example.test',
    '',
    now(),
    '{}',
    '{"role":"eleve"}',
    now(),
    now()
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student-two@example.test',
    '',
    now(),
    '{}',
    '{"role":"eleve"}',
    now(),
    now()
  );

insert into public.availability_ranges (
  id,
  coach_id,
  starts_at,
  ends_at,
  slot_duration_minutes,
  location,
  recurrence_type
)
values (
  '50000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  now() + interval '2 days',
  now() + interval '2 days 4 hours',
  60,
  'Les Bruyères Centre Sportif',
  'none'
);

insert into public.availability_slots (
  id,
  availability_range_id,
  coach_id,
  starts_at,
  ends_at,
  duration_minutes,
  location,
  status
)
values
  (
    '51000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    now() + interval '2 days',
    now() + interval '2 days 1 hour',
    60,
    'Les Bruyères Centre Sportif',
    'available'
  ),
  (
    '51000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    now() + interval '2 days 2 hours',
    now() + interval '2 days 3 hours',
    60,
    'Les Bruyères Centre Sportif',
    'booked'
  );

insert into public.bookings (
  id,
  availability_slot_id,
  coach_id,
  student_id,
  lesson_type,
  status,
  starts_at,
  ends_at,
  duration_minutes,
  location,
  student_comment,
  expires_at
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '51000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'individual',
    'pending',
    now() + interval '2 days',
    now() + interval '2 days 1 hour',
    60,
    'Les Bruyères Centre Sportif',
    'Je souhaite travailler la volée.',
    now() + interval '9 days'
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '51000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'individual',
    'confirmed',
    now() + interval '2 days 2 hours',
    now() + interval '2 days 3 hours',
    60,
    'Les Bruyères Centre Sportif',
    null,
    null
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    null,
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'individual',
    'pending',
    now() - interval '2 hours',
    now() - interval '1 hour',
    60,
    'Les Bruyères Centre Sportif',
    null,
    now() + interval '7 days'
  ),
  (
    '30000000-0000-4000-8000-000000000004',
    null,
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'individual',
    'pending',
    now() + interval '3 days',
    now() + interval '3 days 1 hour',
    60,
    'Les Bruyères Centre Sportif',
    null,
    now() + interval '10 days'
  ),
  (
    '30000000-0000-4000-8000-000000000005',
    null,
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'individual',
    'confirmed',
    now() + interval '4 days',
    now() + interval '4 days 1 hour',
    60,
    'Les Bruyères Centre Sportif',
    null,
    null
  );

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.coach_message_threads',
  'values (5::bigint)',
  'coach sees the thread linked to the owned booking context'
);
select lives_ok(
  format(
    'select public.send_coach_message(%L::uuid, %L)',
    (select id from public.coach_message_threads where booking_id = '30000000-0000-4000-8000-000000000001'),
    'Réponse du coach'
  ),
  'owner coach can reply to an accessible contextual thread'
);
select throws_ok(
  format(
    'select public.send_coach_message(%L::uuid, %L)',
    (select id from public.coach_message_threads where booking_id = '30000000-0000-4000-8000-000000000001'),
    '   '
  ),
  '22023',
  'message body is required',
  'empty coach reply is refused'
);
select lives_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000005'
  )$$,
  'coach cancellation remains available without a mandatory reason'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '20000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.coach_message_threads',
  'values (0::bigint)',
  'student cannot list coach message threads'
);
select throws_ok(
  $$select public.send_coach_message(
    (select id from public.coach_message_threads),
    'Tentative élève'
  )$$,
  '42501',
  'coach role required',
  'student cannot send a coach message'
);

select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001',
    '   '
  )$$,
  '22023',
  'student cancellation message is required',
  'student cancellation rejects a blank message without mutation'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001',
    E'\t\n\r'
  )$$,
  '22023',
  'student cancellation message is required',
  'student cancellation rejects tabs and line breaks without mutation'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001'
  )$$,
  '22023',
  'student cancellation message is required',
  'student cannot bypass the mandatory message through the default parameter'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001',
    repeat('a', 501)
  )$$,
  '22023',
  'student cancellation message is too long',
  'student cancellation rejects a message over 500 characters'
);
select lives_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001',
    '  Je dois garder mon enfant.  '
  )$$,
  'student can cancel an owned future pending request with a reason'
);
select results_eq(
  $$select status::text from public.bookings
    where id = '30000000-0000-4000-8000-000000000001'$$,
  $$values ('cancelled')$$,
  'pending request is cancelled'
);
select lives_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000002',
    'Empêchement professionnel.'
  )$$,
  'student can cancel an owned future confirmed lesson with a reason'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000003',
    'Je suis arrivé trop tard.'
  )$$,
  '22023',
  'past booking',
  'student cannot cancel a lesson that has started'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000004',
    'Tentative sur une autre demande.'
  )$$,
  'P0002',
  'booking not found',
  'student cannot cancel or detect another student booking'
);
select throws_ok(
  $$select public.cancel_booking(
    '30000000-0000-4000-8000-000000000001',
    'Deuxième tentative.'
  )$$,
  '55000',
  'booking already processed',
  'repeated cancellation creates no duplicate side effects'
);

reset role;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  $$select status::text from public.availability_slots
    where id = '51000000-0000-4000-8000-000000000001'$$,
  $$values ('available')$$,
  'cancelling pending leaves its unreserved slot unchanged'
);
select results_eq(
  $$select status::text from public.availability_slots
    where id = '51000000-0000-4000-8000-000000000002'$$,
  $$values ('available')$$,
  'cancelling confirmed releases its booked slot'
);
select results_eq(
  $$select description from public.student_history_events
    where source_id in (
      '30000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000002'
    ) and event_type = 'booking_cancelled'
    order by description$$,
  $$values ('Empêchement professionnel.'), ('Je dois garder mon enfant.')$$,
  'coach history contains the exact normalized student reasons'
);
select results_eq(
  $$select body from public.notifications
    where booking_id in (
      '30000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000002'
    ) and type = 'booking_cancelled'
    order by body$$,
  $$values ('Empêchement professionnel.'), ('Je dois garder mon enfant.')$$,
  'coach notifications contain the exact student reasons'
);
select results_eq(
  $$select coach_messages.body
    from public.coach_messages
    join public.coach_message_threads
      on coach_message_threads.id = coach_messages.thread_id
    where coach_message_threads.booking_id in (
      '30000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000002'
    ) and coach_messages.body in (
      'Empêchement professionnel.',
      'Je dois garder mon enfant.'
    )
    order by coach_messages.body$$,
  $$values ('Empêchement professionnel.'), ('Je dois garder mon enfant.')$$,
  'coach threads contain the exact student reasons'
);

select throws_ok(
  $$select public.send_coach_message(
    '40000000-0000-4000-8000-000000000001',
    'Tentative objet inaccessible'
  )$$,
  '42501',
  'message thread is not accessible',
  'coach cannot reply to an inaccessible contextual object'
);

select * from finish();

rollback;
