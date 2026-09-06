begin;

select plan(3);

select has_function(
  'public',
  'get_related_booking_participants',
  array['uuid[]'],
  'related booking participant RPC exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.get_related_booking_participants(uuid[])',
    'execute'
  ),
  'authenticated users can load participants for related bookings'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.get_related_booking_participants(uuid[])',
    'execute'
  ),
  'anonymous users cannot load booking participant names'
);

select * from finish();

rollback;
