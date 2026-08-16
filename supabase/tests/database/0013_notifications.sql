begin;

select plan(41);

select ok(
  to_regtype('public.notification_type') is not null,
  'notification type enum exists'
);
select ok(
  to_regtype('public.push_permission_status') is not null,
  'push permission enum exists'
);
select has_table('public', 'notifications', 'notifications table exists');
select col_is_fk(
  'public',
  'notifications',
  'recipient_id',
  'notification references recipient'
);
select col_is_fk(
  'public',
  'notifications',
  'booking_id',
  'notification can reference booking'
);
select has_column(
  'public',
  'notifications',
  'read_at',
  'notification stores read timestamp'
);
select has_column(
  'public',
  'notifications',
  'link_type',
  'notification stores link type'
);
select has_column(
  'public',
  'notifications',
  'link_id',
  'notification stores link id'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.notifications'::regclass
  ),
  true,
  'RLS is enabled on notifications'
);
select ok(
  has_table_privilege('authenticated', 'public.notifications', 'select'),
  'authenticated users can issue RLS-filtered notification reads'
);
select ok(
  not has_table_privilege('authenticated', 'public.notifications', 'insert')
    and not has_table_privilege('authenticated', 'public.notifications', 'update')
    and not has_table_privilege('authenticated', 'public.notifications', 'delete'),
  'authenticated clients cannot mutate notifications directly'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_select_own'
  ),
  'notifications are readable only through own-recipient RLS'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'notifications_recipient_created_idx'
  ),
  'notification center lookup is indexed'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'notifications_recipient_unread_idx'
  ),
  'unread notification lookup is indexed'
);
select has_table(
  'public',
  'notification_push_preferences',
  'push preferences table exists'
);
select has_table(
  'public',
  'notification_push_tokens',
  'push tokens table exists'
);
select has_table(
  'public',
  'notification_push_delivery_attempts',
  'push delivery attempts table exists'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.notification_push_preferences'::regclass
  ),
  true,
  'RLS is enabled on push preferences'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.notification_push_tokens'::regclass
  ),
  true,
  'RLS is enabled on push tokens'
);
select ok(
  not has_table_privilege('authenticated', 'public.notification_push_tokens', 'select'),
  'clients cannot read stored push tokens directly'
);
select ok(
  has_table_privilege('authenticated', 'public.notification_push_preferences', 'select'),
  'clients can read their RLS-filtered push preference'
);
select has_function(
  'public',
  'update_push_notification_preference',
  array['push_permission_status', 'push_provider', 'text', 'text'],
  'guarded push preference RPC exists'
);
select has_function(
  'public',
  'mark_notification_read',
  array['uuid'],
  'guarded mark read RPC exists'
);
select has_function(
  'public',
  'mark_all_notifications_read',
  array[]::name[],
  'guarded mark all read RPC exists'
);
select has_function(
  'public',
  'delete_notification',
  array['uuid'],
  'guarded notification deletion RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.update_push_notification_preference(push_permission_status,push_provider,text,text)',
    'execute'
  ),
  'authenticated users can update their push preference through RPC'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.delete_notification(uuid)',
    'execute'
  ),
  'authenticated users can delete own notifications through RPC'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.mark_notification_read(uuid)',
    'execute'
  ),
  'authenticated users can mark own notifications read through RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.create_app_notification(uuid,notification_type,text,text,notification_link_type,uuid,uuid,jsonb)',
    'execute'
  ),
  'clients cannot call private notification creation RPC'
);
select has_function(
  'public',
  'request_booking',
  array['uuid', 'timestamp with time zone', 'integer', 'text', 'text', 'uuid[]'],
  'booking request command remains available'
);
select has_function(
  'public',
  'approve_booking',
  array['uuid'],
  'booking approval command remains available'
);
select has_function(
  'public',
  'cancel_booking',
  array['uuid', 'text'],
  'booking cancellation command remains available'
);
select ok(
  to_regprocedure('public.cancel_booking(uuid)') is null,
  'legacy cancellation signature cannot bypass the student message'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.cancel_booking(uuid,text)',
    'execute'
  ),
  'authenticated users can cancel through the guarded command'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '13000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'notification-owner@example.test', '',
    now(), '{}', '{"role":"eleve"}', now(), now()
  ),
  (
    '13000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'notification-other@example.test', '',
    now(), '{}', '{"role":"eleve"}', now(), now()
  );

insert into public.notifications (
  id, recipient_id, type, title, body, created_at
)
values
  (
    '13000000-0000-4000-8000-000000000011',
    '13000000-0000-4000-8000-000000000001',
    'booking_approved', 'Cours confirmé', 'Votre cours est confirmé.', now()
  ),
  (
    '13000000-0000-4000-8000-000000000012',
    '13000000-0000-4000-8000-000000000002',
    'booking_approved', 'Cours confirmé', 'Votre cours est confirmé.', now()
  );

insert into public.notification_push_tokens (
  id, user_id, provider, device_id, token
)
values (
  '13000000-0000-4000-8000-000000000021',
  '13000000-0000-4000-8000-000000000001',
  'expo',
  'ios:legacy-build:legacy-device-name',
  'ExponentPushToken[test-installation]'
);

select set_config(
  'request.jwt.claim.sub',
  '13000000-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select lives_ok(
  $$
    select public.update_push_notification_preference(
      'granted',
      'expo',
      '13000000-0000-4000-8000-000000000099',
      'ExponentPushToken[test-installation]'
    )
  $$,
  'an installation UUID can replace a legacy device identifier'
);

select is(
  public.delete_notification('13000000-0000-4000-8000-000000000011'),
  '13000000-0000-4000-8000-000000000011'::uuid,
  'a recipient can delete their own notification'
);
select throws_ok(
  $$select public.delete_notification('13000000-0000-4000-8000-000000000012')$$,
  '42501',
  'notification not found',
  'a recipient cannot delete another user notification'
);

reset role;

select is(
  (
    select is_active
    from public.notification_push_tokens
    where id = '13000000-0000-4000-8000-000000000021'
  ),
  false,
  'the legacy push token row is deactivated'
);
select is(
  (
    select count(*)
    from public.notification_push_tokens
    where token = 'ExponentPushToken[test-installation]'
      and is_active
  ),
  1::bigint,
  'only the installation UUID remains active for a provider token'
);

select is(
  (
    select count(*)
    from public.notifications
    where id = '13000000-0000-4000-8000-000000000011'
  ),
  0::bigint,
  'the owned notification is removed'
);
select is(
  (
    select count(*)
    from public.notifications
    where id = '13000000-0000-4000-8000-000000000012'
  ),
  1::bigint,
  'the other user notification remains stored'
);

select * from finish();

rollback;
