begin;

select plan(30);

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
  array['uuid', 'text', 'text', 'uuid[]'],
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
  array['uuid'],
  'booking cancellation command remains available'
);

select * from finish();

rollback;
