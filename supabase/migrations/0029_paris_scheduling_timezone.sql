alter function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type,
  date
) set timezone = 'Europe/Paris';

alter function public.create_coach_booking(
  uuid[],
  timestamptz,
  integer,
  text,
  text,
  date
) set timezone = 'Europe/Paris';

comment on function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type,
  date
) is
  'Creates Paris-local availability ranges and keeps recurring wall-clock times stable across DST changes.';

comment on function public.create_coach_booking(
  uuid[],
  timestamptz,
  integer,
  text,
  text,
  date
) is
  'Creates Paris-local coach bookings and keeps weekly wall-clock times stable across DST changes.';
