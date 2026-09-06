create or replace function public.get_student_minimum_pricing_rates()
returns setof public.pricing_rates
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_student_id uuid := auth.uid();
begin
  if current_student_id is null or not exists (
    select 1 from public.user_roles
    where user_id = current_student_id and role = 'eleve'
  ) then
    raise exception 'student role required' using errcode = '42501';
  end if;

  return query
  with calendar_contexts (is_weekend, is_public_holiday) as (
    values (false, false), (true, false), (false, true), (true, true)
  ),
  applicable_rates as (
    select pricing_rates.id,
      row_number() over (
        partition by pricing_rates.lesson_type, pricing_rates.duration_minutes,
          calendar_contexts.is_weekend, calendar_contexts.is_public_holiday
        order by pricing_rates.amount_cents asc,
          case when exists (
            select 1 from public.pricing_rate_students
            where pricing_rate_students.pricing_rate_id = pricing_rates.id
              and pricing_rate_students.student_id = current_student_id
          ) then 0 else 1 end,
          cardinality(pricing_rates.applicability_contexts) desc,
          pricing_rates.created_at asc
      ) as candidate_rank
    from public.pricing_rates
    cross join calendar_contexts
    left join public.student_profiles requester_profile
      on requester_profile.user_id = current_student_id
    where pricing_rates.is_active
      and pricing_rates.deleted_at is null
      and (
        not exists (
          select 1 from public.pricing_rate_students
          where pricing_rate_students.pricing_rate_id = pricing_rates.id
        )
        or exists (
          select 1 from public.pricing_rate_students
          where pricing_rate_students.pricing_rate_id = pricing_rates.id
            and pricing_rate_students.student_id = current_student_id
        )
      )
      and pricing_rates.applicability_contexts <@ array_remove(array[
        case when requester_profile.age is not null and requester_profile.age < 26 then 'student' end,
        case when requester_profile.age is not null and requester_profile.age >= 60 then 'senior' end,
        case when calendar_contexts.is_weekend then 'weekend' end,
        case when calendar_contexts.is_public_holiday then 'public_holiday' end
      ]::text[], null)
  ),
  selected_rate_ids as (
    select distinct id from applicable_rates where candidate_rank = 1
  )
  select pricing_rates.*
  from public.pricing_rates
  join selected_rate_ids on selected_rate_ids.id = pricing_rates.id
  order by pricing_rates.lesson_type, pricing_rates.duration_minutes,
    pricing_rates.amount_cents, pricing_rates.created_at;
end;
$$;

revoke all on function public.get_student_minimum_pricing_rates() from public;
grant execute on function public.get_student_minimum_pricing_rates() to authenticated;
