set timezone = 'Europe/Paris';

alter table public.bookings
  add column if not exists recurrence_series_id uuid;

create index if not exists bookings_recurrence_series_start_idx
  on public.bookings (recurrence_series_id, starts_at)
  where recurrence_series_id is not null;

with recurrence_groups as (
  select
    gen_random_uuid() as recurrence_series_id,
    array_agg(bookings.id order by bookings.starts_at, bookings.id) as booking_ids
  from public.bookings
  where bookings.origin = 'coach_created'
    and bookings.recurrence_series_id is null
    and bookings.decided_at is not null
  group by
    bookings.coach_id,
    bookings.student_id,
    bookings.pricing_rate_id,
    bookings.lesson_type,
    bookings.duration_minutes,
    bookings.location,
    bookings.created_at,
    bookings.decided_at
  having count(*) > 1
)
update public.bookings
set recurrence_series_id = recurrence_groups.recurrence_series_id
from recurrence_groups,
     unnest(recurrence_groups.booking_ids) as grouped_booking(id)
where bookings.id = grouped_booking.id;

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
  selected_rate := public.select_booking_pricing_rate(
    current_coach_id, primary_student_id, p_lesson_type, p_duration_minutes
  );
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));

  while p_recurrence_ends_on is null or occurrence_start::date <= p_recurrence_ends_on loop
    occurrence_end := occurrence_start + (p_duration_minutes || ' minutes')::interval;

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

drop function if exists public.modify_booking(uuid, timestamptz, integer, text);

create function public.modify_booking(
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
    current_coach_id, primary_student_id, p_lesson_type, p_duration_minutes
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

create function public.cancel_booking_recurrences(
  p_booking_id uuid,
  p_starts_on date,
  p_ends_on date
)
returns integer
language plpgsql
security definer
set search_path = ''
set timezone = 'Europe/Paris'
as $$
declare
  current_coach_id uuid := auth.uid();
  target_booking public.bookings;
  cancelled_booking public.bookings;
  participant_id uuid;
  cancelled_count integer := 0;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if p_starts_on is null or p_ends_on is null or p_ends_on < p_starts_on then
    raise exception 'invalid recurrence date range' using errcode = '22023';
  end if;

  select *
    into target_booking
  from public.bookings
  where id = p_booking_id
    and coach_id = current_coach_id
  for update;

  if target_booking.id is null then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;
  if target_booking.recurrence_series_id is null then
    raise exception 'booking is not recurring' using errcode = '55000';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));

  for cancelled_booking in
    update public.bookings b
    set status = 'cancelled',
        cancelled_at = now()
    where b.coach_id = current_coach_id
      and b.recurrence_series_id = target_booking.recurrence_series_id
      and b.status in ('confirmed', 'modified')
      and b.starts_at::date between p_starts_on and p_ends_on
    returning b.*
  loop
    cancelled_count := cancelled_count + 1;

    if cancelled_booking.availability_slot_id is not null then
      update public.availability_slots
      set status = 'available'
      where id = cancelled_booking.availability_slot_id;
    end if;

    perform public.add_booking_history(
      cancelled_booking, 'booking_cancelled', 'cancelled',
      'Cours annulé', 'La récurrence a été annulée sur cette période.'
    );
    for participant_id in
      select booking_participants.student_id
      from public.booking_participants
      where booking_participants.booking_id = cancelled_booking.id
    loop
      perform public.create_app_notification(
        participant_id, 'booking_cancelled', 'Réservation annulée',
        'Une réservation récurrente a été annulée.', 'booking', cancelled_booking.id,
        cancelled_booking.id, jsonb_build_object(
          'status', cancelled_booking.status,
          'cancelledBy', 'coach',
          'recurrenceRangeStart', p_starts_on,
          'recurrenceRangeEnd', p_ends_on
        )
      );
    end loop;
  end loop;

  if cancelled_count = 0 then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;

  return cancelled_count;
end;
$$;

revoke all on function public.create_coach_booking(
  uuid[], timestamptz, integer, text, text, date
) from public;
revoke all on function public.modify_booking(
  uuid, uuid[], timestamptz, integer, text, text
) from public;
revoke all on function public.cancel_booking_recurrences(uuid, date, date)
  from public;

grant execute on function public.create_coach_booking(
  uuid[], timestamptz, integer, text, text, date
) to authenticated;
grant execute on function public.modify_booking(
  uuid, uuid[], timestamptz, integer, text, text
) to authenticated;
grant execute on function public.cancel_booking_recurrences(uuid, date, date)
  to authenticated;

reset timezone;
