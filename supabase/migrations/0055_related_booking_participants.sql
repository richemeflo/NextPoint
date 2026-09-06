create or replace function public.get_related_booking_participants(
  p_booking_ids uuid[]
)
returns table (
  booking_id uuid,
  student_id uuid,
  full_name text
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

  if cardinality(coalesce(p_booking_ids, '{}'::uuid[])) > 100 then
    raise exception 'too many booking ids' using errcode = '22023';
  end if;

  return query
  select participants.booking_id, participants.student_id, profiles.full_name
  from public.booking_participants participants
  join public.bookings bookings on bookings.id = participants.booking_id
  left join public.student_profiles profiles
    on profiles.user_id = participants.student_id
  where participants.booking_id = any(coalesce(p_booking_ids, '{}'::uuid[]))
    and (
      bookings.student_id = requester_id
      or bookings.coach_id = requester_id
    )
  order by participants.booking_id, participants.created_at, participants.student_id;
end;
$$;

revoke all on function public.get_related_booking_participants(uuid[]) from public;
grant execute on function public.get_related_booking_participants(uuid[])
  to authenticated;
