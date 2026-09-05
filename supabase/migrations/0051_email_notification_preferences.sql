create type public.email_notification_kind as enum (
  'booking_confirmed',
  'booking_cancelled',
  'coach_student_cancelled',
  'coach_weekly_pending_reminder'
);

create type public.email_delivery_status as enum (
  'pending',
  'sent',
  'failed'
);

create table public.notification_email_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  student_booking_confirmed boolean not null default false,
  student_booking_cancelled boolean not null default false,
  coach_student_cancellation boolean not null default false,
  coach_weekly_reminder_enabled boolean not null default false,
  coach_weekly_reminder_iso_weekday smallint not null default 5
    check (coach_weekly_reminder_iso_weekday between 1 and 7),
  coach_weekly_reminder_time time not null default '18:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind public.email_notification_kind not null,
  booking_id uuid references public.bookings(id) on delete set null,
  dedupe_key text not null unique
    check (char_length(dedupe_key) between 1 and 200),
  payload jsonb not null default '{}'::jsonb,
  status public.email_delivery_status not null default 'pending',
  attempts smallint not null default 0 check (attempts between 0 and 5),
  next_attempt_at timestamptz not null default now(),
  processing_started_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notification_email_deliveries_pending_idx
  on public.notification_email_deliveries (next_attempt_at, created_at)
  where status = 'pending';

create trigger notification_email_preferences_set_updated_at
  before update on public.notification_email_preferences
  for each row execute function public.set_updated_at();

create trigger notification_email_deliveries_set_updated_at
  before update on public.notification_email_deliveries
  for each row execute function public.set_updated_at();

alter table public.notification_email_preferences enable row level security;
alter table public.notification_email_deliveries enable row level security;

revoke all on table public.notification_email_preferences from public, anon, authenticated;
revoke all on table public.notification_email_deliveries from public, anon, authenticated;
grant select on table public.notification_email_preferences to authenticated;
grant all on table public.notification_email_preferences to service_role;
grant all on table public.notification_email_deliveries to service_role;

create policy notification_email_preferences_select_own
  on public.notification_email_preferences
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.update_student_email_preferences(
  p_booking_confirmed boolean,
  p_booking_cancelled boolean
)
returns public.notification_email_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  updated_preference public.notification_email_preferences;
begin
  if current_user_id is null or not exists (
    select 1 from public.user_roles
    where user_id = current_user_id and role = 'eleve'
  ) then
    raise exception 'student role required' using errcode = '42501';
  end if;

  insert into public.notification_email_preferences (
    user_id,
    student_booking_confirmed,
    student_booking_cancelled
  ) values (
    current_user_id,
    coalesce(p_booking_confirmed, false),
    coalesce(p_booking_cancelled, false)
  )
  on conflict (user_id) do update
  set student_booking_confirmed = excluded.student_booking_confirmed,
      student_booking_cancelled = excluded.student_booking_cancelled,
      updated_at = now()
  returning * into updated_preference;

  return updated_preference;
end;
$$;

create or replace function public.update_coach_email_preferences(
  p_student_cancellation boolean,
  p_weekly_reminder_enabled boolean,
  p_weekly_reminder_iso_weekday smallint,
  p_weekly_reminder_time time
)
returns public.notification_email_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  updated_preference public.notification_email_preferences;
begin
  if current_user_id is null or not exists (
    select 1 from public.user_roles
    where user_id = current_user_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if p_weekly_reminder_iso_weekday not between 1 and 7
    or p_weekly_reminder_time is null
  then
    raise exception 'invalid weekly reminder schedule' using errcode = '22023';
  end if;

  insert into public.notification_email_preferences (
    user_id,
    coach_student_cancellation,
    coach_weekly_reminder_enabled,
    coach_weekly_reminder_iso_weekday,
    coach_weekly_reminder_time
  ) values (
    current_user_id,
    coalesce(p_student_cancellation, false),
    coalesce(p_weekly_reminder_enabled, false),
    p_weekly_reminder_iso_weekday,
    p_weekly_reminder_time
  )
  on conflict (user_id) do update
  set coach_student_cancellation = excluded.coach_student_cancellation,
      coach_weekly_reminder_enabled = excluded.coach_weekly_reminder_enabled,
      coach_weekly_reminder_iso_weekday = excluded.coach_weekly_reminder_iso_weekday,
      coach_weekly_reminder_time = excluded.coach_weekly_reminder_time,
      updated_at = now()
  returning * into updated_preference;

  return updated_preference;
end;
$$;

create or replace function public.queue_booking_email_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  recipient_id uuid;
  event_kind public.email_notification_kind;
  event_booking public.bookings;
  actor_name text;
  coach_name text;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'confirmed' then
      return new;
    end if;
    event_kind := 'booking_confirmed';
    event_booking := new;
  elsif old.status = 'pending' and new.status = 'confirmed' then
    event_kind := 'booking_confirmed';
    event_booking := new;
  elsif old.status in ('confirmed', 'modified') and new.status = 'cancelled' then
    event_booking := new;
    select role into actor_role
    from public.user_roles
    where user_id = actor_id
    limit 1;

    if actor_role = 'eleve' then
      if exists (
        select 1 from public.notification_email_preferences
        where user_id = new.coach_id and coach_student_cancellation
      ) then
        select full_name into actor_name
        from public.student_profiles
        where user_id = actor_id;

        insert into public.notification_email_deliveries (
          recipient_id, kind, booking_id, dedupe_key, payload
        ) values (
          new.coach_id,
          'coach_student_cancelled',
          new.id,
          'booking:' || new.id::text || ':coach_student_cancelled',
          jsonb_build_object(
            'startsAt', new.starts_at,
            'endsAt', new.ends_at,
            'location', new.location,
            'lessonType', new.lesson_type,
            'studentName', coalesce(nullif(trim(actor_name), ''), 'Un élève')
          )
        ) on conflict (dedupe_key) do nothing;
      end if;
      return new;
    end if;

    if actor_role is distinct from 'coach' then
      return new;
    end if;
    event_kind := 'booking_cancelled';
  else
    return new;
  end if;

  select display_name into coach_name
  from public.coach_profiles
  where user_id = event_booking.coach_id;

  for recipient_id in
    select distinct participant_id
    from (
      select student_id as participant_id
      from public.booking_participants
      where booking_id = event_booking.id
      union all
      select event_booking.student_id
    ) participants
  loop
    if (
      event_kind = 'booking_confirmed'
      and not exists (
        select 1 from public.notification_email_preferences
        where user_id = recipient_id and student_booking_confirmed
      )
    ) or (
      event_kind = 'booking_cancelled'
      and not exists (
        select 1 from public.notification_email_preferences
        where user_id = recipient_id and student_booking_cancelled
      )
    ) then
      continue;
    end if;

    insert into public.notification_email_deliveries (
      recipient_id, kind, booking_id, dedupe_key, payload
    ) values (
      recipient_id,
      event_kind,
      event_booking.id,
      'booking:' || event_booking.id::text || ':' || event_kind::text || ':' || recipient_id::text,
      jsonb_build_object(
        'startsAt', event_booking.starts_at,
        'endsAt', event_booking.ends_at,
        'location', event_booking.location,
        'lessonType', event_booking.lesson_type,
        'coachName', coalesce(nullif(trim(coach_name), ''), 'Votre coach')
      )
    ) on conflict (dedupe_key) do nothing;
  end loop;

  return new;
end;
$$;

create trigger bookings_queue_email_notifications
  after insert or update of status on public.bookings
  for each row execute function public.queue_booking_email_notifications();

create or replace function public.queue_confirmed_booking_participant_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_booking public.bookings;
  coach_name text;
begin
  select * into target_booking
  from public.bookings
  where id = new.booking_id;

  if target_booking.id is null
    or target_booking.status <> 'confirmed'
    or not exists (
      select 1 from public.notification_email_preferences
      where user_id = new.student_id and student_booking_confirmed
    )
  then
    return new;
  end if;

  select display_name into coach_name
  from public.coach_profiles
  where user_id = target_booking.coach_id;

  insert into public.notification_email_deliveries (
    recipient_id, kind, booking_id, dedupe_key, payload
  ) values (
    new.student_id,
    'booking_confirmed',
    target_booking.id,
    'booking:' || target_booking.id::text || ':booking_confirmed:' || new.student_id::text,
    jsonb_build_object(
      'startsAt', target_booking.starts_at,
      'endsAt', target_booking.ends_at,
      'location', target_booking.location,
      'lessonType', target_booking.lesson_type,
      'coachName', coalesce(nullif(trim(coach_name), ''), 'Votre coach')
    )
  ) on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

create trigger booking_participants_queue_confirmation_email
  after insert on public.booking_participants
  for each row execute function public.queue_confirmed_booking_participant_email();

create or replace function public.enqueue_due_coach_weekly_email_reminders(
  p_now timestamptz default now()
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  local_now timestamp := p_now at time zone 'Europe/Paris';
  current_week_start date := date_trunc('week', local_now)::date;
  next_week_start date := current_week_start + 7;
  following_week_start date := current_week_start + 14;
  preference public.notification_email_preferences;
  next_week_pending integer;
  later_pending integer;
  inserted_count integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  for preference in
    select *
    from public.notification_email_preferences
    where coach_weekly_reminder_enabled
      and coach_weekly_reminder_iso_weekday = extract(isodow from local_now)::smallint
      and coach_weekly_reminder_time <= local_now::time
  loop
    select count(*) into next_week_pending
    from public.bookings
    where coach_id = preference.user_id
      and status = 'pending'
      and (expires_at is null or expires_at > p_now)
      and starts_at >= (next_week_start::timestamp at time zone 'Europe/Paris')
      and starts_at < (following_week_start::timestamp at time zone 'Europe/Paris');

    select count(*) into later_pending
    from public.bookings
    where coach_id = preference.user_id
      and status = 'pending'
      and (expires_at is null or expires_at > p_now)
      and starts_at >= (following_week_start::timestamp at time zone 'Europe/Paris');

    if next_week_pending + later_pending = 0 then
      continue;
    end if;

    insert into public.notification_email_deliveries (
      recipient_id, kind, dedupe_key, payload
    ) values (
      preference.user_id,
      'coach_weekly_pending_reminder',
      'weekly:' || preference.user_id::text || ':' || current_week_start::text,
      jsonb_build_object(
        'nextWeekStart', next_week_start,
        'nextWeekEnd', following_week_start - 1,
        'nextWeekPendingCount', next_week_pending,
        'laterPendingCount', later_pending
      )
    ) on conflict (dedupe_key) do nothing;

    if found then
      inserted_count := inserted_count + 1;
    end if;
  end loop;

  return inserted_count;
end;
$$;

create or replace function public.claim_pending_email_deliveries(
  p_limit integer default 25
)
returns table (
  id uuid,
  recipient_id uuid,
  recipient_email text,
  recipient_name text,
  recipient_language public.app_language,
  kind public.email_notification_kind,
  booking_id uuid,
  payload jsonb,
  attempts smallint,
  processing_started_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  return query
  with candidates as (
    select delivery.id
    from public.notification_email_deliveries delivery
    where delivery.status = 'pending'
      and delivery.attempts < 5
      and delivery.next_attempt_at <= now()
      and (
        delivery.processing_started_at is null
        or delivery.processing_started_at < now() - interval '15 minutes'
      )
    order by delivery.created_at
    limit greatest(1, least(coalesce(p_limit, 25), 100))
    for update skip locked
  ), claimed as (
    update public.notification_email_deliveries delivery
    set processing_started_at = now(),
        attempts = delivery.attempts + 1
    from candidates
    where delivery.id = candidates.id
    returning delivery.*
  )
  select
    claimed.id,
    claimed.recipient_id,
    coalesce(nullif(trim(student.email), ''), nullif(trim(coach.email), ''), users.email),
    coalesce(nullif(trim(student.full_name), ''), nullif(trim(coach.display_name), ''), 'Equation Padel'),
    coalesce(student.preferred_language, coach.preferred_language, 'fr'::public.app_language),
    claimed.kind,
    claimed.booking_id,
    claimed.payload,
    claimed.attempts,
    claimed.processing_started_at
  from claimed
  join auth.users users on users.id = claimed.recipient_id
  left join public.student_profiles student on student.user_id = claimed.recipient_id
  left join public.coach_profiles coach on coach.user_id = claimed.recipient_id;
end;
$$;

revoke all on function public.update_student_email_preferences(boolean, boolean)
  from public, anon, authenticated;
revoke all on function public.update_coach_email_preferences(boolean, boolean, smallint, time)
  from public, anon, authenticated;
revoke all on function public.queue_booking_email_notifications()
  from public, anon, authenticated;
revoke all on function public.queue_confirmed_booking_participant_email()
  from public, anon, authenticated;
revoke all on function public.enqueue_due_coach_weekly_email_reminders(timestamptz)
  from public, anon, authenticated;
revoke all on function public.claim_pending_email_deliveries(integer)
  from public, anon, authenticated;

grant execute on function public.update_student_email_preferences(boolean, boolean)
  to authenticated;
grant execute on function public.update_coach_email_preferences(boolean, boolean, smallint, time)
  to authenticated;
grant execute on function public.enqueue_due_coach_weekly_email_reminders(timestamptz)
  to service_role;
grant execute on function public.claim_pending_email_deliveries(integer)
  to service_role;
