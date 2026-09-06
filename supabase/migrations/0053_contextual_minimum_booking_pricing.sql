set timezone = 'Europe/Paris';

create or replace function public.is_pricing_public_holiday(p_date date)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  target_year integer := extract(year from p_date)::integer;
  a integer := target_year % 19;
  b integer := target_year / 100;
  c integer := target_year % 100;
  d integer := b / 4;
  e integer := b % 4;
  f integer := (b + 8) / 25;
  g integer := (b - f + 1) / 3;
  h integer := (19 * a + b - d - g + 15) % 30;
  i integer := c / 4;
  k integer := c % 4;
  l integer := (32 + 2 * e + 2 * i - h - k) % 7;
  m integer := (a + 11 * h + 22 * l) / 451;
  easter_month integer := (h + l - 7 * m + 114) / 31;
  easter_day integer := ((h + l - 7 * m + 114) % 31) + 1;
  easter date := make_date(target_year, easter_month, easter_day);
begin
  return p_date in (
    make_date(target_year, 1, 1),
    easter + 1,
    make_date(target_year, 5, 1),
    make_date(target_year, 5, 8),
    easter + 39,
    easter + 50,
    make_date(target_year, 7, 14),
    make_date(target_year, 8, 15),
    make_date(target_year, 11, 1),
    make_date(target_year, 11, 11),
    make_date(target_year, 12, 25)
  );
end;
$$;

revoke all on function public.is_pricing_public_holiday(date) from public;

create or replace function public.select_booking_pricing_rate(
  p_coach_id uuid,
  p_student_id uuid,
  p_lesson_type text,
  p_duration_minutes integer,
  p_starts_at timestamptz
)
returns public.pricing_rates
language plpgsql
security definer
set search_path = ''
set timezone = 'Europe/Paris'
as $$
declare
  selected_rate public.pricing_rates;
begin
  select pricing_rates.*
    into selected_rate
  from public.pricing_rates
  left join public.student_profiles requester_profile
    on requester_profile.user_id = p_student_id
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
    and (
      pricing_rates.applicability_contexts = '{}'
      or pricing_rates.applicability_contexts <@ array_remove(array[
        case
          when requester_profile.age is not null and requester_profile.age < 26
          then 'student'
        end,
        case
          when requester_profile.age is not null and requester_profile.age >= 60
          then 'senior'
        end,
        case
          when extract(isodow from p_starts_at at time zone 'Europe/Paris') in (6, 7)
          then 'weekend'
        end,
        case
          when public.is_pricing_public_holiday(
            (p_starts_at at time zone 'Europe/Paris')::date
          )
          then 'public_holiday'
        end
      ]::text[], null)
    )
  order by pricing_rates.amount_cents asc,
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

revoke all on function public.select_booking_pricing_rate(
  uuid, uuid, text, integer, timestamptz
) from public;

create or replace function public.request_booking(
  p_slot_id uuid,
  p_starts_at timestamptz,
  p_duration_minutes integer,
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
  requested_end timestamptz;
  selected_rate public.pricing_rates;
  pending_on_bounds integer;
  pending_for_student integer;
  created_booking public.bookings;
  participant_id uuid;
begin
  if requester_id is null or not exists (
    select 1 from public.user_roles
    where user_id = requester_id and role = 'eleve'
  ) then
    raise exception 'student role required' using errcode = '42501';
  end if;
  if p_duration_minutes not in (60, 90) then
    raise exception 'invalid duration' using errcode = '22023';
  end if;
  if p_starts_at <= now() then
    raise exception 'past booking' using errcode = '22023';
  end if;

  select * into target_slot
  from public.availability_slots
  where id = p_slot_id and deleted_at is null
  for update;

  requested_end := p_starts_at + (p_duration_minutes || ' minutes')::interval;
  if target_slot.id is null or target_slot.status <> 'available'
    or p_starts_at < target_slot.starts_at
    or requested_end > target_slot.ends_at
  then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  perform public.assert_active_student_for_coach(target_slot.coach_id, requester_id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(target_slot.coach_id::text));
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('student-bookings:' || requester_id::text)
  );

  if exists (
    select 1 from public.bookings b
    where b.coach_id = target_slot.coach_id
      and b.status in ('confirmed', 'modified')
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(p_starts_at, requested_end, '[)')
  ) then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.bookings b
    where b.student_id = requester_id
      and (
        b.status in ('confirmed', 'modified')
        or (
          b.status = 'pending'
          and (b.expires_at is null or b.expires_at > now())
        )
      )
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(p_starts_at, requested_end, '[)')
  ) then
    raise exception 'student booking overlap' using errcode = '23P01';
  end if;

  select count(*) into pending_on_bounds
  from public.bookings b
  where b.coach_id = target_slot.coach_id
    and b.starts_at = p_starts_at
    and b.ends_at = requested_end
    and b.status = 'pending'
    and (b.expires_at is null or b.expires_at > now());
  if pending_on_bounds >= 2 then
    raise exception 'pending limit reached' using errcode = '23514';
  end if;

  select count(*) into pending_for_student
  from public.bookings b
  where b.coach_id = target_slot.coach_id
    and b.student_id = requester_id
    and b.status = 'pending'
    and (b.expires_at is null or b.expires_at > now());
  if pending_for_student >= 10 then
    raise exception 'student pending limit reached' using errcode = '22023';
  end if;

  if p_lesson_type in ('duo', 'group') then
    foreach participant_id in array coalesce(p_participant_ids, '{}') loop
      perform public.assert_active_student_for_coach(target_slot.coach_id, participant_id);
    end loop;
  end if;

  selected_rate := public.select_booking_pricing_rate(
    target_slot.coach_id, requester_id, p_lesson_type, p_duration_minutes,
    p_starts_at
  );

  insert into public.bookings (
    availability_slot_id, coach_id, student_id, pricing_rate_id, lesson_type,
    status, origin, starts_at, ends_at, duration_minutes, location,
    student_comment, expires_at
  ) values (
    target_slot.id, target_slot.coach_id, requester_id, selected_rate.id,
    p_lesson_type, 'pending', 'student_request', p_starts_at, requested_end,
    p_duration_minutes, target_slot.location,
    nullif(trim(coalesce(p_student_comment, '')), ''), now() + interval '7 days'
  ) returning * into created_booking;

  perform public.add_booking_participants(
    created_booking.id, requester_id,
    case when p_lesson_type in ('duo', 'group') then p_participant_ids else '{}'::uuid[] end
  );
  perform public.add_booking_history(
    created_booking, 'booking_requested', 'pending',
    'Demande de cours', 'Demande envoyée au coach.'
  );
  perform public.create_app_notification(
    created_booking.coach_id, 'booking_requested', 'Nouvelle demande de cours',
    'Une nouvelle demande attend votre réponse.', 'booking', created_booking.id,
    created_booking.id, jsonb_build_object('status', created_booking.status)
  );
  return created_booking;
end;
$$;

grant execute on function public.request_booking(
  uuid, timestamptz, integer, text, text, uuid[]
) to authenticated;

create or replace function public.create_coach_booking(
  p_student_ids uuid[], p_starts_at timestamptz, p_duration_minutes integer,
  p_location text, p_lesson_type text, p_recurrence_ends_on date
)
returns setof public.bookings
language plpgsql
security definer
set search_path = ''
set timezone = 'Europe/Paris'
as $$
declare
  current_coach_id uuid := auth.uid();
  primary_student_id uuid;
  participant_id uuid;
  occurrence_start timestamptz := p_starts_at;
  occurrence_end timestamptz;
  selected_rate public.pricing_rates;
  created_booking public.bookings;
  target_recurrence_series_id uuid :=
    case when p_recurrence_ends_on is null then null else gen_random_uuid() end;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if p_duration_minutes not in (60, 90) or p_starts_at <= now() then
    raise exception 'invalid booking time' using errcode = '22023';
  end if;
  if cardinality(coalesce(p_student_ids, '{}')) = 0
    or cardinality(p_student_ids) > 4
    or cardinality(array(select distinct unnest(p_student_ids))) <> cardinality(p_student_ids)
  then
    raise exception 'invalid participants' using errcode = '22023';
  end if;

  primary_student_id := p_student_ids[1];
  foreach participant_id in array p_student_ids loop
    perform public.assert_active_student_for_coach(current_coach_id, participant_id);
  end loop;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));

  while p_recurrence_ends_on is null or occurrence_start::date <= p_recurrence_ends_on loop
    occurrence_end := occurrence_start + (p_duration_minutes || ' minutes')::interval;
    selected_rate := public.select_booking_pricing_rate(
      current_coach_id, primary_student_id, p_lesson_type, p_duration_minutes,
      occurrence_start
    );

    if exists (
      select 1
      from public.bookings b
      where b.coach_id = current_coach_id
        and b.status in ('confirmed', 'modified')
        and tstzrange(b.starts_at, b.ends_at, '[)') &&
            tstzrange(occurrence_start, occurrence_end, '[)')
    ) then
      raise exception 'slot unavailable' using errcode = '55000';
    end if;

    if exists (
      select 1
      from public.bookings b
      join public.booking_participants bp on bp.booking_id = b.id
      where bp.student_id = any(p_student_ids)
        and b.status in ('confirmed', 'modified')
        and tstzrange(b.starts_at, b.ends_at, '[)') &&
            tstzrange(occurrence_start, occurrence_end, '[)')
    ) then
      raise exception 'student booking overlap' using errcode = '23P01';
    end if;

    insert into public.bookings (
      coach_id, student_id, pricing_rate_id, lesson_type, status, origin,
      starts_at, ends_at, duration_minutes, location, decided_at,
      recurrence_series_id
    ) values (
      current_coach_id, primary_student_id, selected_rate.id, p_lesson_type,
      'confirmed', 'coach_created', occurrence_start, occurrence_end,
      p_duration_minutes, trim(p_location), now(), target_recurrence_series_id
    ) returning * into created_booking;

    perform public.add_booking_participants(created_booking.id, primary_student_id, p_student_ids);
    perform public.add_booking_history(
      created_booking, 'lesson_confirmed', 'confirmed',
      'Cours planifié', 'Le coach a créé le cours directement.'
    );
    perform public.refuse_overlapping_pending_bookings(
      current_coach_id, occurrence_start, occurrence_end
    );
    return next created_booking;

    exit when p_recurrence_ends_on is null;
    occurrence_start := occurrence_start + interval '7 days';
  end loop;
  return;
end;
$$;

grant execute on function public.create_coach_booking(
  uuid[], timestamptz, integer, text, text, date
) to authenticated;

create or replace function public.modify_booking(
  p_booking_id uuid, p_student_ids uuid[], p_starts_at timestamptz,
  p_duration_minutes integer, p_location text, p_lesson_type text
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  target_booking public.bookings;
  updated_booking public.bookings;
  primary_student_id uuid;
  participant_id uuid;
  selected_rate public.pricing_rates;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if p_duration_minutes not in (60, 90) or p_starts_at <= now() then
    raise exception 'invalid booking time' using errcode = '22023';
  end if;
  if cardinality(coalesce(p_student_ids, '{}')) = 0
    or cardinality(p_student_ids) > 4
    or cardinality(array(select distinct unnest(p_student_ids))) <> cardinality(p_student_ids)
  then
    raise exception 'invalid participants' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));

  select *
    into target_booking
  from public.bookings
  where id = p_booking_id
    and coach_id = current_coach_id
    and status in ('confirmed', 'modified')
  for update;

  if target_booking.id is null then
    raise exception 'booking cannot be modified' using errcode = '55000';
  end if;
  if target_booking.lesson_type <> p_lesson_type then
    raise exception 'lesson type cannot be changed' using errcode = '22023';
  end if;

  primary_student_id := p_student_ids[1];
  foreach participant_id in array p_student_ids loop
    perform public.assert_active_student_for_coach(current_coach_id, participant_id);
  end loop;
  selected_rate := public.select_booking_pricing_rate(
    current_coach_id, primary_student_id, p_lesson_type, p_duration_minutes,
    p_starts_at
  );

  if exists (
    select 1
    from public.bookings b
    where b.id <> target_booking.id
      and b.coach_id = current_coach_id
      and b.status in ('confirmed', 'modified')
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(
            p_starts_at,
            p_starts_at + (p_duration_minutes || ' minutes')::interval,
            '[)'
          )
  ) then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  if exists (
    select 1
    from public.bookings b
    join public.booking_participants bp on bp.booking_id = b.id
    where b.id <> target_booking.id
      and bp.student_id = any(p_student_ids)
      and b.status in ('confirmed', 'modified')
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(
            p_starts_at,
            p_starts_at + (p_duration_minutes || ' minutes')::interval,
            '[)'
          )
  ) then
    raise exception 'student booking overlap' using errcode = '23P01';
  end if;

  update public.bookings
  set student_id = primary_student_id,
      pricing_rate_id = selected_rate.id,
      status = 'modified',
      starts_at = p_starts_at,
      ends_at = p_starts_at + (p_duration_minutes || ' minutes')::interval,
      duration_minutes = p_duration_minutes,
      location = trim(p_location),
      modified_at = now()
  where id = target_booking.id
  returning * into updated_booking;

  delete from public.booking_participants
  where booking_id = updated_booking.id;
  perform public.add_booking_participants(updated_booking.id, primary_student_id, p_student_ids);

  perform public.add_booking_history(
    updated_booking, 'booking_modified', 'modified',
    'Cours modifié', 'Le coach a modifié la réservation.'
  );

  for participant_id in
    select booking_participants.student_id
    from public.booking_participants
    where booking_participants.booking_id = updated_booking.id
  loop
    perform public.create_app_notification(
      participant_id, 'booking_modified', 'Réservation modifiée',
      'Le coach a modifié votre réservation.', 'booking', updated_booking.id,
      updated_booking.id, jsonb_build_object('status', updated_booking.status)
    );
  end loop;

  perform public.refuse_overlapping_pending_bookings(
    current_coach_id, updated_booking.starts_at, updated_booking.ends_at
  );
  return updated_booking;
end;
$$;

grant execute on function public.modify_booking(
  uuid, uuid[], timestamptz, integer, text, text
) to authenticated;

drop function if exists public.select_booking_pricing_rate(uuid, uuid, text, integer);

reset timezone;
