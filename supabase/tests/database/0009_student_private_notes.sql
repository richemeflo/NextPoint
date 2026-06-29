begin;

select plan(12);

select has_table(
  'public',
  'student_private_notes',
  'private coach note table exists'
);
select col_is_fk(
  'public',
  'student_private_notes',
  'coach_id',
  'private note references its coach owner'
);
select col_is_fk(
  'public',
  'student_private_notes',
  'student_id',
  'private note references its student'
);
select has_column(
  'public',
  'student_private_notes',
  'content',
  'private note stores content'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.student_private_notes'::regclass
  ),
  true,
  'RLS is enabled on private notes'
);
select ok(
  has_table_privilege(
    'authenticated',
    'public.student_private_notes',
    'select'
  ),
  'authenticated clients can issue RLS-filtered reads'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_private_notes',
    'insert'
  ),
  'clients cannot bypass the explicit save command with direct inserts'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_private_notes',
    'update'
  ),
  'clients cannot bypass the explicit save command with direct updates'
);
select ok(
  not has_table_privilege(
    'anon',
    'public.student_private_notes',
    'select'
  ),
  'anonymous clients cannot read private notes'
);
select ok(
  exists (
    select 1
    from pg_constraint
    where conrelid = 'public.student_private_notes'::regclass
      and contype = 'u'
      and conname = 'student_private_notes_unique_owner_student'
  ),
  'one private note exists per coach and student'
);
select has_function(
  'public',
  'save_student_private_note',
  array['uuid', 'text'],
  'explicit save command exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.save_student_private_note(uuid, text)',
    'execute'
  ),
  'authenticated coaches can call the explicit save command'
);

select * from finish();

rollback;
