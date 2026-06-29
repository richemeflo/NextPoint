begin;

select plan(18);

select has_table(
  'public',
  'student_coach_relationships',
  'student-coach relationships table exists'
);
select col_is_pk(
  'public',
  'student_coach_relationships',
  'id',
  'relationships use a stable identifier'
);
select col_is_fk(
  'public',
  'student_coach_relationships',
  'coach_id',
  'coach relationship references auth users'
);
select col_is_fk(
  'public',
  'student_coach_relationships',
  'student_id',
  'student relationship references auth users'
);
select has_trigger(
  'public',
  'user_roles',
  'user_roles_assign_single_coach',
  'role creation reconciles the P0 single-coach association'
);
select has_trigger(
  'public',
  'student_coach_relationships',
  'student_coach_relationships_set_updated_at',
  'relationship updates refresh updated_at'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.student_coach_relationships'::regclass
  ),
  true,
  'RLS is enabled on student-coach relationships'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'student_coach_relationships'
  ),
  1,
  'relationship participants share one read policy'
);
select ok(
  has_table_privilege(
    'authenticated',
    'public.student_coach_relationships',
    'select'
  ),
  'authenticated participants can read authorized relationships'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_coach_relationships',
    'insert'
  )
    and not has_table_privilege(
      'authenticated',
      'public.student_coach_relationships',
      'update'
    )
    and not has_table_privilege(
      'authenticated',
      'public.student_coach_relationships',
      'delete'
    ),
  'clients cannot mutate automatic relationships'
);
select ok(
  not has_table_privilege(
    'anon',
    'public.student_coach_relationships',
    'select'
  ),
  'anonymous users cannot read relationships'
);
select ok(
  has_table_privilege(
    'service_role',
    'public.student_coach_relationships',
    'select'
  ),
  'trusted server execution can read relationships'
);
select col_has_check(
  'public',
  'student_coach_relationships',
  'status',
  'relationship status is constrained'
);
select col_has_check(
  'public',
  'student_coach_relationships',
  'association_method',
  'association method supports automatic and future flows'
);
select is(
  (
    select count(*)::integer
    from pg_policies
    where schemaname = 'public'
      and tablename = 'student_profiles'
  ),
  4,
  'student profiles add an associated-coach read policy'
);
select has_function(
  'public',
  'assign_student_to_single_coach',
  array['uuid'],
  'idempotent single-coach assignment function exists'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.assign_student_to_single_coach(uuid)',
    'execute'
  ),
  'authenticated clients cannot invoke the assignment function'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.handle_single_coach_relationship()',
    'execute'
  ),
  'authenticated clients cannot invoke the trigger helper'
);
select * from finish();

rollback;
