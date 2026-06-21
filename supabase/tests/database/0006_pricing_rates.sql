begin;

select plan(20);

select has_table('public', 'pricing_rates', 'pricing rates table exists');
select has_table(
  'public',
  'pricing_rate_students',
  'targeted pricing students table exists'
);
select col_is_pk('public', 'pricing_rates', 'id', 'pricing rates use stable ids');
select col_is_fk(
  'public',
  'pricing_rates',
  'coach_id',
  'pricing rate belongs to an auth user'
);
select col_has_check(
  'public',
  'pricing_rates',
  'amount_cents',
  'pricing amount is constrained'
);
select col_has_check(
  'public',
  'pricing_rates',
  'duration_minutes',
  'pricing duration is constrained'
);
select col_has_check(
  'public',
  'pricing_rates',
  'currency',
  'pricing currency is constrained'
);
select has_trigger(
  'public',
  'pricing_rates',
  'pricing_rates_set_updated_at',
  'pricing updates refresh updated_at'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.pricing_rates'::regclass),
  true,
  'RLS is enabled on pricing rates'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.pricing_rate_students'::regclass
  ),
  true,
  'RLS is enabled on targeted pricing students'
);
select ok(
  has_table_privilege('anon', 'public.pricing_rates', 'select'),
  'public visitors can read published rates'
);
select ok(
  not has_table_privilege('anon', 'public.pricing_rates', 'insert')
    and not has_table_privilege('anon', 'public.pricing_rates', 'update')
    and not has_table_privilege('anon', 'public.pricing_rates', 'delete'),
  'public visitors cannot mutate rates'
);
select ok(
  has_table_privilege('authenticated', 'public.pricing_rates', 'select'),
  'authenticated users can read authorized rates'
);
select ok(
  not has_table_privilege('authenticated', 'public.pricing_rates', 'insert')
    and not has_table_privilege('authenticated', 'public.pricing_rates', 'update')
    and not has_table_privilege('authenticated', 'public.pricing_rates', 'delete'),
  'authenticated clients mutate rates only through commands'
);
select has_function(
  'public',
  'save_pricing_rate',
  array[
    'uuid',
    'text',
    'integer',
    'text',
    'integer',
    'text',
    'boolean',
    'text[]',
    'uuid[]'
  ],
  'transactional save pricing command exists'
);
select has_function(
  'public',
  'delete_pricing_rate',
  array['uuid'],
  'soft delete pricing command exists'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.save_pricing_rate(uuid,text,integer,text,integer,text,boolean,text[],uuid[])',
    'execute'
  ),
  'authenticated coach can call the save command'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.delete_pricing_rate(uuid)',
    'execute'
  ),
  'authenticated coach can call the delete command'
);
select ok(
  not has_table_privilege(
    'anon',
    'public.pricing_rate_students',
    'select'
  ),
  'public visitors cannot inspect targeted student ids'
);
select ok(
  has_table_privilege('service_role', 'public.pricing_rates', 'select'),
  'trusted server execution can read rates'
);

select * from finish();

rollback;
