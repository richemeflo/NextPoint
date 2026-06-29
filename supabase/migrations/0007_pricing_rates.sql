create table public.pricing_rates (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 2 and 100),
  amount_cents integer not null check (amount_cents between 1 and 10000000),
  currency text not null default 'EUR' check (currency = 'EUR'),
  duration_minutes integer not null check (duration_minutes in (60, 90)),
  lesson_type text not null check (lesson_type in ('individual', 'group')),
  is_active boolean not null default true,
  applicability_contexts text[] not null default '{}'
    check (
      applicability_contexts
      <@ array['student', 'senior', 'weekend', 'public_holiday']::text[]
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.pricing_rates is
  'Coach pricing catalog with published active rows visible before lesson requests.';

create table public.pricing_rate_students (
  pricing_rate_id uuid not null
    references public.pricing_rates(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pricing_rate_id, student_id)
);

comment on table public.pricing_rate_students is
  'Optional applicability targets; P0 still publishes every active rate to all viewers.';

create index pricing_rates_public_catalog_idx
  on public.pricing_rates (lesson_type, duration_minutes)
  where is_active and deleted_at is null;

alter table public.pricing_rates enable row level security;
alter table public.pricing_rate_students enable row level security;

revoke all on table public.pricing_rates from anon, authenticated;
revoke all on table public.pricing_rate_students from anon, authenticated;
grant select on table public.pricing_rates to anon, authenticated, service_role;
grant select on table public.pricing_rate_students to authenticated, service_role;

create policy pricing_rates_select_published
  on public.pricing_rates
  for select
  to anon, authenticated
  using (is_active and deleted_at is null);

create policy pricing_rates_select_own
  on public.pricing_rates
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
  );

create policy pricing_rate_students_select_own_coach
  on public.pricing_rate_students
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pricing_rates
      where pricing_rates.id = pricing_rate_students.pricing_rate_id
        and pricing_rates.coach_id = (select auth.uid())
    )
  );

create trigger pricing_rates_set_updated_at
  before update on public.pricing_rates
  for each row execute function public.set_updated_at();

create or replace function public.save_pricing_rate(
  p_rate_id uuid,
  p_label text,
  p_amount_cents integer,
  p_currency text,
  p_duration_minutes integer,
  p_lesson_type text,
  p_is_active boolean,
  p_applicability_contexts text[],
  p_target_student_ids uuid[]
)
returns public.pricing_rates
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_rate public.pricing_rates;
  target_student_id uuid;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  if p_rate_id is null then
    insert into public.pricing_rates (
      coach_id,
      label,
      amount_cents,
      currency,
      duration_minutes,
      lesson_type,
      is_active,
      applicability_contexts
    )
    values (
      (select auth.uid()),
      trim(p_label),
      p_amount_cents,
      p_currency,
      p_duration_minutes,
      p_lesson_type,
      p_is_active,
      coalesce(p_applicability_contexts, '{}')
    )
    returning * into saved_rate;
  else
    update public.pricing_rates
    set label = trim(p_label),
        amount_cents = p_amount_cents,
        currency = p_currency,
        duration_minutes = p_duration_minutes,
        lesson_type = p_lesson_type,
        is_active = p_is_active,
        applicability_contexts = coalesce(p_applicability_contexts, '{}')
    where id = p_rate_id
      and coach_id = (select auth.uid())
      and deleted_at is null
    returning * into saved_rate;

    if saved_rate.id is null then
      raise exception 'pricing rate not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.pricing_rate_students
  where pricing_rate_id = saved_rate.id;

  foreach target_student_id in array coalesce(p_target_student_ids, '{}')
  loop
    if not exists (
      select 1
      from public.student_coach_relationships
      where student_coach_relationships.coach_id = (select auth.uid())
        and student_coach_relationships.student_id = target_student_id
        and student_coach_relationships.status = 'active'
    ) then
      raise exception 'student is not associated with coach'
        using errcode = '42501';
    end if;

    insert into public.pricing_rate_students (pricing_rate_id, student_id)
    values (saved_rate.id, target_student_id);
  end loop;

  return saved_rate;
end;
$$;

create or replace function public.delete_pricing_rate(p_rate_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.user_roles
    where user_roles.user_id = (select auth.uid())
      and user_roles.role = 'coach'
  ) then
    raise exception 'coach role required' using errcode = '42501';
  end if;

  update public.pricing_rates
  set is_active = false,
      deleted_at = now()
  where id = p_rate_id
    and coach_id = (select auth.uid())
    and deleted_at is null;

  if not found then
    raise exception 'pricing rate not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.save_pricing_rate(
  uuid,
  text,
  integer,
  text,
  integer,
  text,
  boolean,
  text[],
  uuid[]
) from public;
revoke all on function public.delete_pricing_rate(uuid) from public;
grant execute on function public.save_pricing_rate(
  uuid,
  text,
  integer,
  text,
  integer,
  text,
  boolean,
  text[],
  uuid[]
) to authenticated;
grant execute on function public.delete_pricing_rate(uuid) to authenticated;
