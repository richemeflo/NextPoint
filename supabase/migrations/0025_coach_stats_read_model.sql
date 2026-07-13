create or replace function public.get_coach_stats(
  p_period_start timestamptz,
  p_period_end timestamptz
)
returns table (
  period_start timestamptz,
  period_end timestamptz,
  generated_at timestamptz,
  completed_courses bigint,
  completed_minutes bigint,
  estimated_revenue_cents bigint,
  currency text,
  active_students jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_coach_id uuid := auth.uid();
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

  if p_period_start is null
    or p_period_end is null
    or p_period_start >= p_period_end
  then
    raise exception 'invalid stats period' using errcode = '22023';
  end if;

  return query
  with eligible_bookings as (
    select
      bookings.id,
      bookings.student_id,
      bookings.duration_minutes,
      pricing_rates.amount_cents
    from public.bookings
    left join public.pricing_rates
      on pricing_rates.id = bookings.pricing_rate_id
    where bookings.coach_id = current_coach_id
      and bookings.status in ('confirmed', 'modified')
      and bookings.starts_at >= p_period_start
      and bookings.starts_at < p_period_end
      and bookings.ends_at <= now()
  ),
  totals as (
    select
      count(*)::bigint as completed_courses,
      coalesce(sum(eligible_bookings.duration_minutes), 0)::bigint as completed_minutes,
      coalesce(sum(eligible_bookings.amount_cents), 0)::bigint as estimated_revenue_cents
    from eligible_bookings
  ),
  course_students as (
    select eligible_bookings.id as booking_id, eligible_bookings.student_id
    from eligible_bookings
    union
    select eligible_bookings.id, booking_participants.student_id
    from eligible_bookings
    join public.booking_participants
      on booking_participants.booking_id = eligible_bookings.id
  ),
  student_counts as (
    select course_students.student_id, count(*)::bigint as course_count
    from course_students
    group by course_students.student_id
  ),
  ranked_students as (
    select
      student_counts.student_id,
      student_profiles.full_name,
      student_counts.course_count
    from student_counts
    left join public.student_profiles
      on student_profiles.user_id = student_counts.student_id
    order by student_counts.course_count desc, student_profiles.full_name nulls last
    limit 5
  )
  select
    p_period_start,
    p_period_end,
    now(),
    totals.completed_courses,
    totals.completed_minutes,
    totals.estimated_revenue_cents,
    'EUR'::text,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'studentId', ranked_students.student_id,
            'fullName', ranked_students.full_name,
            'courseCount', ranked_students.course_count
          )
          order by ranked_students.course_count desc, ranked_students.full_name nulls last
        )
        from ranked_students
      ),
      '[]'::jsonb
    )
  from totals;
end;
$$;

comment on function public.get_coach_stats(timestamptz, timestamptz) is
  'Coach-only lightweight activity read model. Counts completed confirmed/modified bookings, excludes all other statuses and estimates revenue from available applied pricing without payment data.';

revoke all on function public.get_coach_stats(timestamptz, timestamptz) from public;
grant execute on function public.get_coach_stats(timestamptz, timestamptz) to authenticated;
