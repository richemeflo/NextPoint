begin;

select plan(21);

select ok(
  to_regtype('public.availability_slot_status') is not null,
  'availability slot status enum exists'
);
select has_table('public', 'availability_slots', 'availability slots table exists');
select col_is_pk(
  'public',
  'availability_slots',
  'id',
  'availability slots use stable ids'
);
select col_is_fk(
  'public',
  'availability_slots',
  'availability_range_id',
  'slot references its source range'
);
select col_is_fk(
  'public',
  'availability_slots',
  'coach_id',
  'slot references its coach'
);
select has_column(
  'public',
  'availability_slots',
  'starts_at',
  'slot stores UTC start'
);
select has_column(
  'public',
  'availability_slots',
  'ends_at',
  'slot stores UTC end'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.availability_slots'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%ends_at > starts_at%'
  ),
  'slot end is constrained after start'
);
select col_has_check(
  'public',
  'availability_slots',
  'duration_minutes',
  'slot duration is constrained'
);
select col_has_check(
  'public',
  'availability_slots',
  'location',
  'slot location is constrained'
);
select has_column(
  'public',
  'availability_slots',
  'status',
  'slot stores its availability status'
);
select has_trigger(
  'public',
  'availability_slots',
  'availability_slots_set_updated_at',
  'slot updates refresh updated_at'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.availability_slots'::regclass
  ),
  true,
  'RLS is enabled on availability slots'
);
select ok(
  has_table_privilege('authenticated', 'public.availability_slots', 'select'),
  'authenticated users can issue RLS-filtered slot reads'
);
select ok(
  not has_table_privilege('authenticated', 'public.availability_slots', 'insert')
    and not has_table_privilege('authenticated', 'public.availability_slots', 'update')
    and not has_table_privilege('authenticated', 'public.availability_slots', 'delete'),
  'authenticated clients cannot mutate generated slots directly'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'availability_slots_range_start_unique'
  ),
  'a range cannot generate duplicate slot starts'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'availability_slots_requestable_idx'
  ),
  'requestable slot lookup is indexed'
);
select has_function(
  'public',
  'create_availability_range',
  array['timestamptz', 'timestamptz', 'integer', 'text', 'availability_recurrence_type'],
  'availability creation command still exists after slot generation'
);
select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'availability_slots'
      and column_name = 'status'
      and column_default = '''available''::availability_slot_status'
  ),
  'generated slots default to available'
);
select ok(
  not has_table_privilege('anon', 'public.availability_slots', 'select'),
  'anonymous users cannot inspect availability slots'
);
select ok(
  has_table_privilege('service_role', 'public.availability_slots', 'update'),
  'trusted server execution can later block confirmed slots'
);

select * from finish();

rollback;
