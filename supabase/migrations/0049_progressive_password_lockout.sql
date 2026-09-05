create table public.password_sign_in_lockouts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_failed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.password_sign_in_lockouts enable row level security;

comment on table public.password_sign_in_lockouts is
  'Server-only state used by the Supabase password verification hook.';

create or replace function public.hook_password_verification_attempt(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  account_id uuid;
  password_is_valid boolean;
  state public.password_sign_in_lockouts%rowtype;
  next_failed_attempts integer;
  lock_minutes integer;
begin
  account_id := (event->>'user_id')::uuid;
  password_is_valid := (event->>'valid')::boolean;

  insert into public.password_sign_in_lockouts (user_id)
  values (account_id)
  on conflict (user_id) do nothing;

  select *
  into state
  from public.password_sign_in_lockouts
  where user_id = account_id
  for update;

  if state.locked_until is not null and state.locked_until > now() then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 429,
        'message', 'Sign-in temporarily unavailable. Please try again later.'
      )
    );
  end if;

  if password_is_valid then
    delete from public.password_sign_in_lockouts
    where user_id = account_id;

    return jsonb_build_object('decision', 'continue');
  end if;

  next_failed_attempts := state.failed_attempts + 1;
  lock_minutes := case
    when next_failed_attempts % 5 <> 0 then 0
    when next_failed_attempts = 5 then 5
    when next_failed_attempts = 10 then 15
    when next_failed_attempts >= 45 then 1440
    else (30 * power(2, (next_failed_attempts / 5) - 3))::integer
  end;

  update public.password_sign_in_lockouts
  set failed_attempts = next_failed_attempts,
      locked_until = case
        when lock_minutes > 0 then now() + make_interval(mins => lock_minutes)
        else null
      end,
      last_failed_at = now(),
      updated_at = now()
  where user_id = account_id;

  if lock_minutes > 0 then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 429,
        'message', 'Sign-in temporarily unavailable. Please try again later.'
      )
    );
  end if;

  return jsonb_build_object('decision', 'continue');
exception
  when invalid_text_representation or not_null_violation then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 500,
        'message', 'Invalid password verification hook payload.'
      )
    );
end;
$$;

comment on function public.hook_password_verification_attempt(jsonb) is
  'Applies progressive account lockouts after each five consecutive password failures.';

revoke all on table public.password_sign_in_lockouts from public;
revoke all on table public.password_sign_in_lockouts from anon, authenticated;
grant select, insert, update, delete on table public.password_sign_in_lockouts
  to supabase_auth_admin;

revoke all on function public.hook_password_verification_attempt(jsonb) from public;
revoke execute on function public.hook_password_verification_attempt(jsonb)
  from anon, authenticated;
grant execute on function public.hook_password_verification_attempt(jsonb)
  to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
