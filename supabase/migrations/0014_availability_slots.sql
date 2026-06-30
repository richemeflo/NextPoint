create type public.availability_slot_status as enum (
  'available',
  'booked',
  'cancelled'
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  availability_range_id uuid not null
    references public.availability_ranges(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes in (60, 90)),
  location text not null
    check (trim(location) in ('Les Bruyères Centre Sportif')),
  status public.availability_slot_status not null default 'available'
    check (status::text in ('available', 'booked', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at > starts_at),
  check (ends_at = starts_at + (duration_minutes || ' minutes')::interval)
);

comment on table public.availability_slots is
  'Generated requestable scheduling slots. Booking commands are introduced by Epic 4 and may block slots by status.';

create unique index availability_slots_range_start_unique
  on public.availability_slots (availability_range_id, starts_at)
  where deleted_at is null;

create index availability_slots_requestable_idx
  on public.availability_slots (starts_at, coach_id)
  where status = 'available' and deleted_at is null;

create index availability_slots_coach_start_idx
  on public.availability_slots (coach_id, starts_at)
  where deleted_at is null;

alter table public.availability_slots enable row level security;

revoke all on table public.availability_slots from anon, authenticated;
grant select on table public.availability_slots to authenticated;
grant all on table public.availability_slots to service_role;

create policy availability_slots_select_own_coach
  on public.availability_slots
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
    and deleted_at is null
  );

create trigger availability_slots_set_updated_at
  before update on public.availability_slots
  for each row execute function public.set_updated_at();

create or replace function public.create_availability_range(
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_slot_duration_minutes integer,
  p_location text,
  p_recurrence_type public.availability_recurrence_type
)
returns public.availability_ranges
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  created_range public.availability_ranges;
  slot_start timestamptz;
  slot_end timestamptz;
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

  insert into public.availability_ranges (
    coach_id,
    starts_at,
    ends_at,
    slot_duration_minutes,
    location,
    recurrence_type
  )
  values (
    current_coach_id,
    p_starts_at,
    p_ends_at,
    p_slot_duration_minutes,
    trim(p_location),
    coalesce(p_recurrence_type, 'none')
  )
  returning * into created_range;

  slot_start := created_range.starts_at;

  while slot_start + (created_range.slot_duration_minutes || ' minutes')::interval
    <= created_range.ends_at
  loop
    slot_end :=
      slot_start + (created_range.slot_duration_minutes || ' minutes')::interval;

    insert into public.availability_slots (
      availability_range_id,
      coach_id,
      starts_at,
      ends_at,
      duration_minutes,
      location,
      status
    )
    values (
      created_range.id,
      created_range.coach_id,
      slot_start,
      slot_end,
      created_range.slot_duration_minutes,
      created_range.location,
      'available'
    );

    slot_start := slot_end;
  end loop;

  return created_range;
end;
$$;
