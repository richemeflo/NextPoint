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
    target_slot.coach_id, requester_id, p_lesson_type, p_duration_minutes
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

revoke all on function public.request_booking(
  uuid, timestamptz, integer, text, text, uuid[]
) from public;
grant execute on function public.request_booking(
  uuid, timestamptz, integer, text, text, uuid[]
) to authenticated;
