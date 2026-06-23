create table public.student_private_notes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  content text not null
    check (char_length(trim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_private_notes_unique_owner_student
    unique (coach_id, student_id)
);

comment on table public.student_private_notes is
  'Single private note per coach and student. Never exposed to student read models.';

alter table public.student_private_notes enable row level security;

revoke all on table public.student_private_notes from anon, authenticated;
grant select on table public.student_private_notes to authenticated;
grant all on table public.student_private_notes to service_role;

create policy student_private_notes_select_owner
  on public.student_private_notes
  for select
  to authenticated
  using (
    coach_id = (select auth.uid())
    and exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = (select auth.uid())
        and student_coach_relationships.student_id =
          student_private_notes.student_id
        and student_coach_relationships.status = 'active'
    )
  );

create trigger student_private_notes_set_updated_at
  before update on public.student_private_notes
  for each row execute function public.set_updated_at();

create or replace function public.save_student_private_note(
  p_student_id uuid,
  p_content text
)
returns public.student_private_notes
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
  saved_note public.student_private_notes;
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

  if not exists (
    select 1
    from public.student_coach_relationships
    where student_coach_relationships.coach_id = current_coach_id
      and student_coach_relationships.student_id = p_student_id
      and student_coach_relationships.status = 'active'
  ) then
    raise exception 'active coach-student relationship required'
      using errcode = '42501';
  end if;

  if char_length(trim(coalesce(p_content, ''))) not between 1 and 2000 then
    raise exception 'invalid private note' using errcode = '22023';
  end if;

  insert into public.student_private_notes (
    coach_id,
    student_id,
    content
  )
  values (
    current_coach_id,
    p_student_id,
    trim(p_content)
  )
  on conflict (coach_id, student_id) do update
    set content = excluded.content,
        updated_at = now()
  returning * into saved_note;

  return saved_note;
end;
$$;

revoke all on function public.save_student_private_note(uuid, text)
  from public;
grant execute on function public.save_student_private_note(uuid, text)
  to authenticated;
