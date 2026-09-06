begin;

select plan(14);

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
  'coach_profiles has owner-only select and write policies'
);
select ok(
  not has_table_privilege('anon', 'public.coach_profiles', 'select'),
  'public visitors cannot read the coach_profiles table directly'
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
select has_function(
  'public',
  'get_public_coach_profile',
  array[]::text[],
  'a dedicated public coach profile function exists'
);
select ok(
  has_function_privilege('anon', 'public.get_public_coach_profile()', 'execute'),
  'public visitors can execute the restricted profile function'
);
select results_eq(
  $$
    select parameter_name::text
    from information_schema.parameters
    where specific_schema = 'public'
      and specific_name like 'get_public_coach_profile_%'
      and parameter_mode = 'OUT'
    order by ordinal_position
  $$,
  $$ values ('display_name'), ('bio'), ('phone'), ('email') $$,
  'the public profile function exposes only allowlisted fields'
);

select * from finish();

rollback;
