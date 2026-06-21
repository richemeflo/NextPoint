begin;

select plan(11);

select ok(
  to_regtype('public.app_role') is not null,
  'app_role enum exists'
);
select has_table('public', 'user_roles', 'user_roles table exists');
select col_is_pk('public', 'user_roles', 'user_id', 'user_id is the primary key');
select has_trigger(
  'auth',
  'users',
  'on_auth_user_created_set_role',
  'auth signup creates a trusted role'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass),
  true,
  'RLS is enabled on user_roles'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'user_roles'),
  1,
  'user_roles has one RLS policy'
);
select is(
  (
    select cmd
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_roles'
      and policyname = 'user_roles_select_own'
  ),
  'SELECT',
  'the client policy is read-only'
);
select ok(
  has_table_privilege('authenticated', 'public.user_roles', 'select'),
  'authenticated users can select roles through RLS'
);
select ok(
  not has_table_privilege('anon', 'public.user_roles', 'select'),
  'anonymous users cannot read roles'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_roles', 'insert')
    and not has_table_privilege('authenticated', 'public.user_roles', 'update')
    and not has_table_privilege('authenticated', 'public.user_roles', 'delete'),
  'authenticated users cannot mutate trusted roles'
);
select ok(
  has_table_privilege('service_role', 'public.user_roles', 'select'),
  'trusted server execution can read roles'
);

select * from finish();

rollback;
