create type public.booking_status as enum (
  'pending',
  'confirmed',
  'refused',
  'expired',
  'cancelled',
  'modified'
);

create type public.booking_origin as enum (
  'student_request',
  'coach_created'
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  availability_slot_id uuid references public.availability_slots(id) on delete set null,
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  pricing_rate_id uuid not null references public.pricing_rates(id),
  lesson_type text not null check (lesson_type in ('individual', 'group')),
  status public.booking_status not null default 'pending',
  origin public.booking_origin not null default 'student_request',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes in (60, 90)),
  location text not null
    check (trim(location) in ('Les Bruyères Centre Sportif')),
  student_comment text check (student_comment is null or char_length(student_comment) <= 500),
  coach_refusal_comment text
    check (coach_refusal_comment is null or char_length(coach_refusal_comment) <= 500),
  expires_at timestamptz,
  decided_at timestamptz,
  cancelled_at timestamptz,
  modified_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (ends_at = starts_at + (duration_minutes || ' minutes')::interval),
  check (
    (status = 'pending' and expires_at is not null)
    or (status <> 'pending')
  )
);

create table public.booking_participants (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (booking_id, student_id)
);

comment on table public.bookings is
  'Transactional booking requests and confirmed lessons for Epic 4.';

comment on table public.booking_participants is
  'Participants attached to individual and group bookings, including requester.';

create unique index bookings_single_confirmed_slot_idx
  on public.bookings (availability_slot_id)
  where availability_slot_id is not null
    and status in ('confirmed', 'modified');

create index bookings_coach_start_idx
  on public.bookings (coach_id, starts_at);

create index bookings_student_start_idx
  on public.bookings (student_id, starts_at);

create index bookings_pending_slot_idx
  on public.bookings (availability_slot_id)
  where status = 'pending';

create index bookings_pending_student_idx
  on public.bookings (coach_id, student_id)
  where status = 'pending';

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

alter table public.bookings enable row level security;
alter table public.booking_participants enable row level security;

revoke all on table public.bookings from anon, authenticated;
revoke all on table public.booking_participants from anon, authenticated;
grant select on table public.bookings to authenticated;
grant select on table public.booking_participants to authenticated;
grant all on table public.bookings to service_role;
grant all on table public.booking_participants to service_role;

create policy bookings_select_coach
  on public.bookings
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'coach'
    )
  );

create policy bookings_select_student
  on public.bookings
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    and exists (
      select 1
      from public.user_roles
      where user_roles.user_id = (select auth.uid())
        and user_roles.role = 'eleve'
    )
  );

create policy booking_participants_select_related
  on public.booking_participants
  for select
  to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1
      from public.bookings
      where bookings.id = booking_participants.booking_id
        and (
          bookings.coach_id = (select auth.uid())
          or bookings.student_id = (select auth.uid())
        )
    )
  );

create or replace function public.select_booking_pricing_rate(
  p_coach_id uuid,
  p_student_id uuid,
  p_lesson_type text,
  p_duration_minutes integer
)
returns public.pricing_rates
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_rate public.pricing_rates;
begin
  select pricing_rates.*
    into selected_rate
  from public.pricing_rates
  where pricing_rates.coach_id = p_coach_id
    and pricing_rates.lesson_type = p_lesson_type
    and pricing_rates.duration_minutes = p_duration_minutes
    and pricing_rates.is_active
    and pricing_rates.deleted_at is null
    and (
      not exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
      )
      or exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
          and pricing_rate_students.student_id = p_student_id
      )
    )
  order by
    case
      when exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
          and pricing_rate_students.student_id = p_student_id
      ) then 0
      else 1
    end,
    cardinality(pricing_rates.applicability_contexts) desc,
    pricing_rates.created_at asc
  limit 1;

  if selected_rate.id is null then
    raise exception 'pricing rate missing' using errcode = 'P0002';
  end if;

  return selected_rate;
end;
$$;

create or replace function public.assert_active_student_for_coach(
  p_coach_id uuid,
  p_student_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.student_coach_relationships
    where student_coach_relationships.coach_id = p_coach_id
      and student_coach_relationships.student_id = p_student_id
      and student_coach_relationships.status = 'active'
  ) then
    raise exception 'student is not associated with coach' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.add_booking_history(
  p_booking public.bookings,
  p_event_type public.student_history_event_type,
  p_status public.student_history_event_status,
  p_title text,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.student_history_events (
    coach_id,
    student_id,
    event_type,
    status,
    title,
    description,
    occurred_at,
    source_id
  )
  values (
    p_booking.coach_id,
    p_booking.student_id,
    p_event_type,
    p_status,
    p_title,
    p_description,
    now(),
    p_booking.id
  );
end;
$$;

create or replace function public.add_booking_participants(
  p_booking_id uuid,
  p_requester_id uuid,
  p_participant_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  participant_id uuid;
  normalized_ids uuid[] := array[p_requester_id] || coalesce(p_participant_ids, '{}');
begin
  if cardinality(array(select distinct unnest(normalized_ids))) > 4 then
    raise exception 'too many participants' using errcode = '22023';
  end if;

  foreach participant_id in array normalized_ids
  loop
    insert into public.booking_participants (booking_id, student_id)
    values (p_booking_id, participant_id)
    on conflict do nothing;
  end loop;
end;
$$;

create or replace function public.get_requestable_booking_participants()
returns setof public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester_id uuid := auth.uid();
  requester_coach_id uuid;
begin
  select student_coach_relationships.coach_id
    into requester_coach_id
  from public.student_coach_relationships
  where student_coach_relationships.student_id = requester_id
    and student_coach_relationships.status = 'active'
  limit 1;

  if requester_coach_id is null then
    raise exception 'active coach relationship required' using errcode = '42501';
  end if;

  return query
  select student_profiles.*
  from public.student_profiles
  join public.student_coach_relationships
    on student_coach_relationships.student_id = student_profiles.user_id
   and student_coach_relationships.coach_id = requester_coach_id
   and student_coach_relationships.status = 'active'
  where student_profiles.account_status = 'active'
  order by student_profiles.full_name;
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
  updated_booking public.bookings;
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

  update public.bookings
  set status = 'confirmed',
      decided_at = now()
  where id = target_booking.id
  returning * into updated_booking;

  update public.bookings
  set status = 'refused',
      coach_refusal_comment = 'Désolé, le créneau n''est plus disponible, veuillez essayer un autre créneau.',
      decided_at = now()
  where availability_slot_id = target_booking.availability_slot_id
    and id <> target_booking.id
    and status = 'pending';

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

  perform public.add_booking_history(
    updated_booking,
    'booking_cancelled',
    'refused',
    'Demande refusée',
    coalesce(updated_booking.coach_refusal_comment, 'Le coach a refusé la demande.')
  );

  return updated_booking;
end;
$$;

create or replace function public.expire_pending_bookings()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  expired_count integer;
begin
  update public.bookings
  set status = 'expired',
      expired_at = now()
  where status = 'pending'
    and expires_at <= now();

  get diagnostics expired_count = row_count;

  insert into public.student_history_events (
    coach_id,
    student_id,
    event_type,
    status,
    title,
    description,
    occurred_at,
    source_id
  )
  select coach_id,
         student_id,
         'booking_cancelled',
         'expired',
         'Demande expirée',
         'La demande a expiré automatiquement après 7 jours.',
         now(),
         id
  from public.bookings
  where status = 'expired'
    and expired_at >= now() - interval '1 minute';

  return expired_count;
end;
$$;

create or replace function public.create_coach_booking(
  p_student_ids uuid[],
  p_starts_at timestamptz,
  p_duration_minutes integer,
  p_location text,
  p_lesson_type text,
  p_recurrence_ends_on date
)
returns setof public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  primary_student_id uuid;
  participant_id uuid;
  occurrence_start timestamptz := p_starts_at;
  occurrence_end timestamptz;
  selected_rate public.pricing_rates;
  created_booking public.bookings;
begin
  if current_coach_id is null
    or not exists (
      select 1
      from public.user_roles
      where user_roles.user_id = current_coach_id
        and user_roles.role = 'coach'
    )
  then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if cardinality(coalesce(p_student_ids, '{}')) = 0
    or cardinality(array(select distinct unnest(p_student_ids))) > 4
  then
    raise exception 'invalid participants' using errcode = '22023';
  end if;

  primary_student_id := p_student_ids[1];

  foreach participant_id in array p_student_ids
  loop
    perform public.assert_active_student_for_coach(current_coach_id, participant_id);
  end loop;

  selected_rate := public.select_booking_pricing_rate(
    current_coach_id,
    primary_student_id,
    p_lesson_type,
    p_duration_minutes
  );

  while p_recurrence_ends_on is null
    or occurrence_start::date <= p_recurrence_ends_on
  loop
    occurrence_end := occurrence_start + (p_duration_minutes || ' minutes')::interval;

    insert into public.bookings (
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
      decided_at
    )
    values (
      current_coach_id,
      primary_student_id,
      selected_rate.id,
      p_lesson_type,
      'confirmed',
      'coach_created',
      occurrence_start,
      occurrence_end,
      p_duration_minutes,
      trim(p_location),
      now()
    )
    returning * into created_booking;

    perform public.add_booking_participants(created_booking.id, primary_student_id, p_student_ids);
    perform public.add_booking_history(
      created_booking,
      'lesson_confirmed',
      'confirmed',
      'Cours planifié',
      'Le coach a créé le cours directement.'
    );

    return next created_booking;

    exit when p_recurrence_ends_on is null;
    occurrence_start := occurrence_start + interval '7 days';
  end loop;

  return;
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

  return updated_booking;
end;
$$;

revoke all on function public.select_booking_pricing_rate(uuid, uuid, text, integer) from public;
revoke all on function public.assert_active_student_for_coach(uuid, uuid) from public;
revoke all on function public.add_booking_history(
  public.bookings,
  public.student_history_event_type,
  public.student_history_event_status,
  text,
  text
) from public;
revoke all on function public.add_booking_participants(uuid, uuid, uuid[]) from public;
revoke all on function public.get_requestable_booking_participants() from public;
revoke all on function public.request_booking(uuid, text, text, uuid[]) from public;
revoke all on function public.approve_booking(uuid) from public;
revoke all on function public.refuse_booking(uuid, text) from public;
revoke all on function public.expire_pending_bookings() from public;
revoke all on function public.create_coach_booking(
  uuid[],
  timestamptz,
  integer,
  text,
  text,
  date
) from public;
revoke all on function public.cancel_booking(uuid) from public;
revoke all on function public.modify_booking(uuid, timestamptz, integer, text) from public;

grant execute on function public.request_booking(uuid, text, text, uuid[]) to authenticated;
grant execute on function public.get_requestable_booking_participants() to authenticated;
grant execute on function public.approve_booking(uuid) to authenticated;
grant execute on function public.refuse_booking(uuid, text) to authenticated;
grant execute on function public.expire_pending_bookings() to authenticated;
grant execute on function public.create_coach_booking(
  uuid[],
  timestamptz,
  integer,
  text,
  text,
  date
) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.modify_booking(uuid, timestamptz, integer, text) to authenticated;
