create type public.notification_type as enum (
  'booking_requested',
  'booking_approved',
  'booking_refused',
  'booking_cancelled',
  'booking_modified'
);

create type public.notification_link_type as enum (
  'booking'
);

create type public.push_permission_status as enum (
  'granted',
  'denied',
  'undetermined',
  'unavailable'
);

create type public.push_provider as enum (
  'expo',
  'web',
  'none'
);

create type public.push_delivery_status as enum (
  'pending',
  'sent',
  'failed',
  'skipped'
);

create table public.notification_push_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  permission_status public.push_permission_status not null default 'undetermined',
  provider public.push_provider not null default 'none',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.notification_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider public.push_provider not null,
  device_id text not null default 'default'
    check (char_length(trim(device_id)) between 1 and 120),
  token text not null check (char_length(trim(token)) between 1 and 512),
  is_active boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, device_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(trim(title)) between 1 and 120),
  body text not null check (char_length(trim(body)) between 1 and 500),
  read_at timestamptz,
  link_type public.notification_link_type,
  link_id uuid,
  booking_id uuid references public.bookings(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (link_type is null and link_id is null)
    or (link_type is not null and link_id is not null)
  )
);

create table public.notification_push_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  push_token_id uuid references public.notification_push_tokens(id) on delete set null,
  provider public.push_provider,
  status public.push_delivery_status not null,
  error_code text,
  created_at timestamptz not null default now()
);

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create index notifications_booking_idx
  on public.notifications (booking_id)
  where booking_id is not null;

create index notification_push_tokens_active_idx
  on public.notification_push_tokens (user_id, provider)
  where is_active;

create trigger notification_push_preferences_set_updated_at
  before update on public.notification_push_preferences
  for each row execute function public.set_updated_at();

create trigger notification_push_tokens_set_updated_at
  before update on public.notification_push_tokens
  for each row execute function public.set_updated_at();

create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

alter table public.notification_push_preferences enable row level security;
alter table public.notification_push_tokens enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_push_delivery_attempts enable row level security;

revoke all on table public.notification_push_preferences from anon, authenticated;
revoke all on table public.notification_push_tokens from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.notification_push_delivery_attempts from anon, authenticated;

grant select on table public.notification_push_preferences to authenticated;
grant select on table public.notifications to authenticated;
grant all on table public.notification_push_preferences to service_role;
grant all on table public.notification_push_tokens to service_role;
grant all on table public.notifications to service_role;
grant all on table public.notification_push_delivery_attempts to service_role;

create policy notification_push_preferences_select_own
  on public.notification_push_preferences
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (recipient_id = (select auth.uid()));

create or replace function public.create_app_notification(
  p_recipient_id uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_link_type public.notification_link_type,
  p_link_id uuid,
  p_booking_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns public.notifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_notification public.notifications;
  recipient_preference public.notification_push_preferences;
  active_token public.notification_push_tokens;
  queued_count integer := 0;
begin
  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    link_type,
    link_id,
    booking_id,
    metadata
  )
  values (
    p_recipient_id,
    p_type,
    trim(p_title),
    trim(p_body),
    p_link_type,
    p_link_id,
    p_booking_id,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into created_notification;

  select *
    into recipient_preference
  from public.notification_push_preferences
  where user_id = p_recipient_id;

  if recipient_preference.permission_status = 'granted' then
    for active_token in
      select *
      from public.notification_push_tokens
      where user_id = p_recipient_id
        and is_active
    loop
      queued_count := queued_count + 1;
      insert into public.notification_push_delivery_attempts (
        notification_id,
        recipient_id,
        push_token_id,
        provider,
        status
      )
      values (
        created_notification.id,
        p_recipient_id,
        active_token.id,
        active_token.provider,
        'pending'
      );
    end loop;
  end if;

  if queued_count = 0 then
    insert into public.notification_push_delivery_attempts (
      notification_id,
      recipient_id,
      provider,
      status,
      error_code
    )
    values (
      created_notification.id,
      p_recipient_id,
      coalesce(recipient_preference.provider, 'none'::public.push_provider),
      'skipped',
      case
        when recipient_preference.permission_status = 'granted' then 'no_active_token'
        when recipient_preference.permission_status is null then 'permission_unknown'
        else 'permission_' || recipient_preference.permission_status::text
      end
    );
  end if;

  return created_notification;
end;
$$;

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
    and nullif(trim(coalesce(p_token, '')), '') is not null
  then
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
      trim(p_token),
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

create or replace function public.mark_notification_read(p_notification_id uuid)
returns public.notifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_notification public.notifications;
begin
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and recipient_id = auth.uid()
  returning * into updated_notification;

  if updated_notification.id is null then
    raise exception 'notification not found' using errcode = '42501';
  end if;

  return updated_notification;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  update public.notifications
  set read_at = now()
  where recipient_id = auth.uid()
    and read_at is null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create or replace function public.request_booking(
  p_slot_id uuid,
  p_lesson_type text,
  p_student_comment text,
  p_participant_ids uuid[]
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester_id uuid := auth.uid();
  target_slot public.availability_slots;
  selected_rate public.pricing_rates;
  pending_on_slot integer;
  pending_for_student integer;
  created_booking public.bookings;
  participant_id uuid;
begin
  if requester_id is null
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = requester_id
        and user_roles.role = 'eleve'
    )
  then
    raise exception 'student role required' using errcode = '42501';
  end if;

  select *
    into target_slot
  from public.availability_slots
  where id = p_slot_id
    and deleted_at is null
  for update;

  if target_slot.id is null or target_slot.status <> 'available' then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  perform public.assert_active_student_for_coach(target_slot.coach_id, requester_id);

  if exists (
    select 1
    from public.bookings
    where availability_slot_id = target_slot.id
      and status in ('confirmed', 'modified')
  ) then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  select count(*)
    into pending_on_slot
  from public.bookings
  where availability_slot_id = target_slot.id
    and status = 'pending';

  if pending_on_slot >= 2 then
    raise exception 'pending limit reached' using errcode = '23514';
  end if;

  select count(*)
    into pending_for_student
  from public.bookings
  where coach_id = target_slot.coach_id
    and student_id = requester_id
    and status = 'pending';

  if pending_for_student >= 10 then
    raise exception 'student pending limit reached' using errcode = '22023';
  end if;

  if p_lesson_type = 'group' then
    foreach participant_id in array coalesce(p_participant_ids, '{}')
    loop
      perform public.assert_active_student_for_coach(target_slot.coach_id, participant_id);
    end loop;
  end if;

  selected_rate := public.select_booking_pricing_rate(
    target_slot.coach_id,
    requester_id,
    p_lesson_type,
    target_slot.duration_minutes
  );

  insert into public.bookings (
    availability_slot_id,
    coach_id,
    student_id,
    pricing_rate_id,
    lesson_type,
    status,
    origin,
    starts_at,
    ends_at,
    duration_minutes,
    location,
    student_comment,
    expires_at
  )
  values (
    target_slot.id,
    target_slot.coach_id,
    requester_id,
    selected_rate.id,
    p_lesson_type,
    'pending',
    'student_request',
    target_slot.starts_at,
    target_slot.ends_at,
    target_slot.duration_minutes,
    target_slot.location,
    nullif(trim(coalesce(p_student_comment, '')), ''),
    now() + interval '7 days'
  )
  returning * into created_booking;

  perform public.add_booking_participants(
    created_booking.id,
    requester_id,
    case when p_lesson_type = 'group' then p_participant_ids else '{}'::uuid[] end
  );
  perform public.add_booking_history(
    created_booking,
    'booking_requested',
    'pending',
    'Demande de cours',
    'Demande envoyée au coach.'
  );
  perform public.create_app_notification(
    created_booking.coach_id,
    'booking_requested',
    'Nouvelle demande de cours',
    'Une nouvelle demande attend votre réponse.',
    'booking',
    created_booking.id,
    created_booking.id,
    jsonb_build_object('status', created_booking.status)
  );

  return created_booking;
end;
$$;

create or replace function public.approve_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  target_booking public.bookings;
  target_slot public.availability_slots;
  updated_booking public.bookings;
  refused_booking public.bookings;
  auto_refusal_comment text :=
    'Désolé, le créneau n''est plus disponible, veuillez essayer un autre créneau.';
begin
  select *
    into target_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if target_booking.id is null then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;

  if target_booking.coach_id <> current_coach_id
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if target_booking.status <> 'pending' then
    raise exception 'booking already processed' using errcode = '55000';
  end if;

  if target_booking.availability_slot_id is not null then
    select *
      into target_slot
    from public.availability_slots
    where id = target_booking.availability_slot_id
    for update;

    if target_slot.id is null or target_slot.status <> 'available' then
      raise exception 'slot unavailable' using errcode = '55000';
    end if;

    if exists (
      select 1
      from public.bookings
      where availability_slot_id = target_booking.availability_slot_id
        and id <> target_booking.id
        and status in ('confirmed', 'modified')
    ) then
      raise exception 'slot unavailable' using errcode = '55000';
    end if;
  end if;

  for refused_booking in
    update public.bookings
    set status = 'refused',
        coach_refusal_comment = auto_refusal_comment,
        decided_at = now()
    where availability_slot_id = target_booking.availability_slot_id
      and id <> target_booking.id
      and status = 'pending'
    returning *
  loop
    perform public.add_booking_history(
      refused_booking,
      'booking_cancelled',
      'refused',
      'Demande refusée',
      auto_refusal_comment
    );
    perform public.create_app_notification(
      refused_booking.student_id,
      'booking_refused',
      'Demande refusée',
      auto_refusal_comment,
      'booking',
      refused_booking.id,
      refused_booking.id,
      jsonb_build_object('status', refused_booking.status, 'refusalComment', auto_refusal_comment)
    );
  end loop;

  update public.bookings
  set status = 'confirmed',
      decided_at = now()
  where id = target_booking.id
  returning * into updated_booking;

  if target_booking.availability_slot_id is not null then
    update public.availability_slots
    set status = 'booked'
    where id = target_booking.availability_slot_id;
  end if;

  perform public.add_booking_history(
    updated_booking,
    'lesson_confirmed',
    'confirmed',
    'Cours confirmé',
    'Le coach a validé la demande.'
  );
  perform public.create_app_notification(
    updated_booking.student_id,
    'booking_approved',
    'Demande validée',
    'Votre cours est confirmé.',
    'booking',
    updated_booking.id,
    updated_booking.id,
    jsonb_build_object('status', updated_booking.status)
  );

  return updated_booking;
end;
$$;

create or replace function public.refuse_booking(
  p_booking_id uuid,
  p_refusal_comment text
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  updated_booking public.bookings;
  visible_comment text;
begin
  update public.bookings
  set status = 'refused',
      coach_refusal_comment = nullif(trim(coalesce(p_refusal_comment, '')), ''),
      decided_at = now()
  where id = p_booking_id
    and coach_id = current_coach_id
    and status = 'pending'
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  returning * into updated_booking;

  if updated_booking.id is null then
    raise exception 'booking cannot be refused' using errcode = '55000';
  end if;

  visible_comment := coalesce(updated_booking.coach_refusal_comment, 'Le coach a refusé la demande.');

  perform public.add_booking_history(
    updated_booking,
    'booking_cancelled',
    'refused',
    'Demande refusée',
    visible_comment
  );
  perform public.create_app_notification(
    updated_booking.student_id,
    'booking_refused',
    'Demande refusée',
    visible_comment,
    'booking',
    updated_booking.id,
    updated_booking.id,
    jsonb_build_object('status', updated_booking.status, 'refusalComment', updated_booking.coach_refusal_comment)
  );

  return updated_booking;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  target_booking public.bookings;
  updated_booking public.bookings;
  recipient_id uuid;
begin
  select user_roles.role
    into actor_role
  from public.user_roles
  where user_roles.user_id = actor_id
  limit 1;

  select *
    into target_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if target_booking.id is null then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;

  if target_booking.status not in ('confirmed', 'modified') then
    raise exception 'booking already processed' using errcode = '55000';
  end if;

  if actor_role = 'coach' and target_booking.coach_id <> actor_id then
    raise exception 'unauthorized' using errcode = '42501';
  elsif actor_role = 'eleve' then
    if target_booking.student_id <> actor_id then
      raise exception 'unauthorized' using errcode = '42501';
    end if;
    if target_booking.starts_at <= now() then
      raise exception 'past booking' using errcode = '22023';
    end if;
  elsif actor_role is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_at = now()
  where id = target_booking.id
  returning * into updated_booking;

  if target_booking.availability_slot_id is not null then
    update public.availability_slots
    set status = 'available'
    where id = target_booking.availability_slot_id;
  end if;

  perform public.add_booking_history(
    updated_booking,
    'booking_cancelled',
    'cancelled',
    'Cours annulé',
    'La réservation a été annulée.'
  );

  recipient_id := case
    when actor_role = 'coach' then updated_booking.student_id
    else updated_booking.coach_id
  end;

  perform public.create_app_notification(
    recipient_id,
    'booking_cancelled',
    'Réservation annulée',
    'Une réservation a été annulée.',
    'booking',
    updated_booking.id,
    updated_booking.id,
    jsonb_build_object('status', updated_booking.status, 'cancelledBy', actor_role)
  );

  return updated_booking;
end;
$$;

create or replace function public.modify_booking(
  p_booking_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_location text
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  updated_booking public.bookings;
begin
  update public.bookings
  set status = 'modified',
      starts_at = p_starts_at,
      ends_at = p_starts_at + (p_duration_minutes || ' minutes')::interval,
      duration_minutes = p_duration_minutes,
      location = trim(p_location),
      modified_at = now()
  where id = p_booking_id
    and coach_id = current_coach_id
    and status in ('confirmed', 'modified')
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  returning * into updated_booking;

  if updated_booking.id is null then
    raise exception 'booking cannot be modified' using errcode = '55000';
  end if;

  perform public.add_booking_history(
    updated_booking,
    'booking_modified',
    'modified',
    'Cours modifié',
    'Le coach a modifié la réservation.'
  );
  perform public.create_app_notification(
    updated_booking.student_id,
    'booking_modified',
    'Réservation modifiée',
    'Le coach a modifié votre réservation.',
    'booking',
    updated_booking.id,
    updated_booking.id,
    jsonb_build_object('status', updated_booking.status)
  );

  return updated_booking;
end;
$$;

revoke all on function public.create_app_notification(
  uuid,
  public.notification_type,
  text,
  text,
  public.notification_link_type,
  uuid,
  uuid,
  jsonb
) from public;
revoke all on function public.update_push_notification_preference(
  public.push_permission_status,
  public.push_provider,
  text,
  text
) from public;
revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read() from public;

grant execute on function public.update_push_notification_preference(
  public.push_permission_status,
  public.push_provider,
  text,
  text
) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

grant execute on function public.request_booking(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.refuse_booking(uuid, text) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.modify_booking(uuid, timestamptz, integer, text) to authenticated;
