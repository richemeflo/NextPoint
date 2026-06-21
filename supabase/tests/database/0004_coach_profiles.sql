begin;

select plan(11);

select has_table('public', 'coach_profiles', 'coach_profiles table exists');
select col_is_pk(
  'public',
  'coach_profiles',
  'user_id',
  'coach profile is keyed by auth user'
);
select has_trigger(
  'public',
  'coach_profiles',
  'coach_profiles_set_updated_at',
  'coach profile updates refresh updated_at'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.coach_profiles'::regclass),
  true,
  'RLS is enabled on coach_profiles'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coach_profiles'
  ),
  3,
  'coach_profiles has public select and owner coach write policies'
);
select ok(
  has_table_privilege('anon', 'public.coach_profiles', 'select'),
  'public visitors can read the coach profile'
);
select ok(
  not has_table_privilege('anon', 'public.coach_profiles', 'insert')
    and not has_table_privilege('anon', 'public.coach_profiles', 'update'),
  'public visitors cannot modify the coach profile'
);
select ok(
  has_table_privilege('authenticated', 'public.coach_profiles', 'select')
    and has_table_privilege('authenticated', 'public.coach_profiles', 'insert')
    and has_table_privilege('authenticated', 'public.coach_profiles', 'update'),
  'authenticated coach receives the required table privileges'
);
select ok(
  not has_table_privilege('authenticated', 'public.coach_profiles', 'delete'),
  'authenticated users cannot delete the coach profile'
);
select ok(
  has_table_privilege('service_role', 'public.coach_profiles', 'select'),
  'trusted server execution can read the coach profile'
);
select col_has_check(
  'public',
  'coach_profiles',
  'bio',
  'coach bio length is constrained'
);

select * from finish();

rollback;
