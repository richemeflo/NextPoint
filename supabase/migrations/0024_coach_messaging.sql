create table public.coach_message_threads (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  coach_id uuid not null references auth.users(id) on delete cascade,
  coach_read_at timestamptz,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.coach_message_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint coach_messages_body_valid check (
    body = btrim(body)
    and char_length(body) between 1 and 1000
  )
);

create index coach_message_threads_owner_activity_idx
  on public.coach_message_threads (coach_id, last_message_at desc);
create index coach_messages_thread_created_idx
  on public.coach_messages (thread_id, created_at asc);

create trigger coach_message_threads_set_updated_at
  before update on public.coach_message_threads
  for each row execute function public.set_updated_at();

alter table public.coach_message_threads enable row level security;
alter table public.coach_messages enable row level security;

revoke all on table public.coach_message_threads from anon, authenticated;
revoke all on table public.coach_messages from anon, authenticated;
grant select on table public.coach_message_threads to authenticated;
grant select on table public.coach_messages to authenticated;
grant all on table public.coach_message_threads to service_role;
grant all on table public.coach_messages to service_role;

create policy coach_message_threads_select_owner
  on public.coach_message_threads
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
    and exists (
      select 1
      from public.bookings
      where bookings.id = coach_message_threads.booking_id
        and bookings.coach_id = (select auth.uid())
    )
  );

create policy coach_messages_select_owner
  on public.coach_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.coach_message_threads
      where coach_message_threads.id = coach_messages.thread_id
        and coach_message_threads.coach_id = (select auth.uid())
        and exists (
          select 1
          from public.user_roles
          where user_roles.user_id = (select auth.uid())
            and user_roles.role = 'coach'
        )
        and exists (
          select 1
          from public.bookings
          where bookings.id = coach_message_threads.booking_id
            and bookings.coach_id = (select auth.uid())
        )
    )
  );

create or replace function public.touch_coach_message_thread()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.coach_message_threads
  set last_message_at = new.created_at
  where id = new.thread_id;

  return new;
end;
$$;

create trigger coach_messages_touch_thread
  after insert on public.coach_messages
  for each row execute function public.touch_coach_message_thread();

create or replace function public.create_booking_message_thread()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_thread public.coach_message_threads;
  normalized_comment text := nullif(btrim(coalesce(new.student_comment, '')), '');
begin
  insert into public.coach_message_threads (
    booking_id,
    coach_id,
    coach_read_at,
    last_message_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.coach_id,
    case when normalized_comment is null then new.created_at else null end,
    new.created_at,
    new.created_at,
    new.created_at
  )
  returning * into new_thread;

  if normalized_comment is not null then
    insert into public.coach_messages (thread_id, sender_id, body, created_at)
    values (new_thread.id, new.student_id, normalized_comment, new.created_at);
  end if;

  return new;
end;
$$;

create trigger bookings_create_message_thread
  after insert on public.bookings
  for each row execute function public.create_booking_message_thread();

insert into public.coach_message_threads (
  booking_id,
  coach_id,
  coach_read_at,
  last_message_at,
  created_at,
  updated_at
)
select
  bookings.id,
  bookings.coach_id,
  case
    when nullif(btrim(coalesce(bookings.student_comment, '')), '') is null
      then bookings.created_at
    else null
  end,
  bookings.created_at,
  bookings.created_at,
  bookings.created_at
from public.bookings
on conflict (booking_id) do nothing;

insert into public.coach_messages (thread_id, sender_id, body, created_at)
select
  coach_message_threads.id,
  bookings.student_id,
  btrim(bookings.student_comment),
  bookings.created_at
from public.bookings
join public.coach_message_threads
  on coach_message_threads.booking_id = bookings.id
where nullif(btrim(coalesce(bookings.student_comment, '')), '') is not null;

create or replace function public.send_coach_message(
  p_thread_id uuid,
  p_body text
)
returns public.coach_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_body text := btrim(coalesce(p_body, ''));
  target_thread public.coach_message_threads;
  created_message public.coach_messages;
begin
  if actor_id is null or not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = actor_id
      and user_roles.role = 'coach'
  ) then
    raise insufficient_privilege using message = 'coach role required';
  end if;

  if normalized_body = '' then
    raise invalid_parameter_value using message = 'message body is required';
  end if;

  if char_length(normalized_body) > 1000 then
    raise invalid_parameter_value using message = 'message body is too long';
  end if;

  select coach_message_threads.*
  into target_thread
  from public.coach_message_threads
  join public.bookings
    on bookings.id = coach_message_threads.booking_id
  where coach_message_threads.id = p_thread_id
    and coach_message_threads.coach_id = actor_id
    and bookings.coach_id = actor_id
  for update of coach_message_threads;

  if not found then
    raise insufficient_privilege using message = 'message thread is not accessible';
  end if;

  insert into public.coach_messages (thread_id, sender_id, body)
  values (target_thread.id, actor_id, normalized_body)
  returning * into created_message;

  update public.coach_message_threads
  set coach_read_at = created_message.created_at
  where id = target_thread.id;

  return created_message;
end;
$$;

create or replace function public.mark_coach_message_thread_read(
  p_thread_id uuid
)
returns public.coach_message_threads
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  updated_thread public.coach_message_threads;
begin
  if actor_id is null or not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = actor_id
      and user_roles.role = 'coach'
  ) then
    raise insufficient_privilege using message = 'coach role required';
  end if;

  update public.coach_message_threads
  set coach_read_at = greatest(last_message_at, now())
  where id = p_thread_id
    and coach_id = actor_id
    and exists (
      select 1
      from public.bookings
      where bookings.id = coach_message_threads.booking_id
        and bookings.coach_id = actor_id
    )
  returning * into updated_thread;

  if not found then
    raise insufficient_privilege using message = 'message thread is not accessible';
  end if;

  return updated_thread;
end;
$$;

revoke all on function public.touch_coach_message_thread() from public;
revoke all on function public.create_booking_message_thread() from public;
revoke all on function public.send_coach_message(uuid, text) from public;
revoke all on function public.mark_coach_message_thread_read(uuid) from public;

grant execute on function public.send_coach_message(uuid, text) to authenticated;
grant execute on function public.mark_coach_message_thread_read(uuid) to authenticated;
