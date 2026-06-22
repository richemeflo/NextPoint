begin;

select plan(15);

select ok(
  to_regtype('public.app_language') is not null,
  'app_language enum exists'
);
select ok(
  to_regtype('public.student_sex') is not null,
  'student_sex enum exists'
);
select has_table('public', 'student_profiles', 'student_profiles table exists');
select col_is_pk(
  'public',
  'student_profiles',
  'user_id',
  'student profile is keyed by auth user'
);
select has_trigger(
  'public',
  'student_profiles',
  'student_profiles_set_updated_at',
  'student profile updates refresh updated_at'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.student_profiles'::regclass),
  true,
  'RLS is enabled on student_profiles'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'student_profiles'
  ),
  4,
  'student_profiles has owner writes plus owner and associated-coach reads'
);
select ok(
  has_table_privilege('authenticated', 'public.student_profiles', 'select')
    and has_table_privilege('authenticated', 'public.student_profiles', 'insert')
    and has_table_privilege('authenticated', 'public.student_profiles', 'update'),
  'authenticated students have the required profile privileges'
);
select ok(
  not has_table_privilege('authenticated', 'public.student_profiles', 'delete'),
  'authenticated users cannot delete student profiles'
);
select ok(
  not has_table_privilege('anon', 'public.student_profiles', 'select'),
  'anonymous users cannot read student profiles'
);
select ok(
  has_table_privilege('service_role', 'public.student_profiles', 'select'),
  'trusted server execution can read student profiles'
);
select col_has_check(
  'public',
  'student_profiles',
  'padel_level',
  'padel level is constrained'
);
select col_has_check(
  'public',
  'student_profiles',
  'age',
  'age is constrained'
);
select has_column(
  'public',
  'student_profiles',
  'sex',
  'student profile stores a controlled sex value'
);
select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_profiles'
      and column_name = 'sex'
  ),
  '''not_specified''::student_sex',
  'existing and new profiles default to not_specified'
);

select * from finish();

rollback;
