create index if not exists notification_push_tokens_provider_token_idx
  on public.notification_push_tokens (provider, token);

create or replace function public.update_push_notification_preference(
  p_permission_status public.push_permission_status,
  p_provider public.push_provider,
  p_device_id text,
  p_token text
)
returns public.notification_push_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_device_id text := coalesce(nullif(trim(p_device_id), ''), 'default');
  normalized_token text := nullif(trim(coalesce(p_token, '')), '');
  updated_preference public.notification_push_preferences;
begin
  if current_user_id is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  insert into public.notification_push_preferences (
    user_id,
    permission_status,
    provider
  )
  values (
    current_user_id,
    p_permission_status,
    p_provider
  )
  on conflict (user_id) do update
  set permission_status = excluded.permission_status,
      provider = excluded.provider,
      updated_at = now()
  returning * into updated_preference;

  if p_permission_status = 'granted'
    and p_provider <> 'none'
    and normalized_token is not null
  then
    -- A provider token identifies one app installation. Retire any row left
    -- behind by the former device-derived identifier before registering the
    -- installation UUID, including a row attached to a previous account.
    update public.notification_push_tokens
    set is_active = false,
        updated_at = now()
    where provider = p_provider
      and token = normalized_token
      and (
        user_id <> current_user_id
        or device_id <> normalized_device_id
      );

    insert into public.notification_push_tokens (
      user_id,
      provider,
      device_id,
      token,
      is_active,
      last_seen_at
    )
    values (
      current_user_id,
      p_provider,
      normalized_device_id,
      normalized_token,
      true,
      now()
    )
    on conflict (user_id, provider, device_id) do update
    set token = excluded.token,
        is_active = true,
        last_seen_at = now(),
        updated_at = now();
  else
    update public.notification_push_tokens
    set is_active = false,
        updated_at = now()
    where user_id = current_user_id
      and (p_device_id is null or device_id = normalized_device_id);
  end if;

  return updated_preference;
end;
$$;
