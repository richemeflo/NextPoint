begin;

select plan(16);

select ok(
  to_regtype('public.lesson_pack_status') is not null,
  'lesson pack status enum exists'
);
select has_table('public', 'lesson_packs', 'lesson pack table exists');
select col_is_fk(
  'public',
  'lesson_packs',
  'coach_id',
  'lesson pack references its coach'
);
select col_is_fk(
  'public',
  'lesson_packs',
  'student_id',
  'lesson pack references its student'
);
select has_column(
  'public',
  'lesson_packs',
  'included_sessions',
  'lesson pack stores included sessions'
);
select has_column(
  'public',
  'lesson_packs',
  'used_sessions',
  'lesson pack stores used sessions'
);
select has_column(
  'public',
  'lesson_packs',
  'remaining_sessions',
  'lesson pack exposes remaining sessions'
);
select has_column(
  'public',
  'lesson_packs',
  'status',
  'lesson pack stores status'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.lesson_packs'::regclass
  ),
  true,
  'RLS is enabled on lesson packs'
);
select ok(
  has_table_privilege('authenticated', 'public.lesson_packs', 'select'),
  'authenticated participants can issue RLS-filtered reads'
);
select ok(
  not has_table_privilege('authenticated', 'public.lesson_packs', 'insert'),
  'clients cannot directly assign packs'
);
select ok(
  not has_table_privilege('authenticated', 'public.lesson_packs', 'update'),
  'clients cannot directly alter counters'
);
select has_function(
  'public',
  'assign_lesson_pack',
  array['uuid', 'smallint'],
  'coach-only assignment command exists'
);
select has_function(
  'public',
  'consume_lesson_pack_session',
  array['uuid'],
  'guarded consumption command exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.assign_lesson_pack(uuid, smallint)',
    'execute'
  ),
  'authenticated coach can call assignment command'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.consume_lesson_pack_session(uuid)',
    'execute'
  ),
  'authenticated coach can call guarded consumption command'
);

select * from finish();

rollback;
