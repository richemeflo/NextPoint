begin;

select plan(13);

select ok(
  to_regtype('public.student_history_event_type') is not null,
  'student history event type enum exists'
);
select ok(
  to_regtype('public.student_history_event_status') is not null,
  'student history status enum exists'
);
select has_table(
  'public',
  'student_history_events',
  'student history read model exists'
);
select col_is_fk(
  'public',
  'student_history_events',
  'coach_id',
  'history event references its coach'
);
select col_is_fk(
  'public',
  'student_history_events',
  'student_id',
  'history event references its student'
);
select has_column(
  'public',
  'student_history_events',
  'event_type',
  'history event stores a typed activity'
);
select has_column(
  'public',
  'student_history_events',
  'status',
  'history event stores a readable status'
);
select has_column(
  'public',
  'student_history_events',
  'occurred_at',
  'history event stores its business date'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.student_history_events'::regclass
  ),
  true,
  'RLS is enabled on student history'
);
select ok(
  has_table_privilege(
    'authenticated',
    'public.student_history_events',
    'select'
  ),
  'authenticated users can issue RLS-filtered history reads'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_history_events',
    'insert'
  ),
  'clients cannot forge history events'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_history_events',
    'update'
  ),
  'clients cannot rewrite history events'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_history_events',
    'delete'
  ),
  'clients cannot delete history events'
);

select * from finish();

rollback;
