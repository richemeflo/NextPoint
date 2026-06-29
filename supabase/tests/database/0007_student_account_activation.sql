begin;

select plan(16);

select ok(
  to_regtype('public.student_account_status') is not null,
  'student account status enum exists'
);
select has_column(
  'public',
  'student_profiles',
  'account_status',
  'student profile stores account lifecycle status'
);
select is(
  (
    select column_default
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_profiles'
      and column_name = 'account_status'
  ),
  '''active''::student_account_status',
  'existing and self-created profiles default to active'
);
select has_table(
  'public',
  'student_activation_tokens',
  'activation token registry exists'
);
select col_is_fk(
  'public',
  'student_activation_tokens',
  'student_id',
  'activation tokens reference auth users'
);
select col_is_fk(
  'public',
  'student_activation_tokens',
  'created_by',
  'activation tokens record the coach creator'
);
select has_column(
  'public',
  'student_activation_tokens',
  'token_hash',
  'only a token hash is persisted'
);
select has_column(
  'public',
  'student_activation_tokens',
  'expires_at',
  'activation token stores its expiration'
);
select has_column(
  'public',
  'student_activation_tokens',
  'consumed_at',
  'activation token stores one-time consumption'
);
select has_column(
  'public',
  'student_activation_tokens',
  'revoked_at',
  'activation token stores regeneration revocation'
);
select is(
  (
    select relrowsecurity
    from pg_class
    where oid = 'public.student_activation_tokens'::regclass
  ),
  true,
  'RLS is enabled on activation tokens'
);
select ok(
  not has_table_privilege(
    'authenticated',
    'public.student_activation_tokens',
    'select'
  ),
  'clients cannot inspect activation token hashes'
);
select has_function(
  'public',
  'complete_manual_student_provisioning',
  array['uuid', 'uuid', 'text', 'text', 'text', 'smallint', 'smallint', 'student_sex'],
  'trusted provisioning transaction exists'
);
select has_function(
  'public',
  'create_student_activation_token',
  array['uuid', 'uuid', 'text', 'timestamptz'],
  'trusted token regeneration transaction exists'
);
select has_function(
  'public',
  'claim_student_activation_token',
  array['text'],
  'trusted one-time token claim exists'
);
select has_function(
  'public',
  'finalize_student_activation',
  array['uuid', 'uuid'],
  'trusted account activation transition exists'
);

select * from finish();

rollback;
