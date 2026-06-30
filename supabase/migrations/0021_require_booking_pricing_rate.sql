create or replace function public.select_booking_pricing_rate(
  p_coach_id uuid,
  p_student_id uuid,
  p_lesson_type text,
  p_duration_minutes integer
)
returns public.pricing_rates
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_rate public.pricing_rates;
begin
  select pricing_rates.*
    into selected_rate
  from public.pricing_rates
  where pricing_rates.coach_id = p_coach_id
    and pricing_rates.lesson_type = p_lesson_type
    and pricing_rates.duration_minutes = p_duration_minutes
    and pricing_rates.is_active
    and pricing_rates.deleted_at is null
    and (
      not exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
      )
      or exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
          and pricing_rate_students.student_id = p_student_id
      )
    )
  order by
    case
      when exists (
        select 1
        from public.pricing_rate_students
        where pricing_rate_students.pricing_rate_id = pricing_rates.id
          and pricing_rate_students.student_id = p_student_id
      ) then 0
      else 1
    end,
    cardinality(pricing_rates.applicability_contexts) desc,
    pricing_rates.created_at asc
  limit 1;

  if selected_rate.id is null then
    raise exception 'pricing rate missing' using errcode = 'P0002';
  end if;

  return selected_rate;
end;
$$;
