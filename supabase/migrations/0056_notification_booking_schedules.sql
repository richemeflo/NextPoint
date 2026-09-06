create or replace function public.get_notification_booking_schedules(
  p_notification_ids uuid[]
)
returns table (
  notification_id uuid,
  starts_at timestamptz,
  ends_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  requester_id uuid := auth.uid();
begin
  if requester_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if cardinality(coalesce(p_notification_ids, '{}'::uuid[])) > 100 then
    raise exception 'too many notification ids' using errcode = '22023';
  end if;

  return query
  select notifications.id, bookings.starts_at, bookings.ends_at
  from public.notifications notifications
  join public.bookings bookings on bookings.id = notifications.booking_id
  where notifications.recipient_id = requester_id
    and notifications.id = any(coalesce(p_notification_ids, '{}'::uuid[]));
end;
$$;

revoke all on function public.get_notification_booking_schedules(uuid[])
  from public;
grant execute on function public.get_notification_booking_schedules(uuid[])
  to authenticated;
