set timezone = 'Europe/Paris';

-- Availability slots are kept as technical occurrences so existing booking
-- foreign keys remain valid. They no longer represent pre-cut lessons.
alter table public.availability_slots
  drop constraint if exists availability_slots_no_overlap_active,
  drop constraint if exists availability_slots_duration_minutes_check,
  drop constraint if exists availability_slots_check1;

alter table public.availability_slots
  add constraint availability_slots_duration_minutes_positive
    check (duration_minutes >= 60),
  add constraint availability_slots_bounds_match_duration
    check (ends_at = starts_at + (duration_minutes || ' minutes')::interval);

drop index if exists public.bookings_single_confirmed_slot_idx;

update public.availability_slots slot
set status = 'cancelled',
    deleted_at = coalesce(slot.deleted_at, now())
from public.availability_ranges availability_range
where availability_range.id = slot.availability_range_id
  and availability_range.deleted_at is not null
  and slot.deleted_at is null;

-- Merge only contiguous active legacy slots. Cancelled/deleted slots are
-- deliberate exceptions and must never be resurrected or bridged.
create temporary table availability_occurrence_segments on commit drop as
with slot_context as (
  select s.*,
         r.starts_at as range_starts_at,
         r.ends_at as range_ends_at,
         s.starts_at::date as local_date,
         (s.deleted_at is null and s.status <> 'cancelled') as is_active
  from public.availability_slots s
  join public.availability_ranges r on r.id = s.availability_range_id
  where r.deleted_at is null
), active_marked as (
  select c.*,
         case
           when lag(c.ends_at) over (
             partition by c.availability_range_id, c.local_date
             order by c.starts_at, c.id
           ) = c.starts_at then 0
           else 1
         end as starts_segment
  from slot_context c
  where c.is_active
), active_numbered as (
  select m.*,
         sum(m.starts_segment) over (
           partition by m.availability_range_id, m.local_date
           order by m.starts_at, m.id
         ) as segment_number
  from active_marked m
), occurrence_context as (
  select c.availability_range_id,
         c.local_date,
         min(c.starts_at) as recorded_start,
         max(c.ends_at) filter (where c.is_active) as last_active_end,
         min(c.range_starts_at) as range_starts_at,
         min(c.range_ends_at) as range_ends_at
  from slot_context c
  group by c.availability_range_id, c.local_date
), segments as (
  select n.availability_range_id,
         n.local_date,
         n.segment_number,
         (array_agg(n.id order by n.starts_at, n.id))[1] as kept_id,
         array_agg(n.id order by n.starts_at, n.id) as old_ids,
         min(n.starts_at) as occurrence_start,
         max(n.ends_at) as active_segment_end
  from active_numbered n
  group by n.availability_range_id, n.local_date, n.segment_number
)
select g.kept_id,
       g.old_ids,
       g.occurrence_start,
       case
         when g.active_segment_end = c.last_active_end
          and c.recorded_start::time = c.range_starts_at::time
          and not exists (
            select 1
            from slot_context exception_slot
            where exception_slot.availability_range_id = g.availability_range_id
              and exception_slot.local_date = g.local_date
              and not exception_slot.is_active
              and exception_slot.starts_at >= g.active_segment_end
          )
         then greatest(
           g.active_segment_end,
           c.recorded_start + (c.range_ends_at - c.range_starts_at)
         )
         else g.active_segment_end
       end as occurrence_end
from segments g
join occurrence_context c
  on c.availability_range_id = g.availability_range_id
 and c.local_date = g.local_date;

create temporary table availability_occurrence_migration_map on commit drop as
select ids.old_id,
       s.kept_id,
       s.occurrence_start,
       s.occurrence_end
from availability_occurrence_segments s
cross join lateral unnest(s.old_ids) as ids(old_id);

update public.bookings b
set availability_slot_id = m.kept_id
from availability_occurrence_migration_map m
where b.availability_slot_id = m.old_id
  and m.old_id <> m.kept_id;

update public.availability_slots s
set status = 'cancelled',
    deleted_at = coalesce(s.deleted_at, now())
from availability_occurrence_migration_map m
where s.id = m.old_id
  and m.old_id <> m.kept_id;

update public.availability_slots s
set starts_at = m.occurrence_start,
    ends_at = m.occurrence_end,
    duration_minutes = extract(epoch from (m.occurrence_end - m.occurrence_start))::integer / 60,
    status = 'available',
    deleted_at = null
from availability_occurrence_migration_map m
where s.id = m.kept_id;

alter table public.availability_slots
  add constraint availability_slots_no_overlap_active
  exclude using gist (
    coach_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (deleted_at is null and status <> 'cancelled')
  deferrable initially immediate;

comment on table public.availability_slots is
  'Continuous technical availability occurrences. Students choose a 60 or 90 minute lesson inside an occurrence.';

create index bookings_confirmed_coach_bounds_idx
  on public.bookings (coach_id, starts_at, ends_at)
  where status in ('confirmed', 'modified');

drop function if exists public.create_availability_range(
  timestamptz, timestamptz, integer, text,
  public.availability_recurrence_type, date
);

create function public.create_availability_range(
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
set timezone = 'Europe/Paris'
as $$
declare
  current_coach_id uuid := auth.uid();
  created_range public.availability_ranges;
  occurrence_start timestamptz := p_starts_at;
  occurrence_end timestamptz := p_ends_at;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles
    where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if p_slot_duration_minutes not in (60, 90)
    or p_ends_at <= p_starts_at
    or p_ends_at < p_starts_at + interval '60 minutes'
  then
    raise exception 'availability range too short' using errcode = '22023';
  end if;

  insert into public.availability_ranges (
    coach_id, starts_at, ends_at, slot_duration_minutes, location,
    recurrence_type, recurrence_ends_on
  ) values (
    current_coach_id, p_starts_at, p_ends_at, 60, trim(p_location),
    coalesce(p_recurrence_type, 'none'), p_recurrence_ends_on
  ) returning * into created_range;

  loop
    exit when occurrence_start::date >
      coalesce(created_range.recurrence_ends_on, created_range.starts_at::date);

    insert into public.availability_slots (
      availability_range_id, coach_id, starts_at, ends_at,
      duration_minutes, location, status
    ) values (
      created_range.id, current_coach_id, occurrence_start, occurrence_end,
      extract(epoch from (occurrence_end - occurrence_start))::integer / 60,
      created_range.location, 'available'
    );

    exit when created_range.recurrence_type = 'none';
    if created_range.recurrence_type = 'daily' then
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
  timestamptz, timestamptz, integer, text,
  public.availability_recurrence_type, date
) from public;
grant execute on function public.create_availability_range(
  timestamptz, timestamptz, integer, text,
  public.availability_recurrence_type, date
) to authenticated;

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
  duration_delta interval;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if p_duration_minutes < 60 or p_ends_at <= p_starts_at
    or p_ends_at <> p_starts_at + (p_duration_minutes || ' minutes')::interval
  then
    raise exception 'invalid occurrence boundaries' using errcode = '22023';
  end if;

  select * into target_slot from public.availability_slots
  where id = p_slot_id and coach_id = current_coach_id and deleted_at is null
  for update;
  if target_slot.id is null then
    raise exception 'availability occurrence not found' using errcode = '42501';
  end if;
  if target_slot.status <> 'available' then
    raise exception 'availability occurrence is blocked' using errcode = '55000';
  end if;
  if exists (
    select 1 from public.bookings b
    where b.availability_slot_id = target_slot.id
      and b.status in ('pending', 'confirmed', 'modified')
  ) then
    raise exception 'availability occurrence is blocked' using errcode = '55000';
  end if;

  select * into source_range from public.availability_ranges
  where id = target_slot.availability_range_id and coach_id = current_coach_id
  for update;
  starts_delta := p_starts_at - target_slot.starts_at;
  duration_delta := (p_ends_at - p_starts_at) - (target_slot.ends_at - target_slot.starts_at);
  set constraints public.availability_slots_no_overlap_active deferred;

  if coalesce(p_apply_to_series, false) then
    if exists (
      select 1 from public.bookings b
      join public.availability_slots s on s.id = b.availability_slot_id
      where s.availability_range_id = target_slot.availability_range_id
        and b.status in ('pending', 'confirmed', 'modified')
    ) then
      raise exception 'availability series is blocked' using errcode = '55000';
    end if;
    update public.availability_ranges
    set starts_at = starts_at + starts_delta,
        ends_at = ends_at + starts_delta + duration_delta,
        location = trim(p_location)
    where id = source_range.id;
    return query
      update public.availability_slots
      set starts_at = starts_at + starts_delta,
          ends_at = ends_at + starts_delta + duration_delta,
          duration_minutes = duration_minutes + extract(epoch from duration_delta)::integer / 60,
          location = trim(p_location)
      where availability_range_id = source_range.id and deleted_at is null
      returning *;
  end if;

  return query update public.availability_slots
  set starts_at = p_starts_at, ends_at = p_ends_at,
      duration_minutes = p_duration_minutes, location = trim(p_location)
  where id = target_slot.id returning *;
end;
$$;

create or replace function public.get_student_availability_occurrences(
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns table (
  id uuid,
  availability_range_id uuid,
  coach_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes integer,
  location text,
  status public.availability_slot_status,
  updated_at timestamptz,
  occupations jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id,
         s.availability_range_id,
         s.coach_id,
         s.starts_at,
         s.ends_at,
         s.duration_minutes,
         s.location,
         s.status,
         s.updated_at,
         coalesce(
           jsonb_agg(
             jsonb_build_object('startsAt', b.starts_at, 'endsAt', b.ends_at)
             order by b.starts_at
           ) filter (where b.id is not null),
           '[]'::jsonb
         ) as occupations
  from public.availability_slots s
  join public.availability_ranges availability_range
    on availability_range.id = s.availability_range_id
   and availability_range.deleted_at is null
  left join public.bookings b
    on b.coach_id = s.coach_id
   and b.status in ('confirmed', 'modified')
   and tstzrange(b.starts_at, b.ends_at, '[)') &&
       tstzrange(s.starts_at, s.ends_at, '[)')
  where s.deleted_at is null
    and s.status = 'available'
    and p_ends_at > p_starts_at
    and p_ends_at <= p_starts_at + interval '31 days'
    and s.starts_at < p_ends_at
    and s.ends_at > p_starts_at
    and exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid() and r.role = 'eleve'
    )
    and exists (
      select 1 from public.student_coach_relationships rel
      where rel.student_id = auth.uid()
        and rel.coach_id = s.coach_id
        and rel.status = 'active'
    )
  group by s.id
  order by s.starts_at, s.id;
$$;

revoke all on function public.get_student_availability_occurrences(
  timestamptz, timestamptz
) from public;
grant execute on function public.get_student_availability_occurrences(
  timestamptz, timestamptz
) to authenticated;

drop function if exists public.request_booking(uuid, text, text, uuid[]);

create function public.request_booking(
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

  if exists (
    select 1 from public.bookings b
    where b.coach_id = target_slot.coach_id
      and b.status in ('confirmed', 'modified')
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(p_starts_at, requested_end, '[)')
  ) then
    raise exception 'slot unavailable' using errcode = '55000';
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

create or replace function public.approve_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  target_coach_id uuid;
  target_booking public.bookings;
  updated_booking public.bookings;
  refused_booking public.bookings;
  auto_refusal_comment text :=
    'Désolé, le créneau n''est plus disponible, veuillez essayer un autre créneau.';
begin
  select coach_id into target_coach_id
  from public.bookings
  where id = p_booking_id;
  if target_coach_id is null then
    raise exception 'booking not found' using errcode = 'P0002';
  end if;
  if target_coach_id <> current_coach_id or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  -- Every command touching a coach schedule takes the same lock before row
  -- locks, preventing two overlapping approvals from deadlocking each other.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));
  select * into target_booking
  from public.bookings
  where id = p_booking_id
  for update;
  if target_booking.status <> 'pending' then
    raise exception 'booking already processed' using errcode = '55000';
  end if;
  if target_booking.expires_at is not null and target_booking.expires_at <= now() then
    raise exception 'booking already processed' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.bookings b
    where b.coach_id = current_coach_id
      and b.id <> target_booking.id
      and b.status in ('confirmed', 'modified')
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(target_booking.starts_at, target_booking.ends_at, '[)')
  ) then
    raise exception 'slot unavailable' using errcode = '55000';
  end if;

  for refused_booking in
    update public.bookings b
    set status = 'refused', coach_refusal_comment = auto_refusal_comment, decided_at = now()
    where b.coach_id = current_coach_id
      and b.id <> target_booking.id
      and b.status = 'pending'
      and (b.expires_at is null or b.expires_at > now())
      and tstzrange(b.starts_at, b.ends_at, '[)') &&
          tstzrange(target_booking.starts_at, target_booking.ends_at, '[)')
    returning b.*
  loop
    perform public.add_booking_history(
      refused_booking, 'booking_cancelled', 'refused', 'Demande refusée', auto_refusal_comment
    );
    perform public.create_app_notification(
      refused_booking.student_id, 'booking_refused', 'Demande refusée',
      auto_refusal_comment, 'booking', refused_booking.id, refused_booking.id,
      jsonb_build_object('status', refused_booking.status, 'refusalComment', auto_refusal_comment)
    );
  end loop;

  update public.bookings
  set status = 'confirmed', decided_at = now()
  where id = target_booking.id returning * into updated_booking;

  perform public.add_booking_history(
    updated_booking, 'lesson_confirmed', 'confirmed',
    'Cours confirmé', 'Le coach a validé la demande.'
  );
  perform public.create_app_notification(
    updated_booking.student_id, 'booking_approved', 'Demande validée',
    'Votre cours est confirmé.', 'booking', updated_booking.id,
    updated_booking.id, jsonb_build_object('status', updated_booking.status)
  );
  return updated_booking;
end;
$$;

grant execute on function public.approve_booking(uuid) to authenticated;

create or replace function public.refuse_overlapping_pending_bookings(
  p_coach_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  refused_booking public.bookings;
  auto_refusal_comment text :=
    'Désolé, le créneau n''est plus disponible, veuillez essayer un autre créneau.';
begin
  for refused_booking in
    update public.bookings b
    set status = 'refused', coach_refusal_comment = auto_refusal_comment, decided_at = now()
    where b.coach_id = p_coach_id
      and b.status = 'pending'
      and (b.expires_at is null or b.expires_at > now())
      and tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    returning b.*
  loop
    perform public.add_booking_history(
      refused_booking, 'booking_cancelled', 'refused', 'Demande refusée', auto_refusal_comment
    );
    perform public.create_app_notification(
      refused_booking.student_id, 'booking_refused', 'Demande refusée',
      auto_refusal_comment, 'booking', refused_booking.id, refused_booking.id,
      jsonb_build_object('status', refused_booking.status, 'refusalComment', auto_refusal_comment)
    );
  end loop;
end;
$$;

revoke all on function public.refuse_overlapping_pending_bookings(
  uuid, timestamptz, timestamptz
) from public;

create or replace function public.create_coach_booking(
  p_student_ids uuid[], p_starts_at timestamptz, p_duration_minutes integer,
  p_location text, p_lesson_type text, p_recurrence_ends_on date
)
returns setof public.bookings
language plpgsql
security definer
set search_path = ''
set timezone = 'Europe/Paris'
as $$
declare
  current_coach_id uuid := auth.uid();
  primary_student_id uuid;
  participant_id uuid;
  occurrence_start timestamptz := p_starts_at;
  occurrence_end timestamptz;
  selected_rate public.pricing_rates;
  created_booking public.bookings;
begin
  if current_coach_id is null or not exists (
    select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;
  if cardinality(coalesce(p_student_ids, '{}')) = 0
    or cardinality(p_student_ids) > 4
    or cardinality(array(select distinct unnest(p_student_ids))) <> cardinality(p_student_ids)
  then
    raise exception 'invalid participants' using errcode = '22023';
  end if;

  primary_student_id := p_student_ids[1];
  foreach participant_id in array p_student_ids loop
    perform public.assert_active_student_for_coach(current_coach_id, participant_id);
  end loop;
  selected_rate := public.select_booking_pricing_rate(
    current_coach_id, primary_student_id, p_lesson_type, p_duration_minutes
  );
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));

  while p_recurrence_ends_on is null or occurrence_start::date <= p_recurrence_ends_on loop
    occurrence_end := occurrence_start + (p_duration_minutes || ' minutes')::interval;
    insert into public.bookings (
      coach_id, student_id, pricing_rate_id, lesson_type, status, origin,
      starts_at, ends_at, duration_minutes, location, decided_at
    ) values (
      current_coach_id, primary_student_id, selected_rate.id, p_lesson_type,
      'confirmed', 'coach_created', occurrence_start, occurrence_end,
      p_duration_minutes, trim(p_location), now()
    ) returning * into created_booking;

    perform public.add_booking_participants(created_booking.id, primary_student_id, p_student_ids);
    perform public.add_booking_history(
      created_booking, 'lesson_confirmed', 'confirmed',
      'Cours planifié', 'Le coach a créé le cours directement.'
    );
    perform public.refuse_overlapping_pending_bookings(
      current_coach_id, occurrence_start, occurrence_end
    );
    return next created_booking;

    exit when p_recurrence_ends_on is null;
    occurrence_start := occurrence_start + interval '7 days';
  end loop;
  return;
end;
$$;

grant execute on function public.create_coach_booking(
  uuid[], timestamptz, integer, text, text, date
) to authenticated;

create or replace function public.modify_booking(
  p_booking_id uuid, p_starts_at timestamptz,
  p_duration_minutes integer, p_location text
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  updated_booking public.bookings;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(current_coach_id::text));
  update public.bookings
  set status = 'modified', starts_at = p_starts_at,
      ends_at = p_starts_at + (p_duration_minutes || ' minutes')::interval,
      duration_minutes = p_duration_minutes, location = trim(p_location), modified_at = now()
  where id = p_booking_id and coach_id = current_coach_id
    and status in ('confirmed', 'modified')
    and exists (
      select 1 from public.user_roles where user_id = current_coach_id and role = 'coach'
    )
  returning * into updated_booking;
  if updated_booking.id is null then
    raise exception 'booking cannot be modified' using errcode = '55000';
  end if;

  perform public.add_booking_history(
    updated_booking, 'booking_modified', 'modified',
    'Cours modifié', 'Le coach a modifié la réservation.'
  );
  perform public.create_app_notification(
    updated_booking.student_id, 'booking_modified', 'Réservation modifiée',
    'Le coach a modifié votre réservation.', 'booking', updated_booking.id,
    updated_booking.id, jsonb_build_object('status', updated_booking.status)
  );
  perform public.refuse_overlapping_pending_bookings(
    current_coach_id, updated_booking.starts_at, updated_booking.ends_at
  );
  return updated_booking;
end;
$$;

grant execute on function public.modify_booking(uuid, timestamptz, integer, text)
  to authenticated;

reset timezone;
