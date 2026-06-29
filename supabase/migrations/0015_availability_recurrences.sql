alter table public.availability_ranges
  add column recurrence_ends_on date;

alter table public.availability_ranges
  add constraint availability_ranges_recurrence_horizon_valid
  check (
    (
      recurrence_type = 'none'
      and recurrence_ends_on is null
    )
    or (
      recurrence_type in ('daily', 'weekly')
      and recurrence_ends_on is not null
      and recurrence_ends_on >= starts_at::date
    )
  );

alter table public.availability_slots
  add constraint availability_slots_no_overlap_active
  exclude using gist (
    coach_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (deleted_at is null and status <> 'cancelled');

drop function if exists public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type
);

create or replace function public.create_availability_range(
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_slot_duration_minutes integer,
  p_location text,
  p_recurrence_type public.availability_recurrence_type,
  p_recurrence_ends_on date
)
returns public.availability_ranges
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  created_range public.availability_ranges;
  occurrence_start timestamptz;
  occurrence_end timestamptz;
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
    recurrence_type,
    recurrence_ends_on
  )
  values (
    current_coach_id,
    p_starts_at,
    p_ends_at,
    p_slot_duration_minutes,
    trim(p_location),
    coalesce(p_recurrence_type, 'none'),
    p_recurrence_ends_on
  )
  returning * into created_range;

  occurrence_start := created_range.starts_at;
  occurrence_end := created_range.ends_at;

  loop
    exit when occurrence_start::date >
      coalesce(created_range.recurrence_ends_on, created_range.starts_at::date);

    slot_start := occurrence_start;

    while slot_start + (created_range.slot_duration_minutes || ' minutes')::interval
      <= occurrence_end
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

    if created_range.recurrence_type = 'none' then
      exit;
    elsif created_range.recurrence_type = 'daily' then
      occurrence_start := occurrence_start + interval '1 day';
      occurrence_end := occurrence_end + interval '1 day';
    else
      occurrence_start := occurrence_start + interval '1 week';
      occurrence_end := occurrence_end + interval '1 week';
    end if;
  end loop;

  return created_range;
end;
$$;

revoke all on function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type,
  date
) from public;
grant execute on function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type,
  date
) to authenticated;
