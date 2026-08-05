drop function if exists public.cancel_booking(uuid);
drop function if exists public.cancel_booking(uuid, text);

create function public.cancel_booking(
  p_booking_id uuid,
  p_cancellation_message text default null
)
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
  normalized_message text := regexp_replace(
    coalesce(p_cancellation_message, ''),
    '^[[:space:]]+|[[:space:]]+$',
    '',
    'g'
  );
  history_title text;
  history_description text;
  notification_title text;
  notification_body text;
  target_thread_id uuid;
begin
  select user_roles.role
    into actor_role
  from public.user_roles
  where user_roles.user_id = actor_id
  limit 1;

  if actor_role is null or actor_role not in ('coach', 'eleve') then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select *
    into target_booking
  from public.bookings
  where id = p_booking_id
    and (
      (actor_role = 'coach' and coach_id = actor_id)
      or (actor_role = 'eleve' and student_id = actor_id)
    )
  for update;

  if target_booking.id is null then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;

  if actor_role = 'coach' then
    if target_booking.status not in ('confirmed', 'modified') then
      raise exception 'booking already processed' using errcode = '55000';
    end if;
  elsif actor_role = 'eleve' then
    if target_booking.status not in ('pending', 'confirmed', 'modified') then
      raise exception 'booking already processed' using errcode = '55000';
    end if;

    if target_booking.starts_at <= clock_timestamp() then
      raise exception 'past booking' using errcode = '22023';
    end if;

    if normalized_message = '' then
      raise exception 'student cancellation message is required' using errcode = '22023';
    end if;

    if char_length(normalized_message) > 500 then
      raise exception 'student cancellation message is too long' using errcode = '22023';
    end if;

    select coach_message_threads.id
      into target_thread_id
    from public.coach_message_threads
    where coach_message_threads.booking_id = target_booking.id
      and coach_message_threads.coach_id = target_booking.coach_id
    for update;

    if target_thread_id is null then
      raise exception 'booking message thread not found' using errcode = 'P0002';
    end if;
  end if;

  update public.bookings
  set status = 'cancelled',
      cancelled_at = clock_timestamp()
  where id = target_booking.id
  returning * into updated_booking;

  if target_booking.status in ('confirmed', 'modified')
    and target_booking.availability_slot_id is not null
  then
    update public.availability_slots
    set status = 'available'
    where id = target_booking.availability_slot_id;
  end if;

  if actor_role = 'eleve' then
    history_title := case
      when target_booking.status = 'pending' then 'Demande annulée'
      else 'Cours annulé'
    end;
    history_description := normalized_message;
    notification_title := 'Annulation par l’élève';
    notification_body := normalized_message;

    insert into public.coach_messages (thread_id, sender_id, body, created_at)
    values (target_thread_id, actor_id, normalized_message, clock_timestamp());
  else
    history_title := 'Cours annulé';
    history_description := 'La réservation a été annulée.';
    notification_title := 'Réservation annulée';
    notification_body := 'Une réservation a été annulée.';
  end if;

  perform public.add_booking_history(
    updated_booking,
    'booking_cancelled',
    'cancelled',
    history_title,
    history_description
  );

  recipient_id := case
    when actor_role = 'coach' then updated_booking.student_id
    else updated_booking.coach_id
  end;

  perform public.create_app_notification(
    recipient_id,
    'booking_cancelled',
    notification_title,
    notification_body,
    'booking',
    updated_booking.id,
    updated_booking.id,
    jsonb_build_object(
      'status', updated_booking.status,
      'cancelledBy', actor_role,
      'cancellationMessage', case
        when actor_role = 'eleve' then normalized_message
        else null
      end
    )
  );

  return updated_booking;
end;
$$;

revoke all on function public.cancel_booking(uuid, text) from public;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
