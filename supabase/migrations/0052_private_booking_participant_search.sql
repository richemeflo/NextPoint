create or replace function public.normalize_student_name(value text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select trim(
    regexp_replace(
      translate(
        lower(value),
        'àáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿ',
        'aaaaaaaceeeeiiiinooooooouuuuyy'
      ),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

revoke all on function public.normalize_student_name(text) from public;

drop function public.get_requestable_booking_participants();

create function public.get_requestable_booking_participants(
  p_query text,
  p_limit integer default 8
)
returns table (
  student_id uuid,
  full_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester_id uuid := auth.uid();
  requester_coach_id uuid;
  normalized_query text := public.normalize_student_name(coalesce(p_query, ''));
  result_limit integer := greatest(1, least(coalesce(p_limit, 8), 10));
begin
  if requester_id is null or char_length(normalized_query) < 2 then
    return;
  end if;

  if exists (
    select 1
    from regexp_split_to_table(normalized_query, ' ') as query_tokens(token)
    where char_length(query_tokens.token) < 2
  ) then
    return;
  end if;

  select relationships.coach_id
    into requester_coach_id
  from public.student_coach_relationships relationships
  where relationships.student_id = requester_id
    and relationships.status = 'active'
  limit 1;

  if requester_coach_id is null then
    raise exception 'active coach relationship required' using errcode = '42501';
  end if;

  return query
  select profiles.user_id, profiles.full_name
  from public.student_profiles profiles
  join public.student_coach_relationships relationships
    on relationships.student_id = profiles.user_id
   and relationships.coach_id = requester_coach_id
   and relationships.status = 'active'
  cross join lateral (
    select public.normalize_student_name(profiles.full_name) as normalized_name
  ) searchable
  where profiles.account_status = 'active'
    and profiles.user_id <> requester_id
    and not exists (
      select 1
      from regexp_split_to_table(normalized_query, ' ') as query_tokens(token)
      where not exists (
        select 1
        from regexp_split_to_table(searchable.normalized_name, ' ')
          as name_tokens(token)
        where name_tokens.token like query_tokens.token || '%'
      )
    )
  order by
    (searchable.normalized_name = normalized_query) desc,
    char_length(searchable.normalized_name),
    searchable.normalized_name
  limit result_limit;
end;
$$;

revoke all on function public.get_requestable_booking_participants(text, integer)
  from public, anon, authenticated;
grant execute on function public.get_requestable_booking_participants(text, integer)
  to authenticated;
