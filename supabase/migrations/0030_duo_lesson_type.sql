alter table public.pricing_rates
  drop constraint pricing_rates_lesson_type_check,
  add constraint pricing_rates_lesson_type_check
    check (lesson_type in ('individual', 'duo', 'group'));

alter table public.bookings
  drop constraint bookings_lesson_type_check,
  add constraint bookings_lesson_type_check
    check (lesson_type in ('individual', 'duo', 'group'));

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
  booking_lesson_type text;
  participant_count integer;
begin
  select lesson_type
    into booking_lesson_type
  from public.bookings
  where id = p_booking_id;

  participant_count := cardinality(array(select distinct unnest(normalized_ids)));

  if booking_lesson_type is null
    or (booking_lesson_type = 'individual' and participant_count <> 1)
    or (booking_lesson_type = 'duo' and participant_count <> 2)
    or (booking_lesson_type = 'group' and participant_count > 4)
  then
    raise exception 'invalid participants' using errcode = '22023';
  end if;

  foreach participant_id in array normalized_ids
  loop
    insert into public.booking_participants (booking_id, student_id)
    values (p_booking_id, participant_id)
    on conflict do nothing;
  end loop;
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

  if p_lesson_type in ('duo', 'group') then
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
    case
      when p_lesson_type in ('duo', 'group') then p_participant_ids
      else '{}'::uuid[]
    end
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

comment on constraint pricing_rates_lesson_type_check on public.pricing_rates is
  'Supported lesson types are individual, duo and group.';

comment on constraint bookings_lesson_type_check on public.bookings is
  'Supported lesson types are individual, duo and group.';
