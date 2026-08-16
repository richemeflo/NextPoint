alter table public.notification_push_delivery_attempts
  add column processing_started_at timestamptz;

create index notification_push_delivery_attempts_pending_idx
  on public.notification_push_delivery_attempts (created_at)
  where status = 'pending';

create or replace function public.claim_pending_push_delivery_attempts(
  p_limit integer default 100
)
returns setof public.notification_push_delivery_attempts
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  return query
  with candidates as (
    select attempt.id
    from public.notification_push_delivery_attempts as attempt
    where attempt.status = 'pending'
      and (
        attempt.processing_started_at is null
        or attempt.processing_started_at < now() - interval '15 minutes'
      )
    order by attempt.created_at
    limit greatest(1, least(coalesce(p_limit, 100), 100))
    for update skip locked
  )
  update public.notification_push_delivery_attempts as attempt
  set processing_started_at = now()
  from candidates
  where attempt.id = candidates.id
  returning attempt.*;
end;
$$;

revoke all on function public.claim_pending_push_delivery_attempts(integer)
  from public, anon, authenticated;
grant execute on function public.claim_pending_push_delivery_attempts(integer)
  to service_role;
