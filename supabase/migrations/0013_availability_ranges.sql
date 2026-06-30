create extension if not exists btree_gist with schema extensions;

create type public.availability_recurrence_type as enum (
  'none',
  'daily',
  'weekly'
);

create table public.availability_ranges (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  slot_duration_minutes integer not null
    check (slot_duration_minutes in (60, 90)),
  location text not null
    check (trim(location) in ('Les Bruyères Centre Sportif')),
  recurrence_type public.availability_recurrence_type not null default 'none'
    check (recurrence_type::text in ('none', 'daily', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at > starts_at),
  check (
    ends_at >= starts_at + (slot_duration_minutes || ' minutes')::interval
  )
);

comment on table public.availability_ranges is
  'Coach availability source ranges. Generated booking slots are introduced by later scheduling stories.';

alter table public.availability_ranges
  add constraint availability_ranges_no_overlap_active
  exclude using gist (
    coach_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (deleted_at is null);

create index availability_ranges_coach_starts_at_idx
  on public.availability_ranges (coach_id, starts_at)
  where deleted_at is null;

alter table public.availability_ranges enable row level security;

revoke all on table public.availability_ranges from anon, authenticated;
grant select on table public.availability_ranges to authenticated;
grant all on table public.availability_ranges to service_role;

create policy availability_ranges_select_own_coach
  on public.availability_ranges
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

create trigger availability_ranges_set_updated_at
  before update on public.availability_ranges
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

  return created_range;
end;
$$;

revoke all on function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type
) from public;
grant execute on function public.create_availability_range(
  timestamptz,
  timestamptz,
  integer,
  text,
  public.availability_recurrence_type
) to authenticated;
