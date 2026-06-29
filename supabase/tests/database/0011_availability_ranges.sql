begin;

select plan(18);

select ok(
  to_regtype('public.availability_recurrence_type') is not null,
  'availability recurrence enum exists'
);
select has_table('public', 'availability_ranges', 'availability ranges table exists');
select col_is_pk(
  'public',
  'availability_ranges',
  'id',
  'availability ranges use stable ids'
);
select col_is_fk(
  'public',
  'availability_ranges',
  'coach_id',
  'availability range references its coach'
);
select has_column(
  'public',
  'availability_ranges',
  'starts_at',
  'availability range stores UTC start'
);
select has_column(
  'public',
  'availability_ranges',
  'ends_at',
  'availability range stores UTC end'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.availability_ranges'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%ends_at > starts_at%'
  ),
  'availability end is constrained after start'
);
select col_has_check(
  'public',
  'availability_ranges',
  'slot_duration_minutes',
  'availability slot duration is constrained'
);
select col_has_check(
  'public',
  'availability_ranges',
  'location',
  'availability location is constrained'
);
select col_has_check(
  'public',
  'availability_ranges',
  'recurrence_type',
  'availability recurrence is constrained'
);
select has_trigger(
  'public',
  'availability_ranges',
  'availability_ranges_set_updated_at',
  'availability updates refresh updated_at'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.availability_ranges'::regclass
  ),
  true,
  'RLS is enabled on availability ranges'
);
select ok(
  has_table_privilege('authenticated', 'public.availability_ranges', 'select'),
  'authenticated users can issue RLS-filtered reads'
);
select ok(
  not has_table_privilege('authenticated', 'public.availability_ranges', 'insert')
    and not has_table_privilege('authenticated', 'public.availability_ranges', 'update')
    and not has_table_privilege('authenticated', 'public.availability_ranges', 'delete'),
  'authenticated clients mutate ranges only through commands'
);
select has_function(
  'public',
  'create_availability_range',
  array['timestamptz', 'timestamptz', 'integer', 'text', 'availability_recurrence_type'],
  'coach-only availability creation command exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.create_availability_range(timestamptz,timestamptz,integer,text,availability_recurrence_type)',
    'execute'
  ),
  'authenticated coach can call availability creation command'
);
select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'availability_ranges_no_overlap_active'
  ),
  'active availability ranges cannot overlap for one coach'
);
select ok(
  not has_table_privilege('anon', 'public.availability_ranges', 'select'),
  'anonymous users cannot inspect availability ranges'
);

select * from finish();

rollback;
