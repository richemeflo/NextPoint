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

  update public.bookings
  set status = 'refused',
      coach_refusal_comment = 'Désolé, le créneau n''est plus disponible, veuillez essayer un autre créneau.',
      decided_at = now()
  where availability_slot_id = target_booking.availability_slot_id
    and id <> target_booking.id
    and status = 'pending';

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

  return updated_booking;
end;
$$;

grant execute on function public.approve_booking(uuid) to authenticated;
