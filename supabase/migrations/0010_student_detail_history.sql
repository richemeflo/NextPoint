create type public.student_history_event_type as enum (
  'booking_requested',
  'lesson_confirmed',
  'booking_cancelled',
  'booking_modified',
  'lesson_pack_assigned',
  'lesson_pack_consumed'
);

create type public.student_history_event_status as enum (
  'pending',
  'confirmed',
  'refused',
  'expired',
  'cancelled',
  'modified',
  'active',
  'exhausted'
);

create table public.student_history_events (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  event_type public.student_history_event_type not null,
  status public.student_history_event_status not null,
  title text not null check (char_length(trim(title)) between 2 and 120),
  description text check (
    description is null
    or char_length(trim(description)) between 2 and 500
  ),
  source_id uuid,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

comment on table public.student_history_events is
  'Coach-only student activity read model. It excludes private notes and sports progress.';

create index idx_student_history_events_student_occurred
  on public.student_history_events (student_id, occurred_at desc);

alter table public.student_history_events enable row level security;

revoke all on table public.student_history_events from anon, authenticated;
grant select on table public.student_history_events to authenticated;
grant all on table public.student_history_events to service_role;

create policy student_history_events_select_associated_coach
  on public.student_history_events
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = (select auth.uid())
        and student_coach_relationships.student_id =
          student_history_events.student_id
        and student_coach_relationships.status = 'active'
    )
  );
