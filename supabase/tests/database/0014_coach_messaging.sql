begin;

select plan(24);

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
  );

insert into public.bookings (
  id,
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
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'individual',
    'pending',
    '2026-07-20T10:00:00Z',
    '2026-07-20T11:00:00Z',
    60,
    'Les Bruyères Centre Sportif',
    'Je souhaite travailler la volée.',
    '2026-07-27T10:00:00Z'
  );

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select results_eq(
  'select count(*) from public.coach_message_threads',
  'values (1::bigint)',
  'coach sees the thread linked to the owned booking context'
);
select lives_ok(
  format(
    'select public.send_coach_message(%L::uuid, %L)',
    (select id from public.coach_message_threads limit 1),
    'Réponse du coach'
  ),
  'owner coach can reply to an accessible contextual thread'
);
select throws_ok(
  format(
    'select public.send_coach_message(%L::uuid, %L)',
    (select id from public.coach_message_threads limit 1),
    '   '
  ),
  '22023',
  'message body is required',
  'empty coach reply is refused'
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

reset role;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

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
