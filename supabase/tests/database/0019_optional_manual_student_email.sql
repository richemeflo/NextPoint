begin;

select plan(6);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '19000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'optional-email-coach@example.test', '',
    now(), '{}', '{"role":"coach"}', now(), now()
  ),
  (
    '19000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'manual-one@activation.equationpadel.invalid', '', null, '{}',
    '{"role":"eleve","contact_email_missing":true}', now(), now()
  ),
  (
    '19000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'manual-two@activation.equationpadel.invalid', '', null, '{}',
    '{"role":"eleve","contact_email_missing":true}', now(), now()
  );

select lives_ok(
  $$select public.complete_manual_student_provisioning(
      '19000000-0000-4000-8000-000000000001',
      '19000000-0000-4000-8000-000000000002',
      'Élève Sans Email', '', '', 4::smallint, null::smallint,
      'not_specified'::public.student_sex
    )$$,
  'manual provisioning accepts an empty email and age'
);

select results_eq(
  $$select email, age, account_status::text
    from public.student_profiles
    where user_id = '19000000-0000-4000-8000-000000000002'$$,
  $$values (''::text, null::smallint, 'pending_activation'::text)$$,
  'the absent contact email remains empty on the pending profile'
);

select throws_ok(
  $$select public.complete_manual_student_provisioning(
      '19000000-0000-4000-8000-000000000001',
      '19000000-0000-4000-8000-000000000003',
      'Email Invalide', '', 'not-an-email', 4::smallint, null::smallint,
      'not_specified'::public.student_sex
    )$$,
  '22023',
  'invalid manual student profile',
  'a non-empty invalid email is still rejected'
);

select lives_ok(
  $$select public.complete_manual_student_provisioning(
      '19000000-0000-4000-8000-000000000001',
      '19000000-0000-4000-8000-000000000003',
      'Deuxième Sans Email', '', '', 5::smallint, null::smallint,
      'not_specified'::public.student_sex
    )$$,
  'several profiles may omit their email'
);

do $$
begin
  perform public.create_student_activation_token(
    '19000000-0000-4000-8000-000000000001',
    '19000000-0000-4000-8000-000000000002',
    repeat('a', 64),
    now() + interval '24 hours'
  );
  perform public.claim_student_activation_token(repeat('a', 64));
end;
$$;

update auth.users
set email = 'activated-student@example.test',
    email_confirmed_at = now(),
    raw_user_meta_data = raw_user_meta_data
      || '{"contact_email_missing":false}'::jsonb
where id = '19000000-0000-4000-8000-000000000002';

select lives_ok(
  $$select public.finalize_student_activation(
      (
        select id
        from public.student_activation_tokens
        where student_id = '19000000-0000-4000-8000-000000000002'
      ),
      '19000000-0000-4000-8000-000000000002'
    )$$,
  'activation captures the student login email when the profile had none'
);

select results_eq(
  $$select email, account_status::text
    from public.student_profiles
    where user_id = '19000000-0000-4000-8000-000000000002'$$,
  $$values ('activated-student@example.test'::text, 'active'::text)$$,
  'the activated profile receives the login email'
);

select * from finish();

rollback;
