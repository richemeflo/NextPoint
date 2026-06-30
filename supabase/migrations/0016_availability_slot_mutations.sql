alter table public.availability_slots
  drop constraint availability_slots_no_overlap_active;

alter table public.availability_slots
  add constraint availability_slots_no_overlap_active
  exclude using gist (
    coach_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (deleted_at is null and status <> 'cancelled')
  deferrable initially immediate;

create or replace function public.update_availability_slot(
  p_slot_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_duration_minutes integer,
  p_location text,
  p_apply_to_series boolean
)
returns setof public.availability_slots
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  target_slot public.availability_slots;
  source_range public.availability_ranges;
  starts_delta interval;
  normalized_location text := trim(p_location);
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

  if p_ends_at <= p_starts_at
    or p_ends_at <> p_starts_at + (p_duration_minutes || ' minutes')::interval
  then
    raise exception 'invalid slot boundaries' using errcode = '22023';
  end if;

  select *
  into target_slot
  from public.availability_slots
  where id = p_slot_id
    and coach_id = current_coach_id
    and deleted_at is null
  for update;

  if target_slot.id is null then
    raise exception 'availability slot not found' using errcode = '42501';
  end if;

  if target_slot.status <> 'available' then
    raise exception 'availability slot is blocked' using errcode = '55000';
  end if;

  select *
  into source_range
  from public.availability_ranges
  where id = target_slot.availability_range_id
    and coach_id = current_coach_id
    and deleted_at is null
  for update;

  if source_range.id is null then
    raise exception 'availability range not found' using errcode = '42501';
  end if;

  if coalesce(p_apply_to_series, false)
    and exists (
      select 1
      from public.availability_slots
      where availability_range_id = target_slot.availability_range_id
        and deleted_at is null
        and status <> 'available'
    )
  then
    raise exception 'availability series contains blocked slots' using errcode = '55000';
  end if;

  set constraints availability_slots_no_overlap_active deferred;

  if coalesce(p_apply_to_series, false) then
    starts_delta := p_starts_at - target_slot.starts_at;

    update public.availability_ranges
    set starts_at = starts_at + starts_delta,
        ends_at = ends_at + starts_delta,
        slot_duration_minutes = p_duration_minutes,
        location = normalized_location
    where id = source_range.id;

    return query
      update public.availability_slots
      set starts_at = starts_at + starts_delta,
          ends_at = starts_at + starts_delta + (p_duration_minutes || ' minutes')::interval,
          duration_minutes = p_duration_minutes,
          location = normalized_location
      where availability_range_id = source_range.id
        and deleted_at is null
      returning *;
  end if;

  return query
    update public.availability_slots
    set starts_at = p_starts_at,
        ends_at = p_ends_at,
        duration_minutes = p_duration_minutes,
        location = normalized_location
    where id = target_slot.id
    returning *;
end;
$$;

create or replace function public.delete_availability_slot(
  p_slot_id uuid,
  p_apply_to_series boolean
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  target_slot public.availability_slots;
  deleted_count integer := 0;
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

  select *
  into target_slot
  from public.availability_slots
  where id = p_slot_id
    and coach_id = current_coach_id
    and deleted_at is null
  for update;

  if target_slot.id is null then
    raise exception 'availability slot not found' using errcode = '42501';
  end if;

  if target_slot.status <> 'available' then
    raise exception 'availability slot is blocked' using errcode = '55000';
  end if;

  if coalesce(p_apply_to_series, false)
    and exists (
      select 1
      from public.availability_slots
      where availability_range_id = target_slot.availability_range_id
        and deleted_at is null
        and status <> 'available'
    )
  then
    raise exception 'availability series contains blocked slots' using errcode = '55000';
  end if;

  if coalesce(p_apply_to_series, false) then
    update public.availability_slots
    set deleted_at = now()
    where availability_range_id = target_slot.availability_range_id
      and deleted_at is null;
  else
    update public.availability_slots
    set deleted_at = now()
    where id = target_slot.id;
  end if;

  get diagnostics deleted_count = row_count;

  if not exists (
    select 1
    from public.availability_slots
    where availability_range_id = target_slot.availability_range_id
      and deleted_at is null
  ) then
    update public.availability_ranges
    set deleted_at = now()
    where id = target_slot.availability_range_id
      and deleted_at is null;
  end if;

  return deleted_count;
end;
$$;

revoke all on function public.update_availability_slot(
  uuid,
  timestamptz,
  timestamptz,
  integer,
  text,
  boolean
) from public;
grant execute on function public.update_availability_slot(
  uuid,
  timestamptz,
  timestamptz,
  integer,
  text,
  boolean
) to authenticated;

revoke all on function public.delete_availability_slot(uuid, boolean) from public;
grant execute on function public.delete_availability_slot(uuid, boolean)
  to authenticated;
