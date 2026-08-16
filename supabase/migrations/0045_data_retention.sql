create or replace function public.purge_expired_personal_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  activation_tokens_count integer := 0;
  availability_ranges_count integer := 0;
  bookings_count integer := 0;
  delivery_attempts_count integer := 0;
  history_count integer := 0;
  lesson_packs_count integer := 0;
  notifications_count integer := 0;
  pricing_rates_count integer := 0;
  private_notes_count integer := 0;
  push_tokens_count integer := 0;
  relationships_count integer := 0;
begin
  delete from public.student_activation_tokens
  where expires_at < now() - interval '7 days'
     or consumed_at < now() - interval '7 days'
     or revoked_at < now() - interval '7 days';
  get diagnostics activation_tokens_count = row_count;

  delete from public.notification_push_delivery_attempts
  where created_at < now() - interval '6 months';
  get diagnostics delivery_attempts_count = row_count;

  delete from public.notifications
  where created_at < now() - interval '6 months';
  get diagnostics notifications_count = row_count;

  delete from public.notification_push_tokens
  where not is_active
    and greatest(last_seen_at, updated_at) < now() - interval '90 days';
  get diagnostics push_tokens_count = row_count;

  delete from public.student_private_notes notes
  where notes.updated_at < now() - interval '12 months'
    and not exists (
      select 1
      from public.student_coach_relationships relationships
      where relationships.coach_id = notes.coach_id
        and relationships.student_id = notes.student_id
        and relationships.status = 'active'
    );
  get diagnostics private_notes_count = row_count;

  delete from public.notifications notifications
  using public.bookings bookings
  where bookings.ends_at < now() - interval '5 years'
    and (
      notifications.booking_id = bookings.id
      or notifications.link_id = bookings.id
    );

  delete from public.bookings
  where ends_at < now() - interval '5 years';
  get diagnostics bookings_count = row_count;

  delete from public.student_history_events
  where occurred_at < now() - interval '5 years';
  get diagnostics history_count = row_count;

  delete from public.lesson_packs
  where status = 'exhausted'
    and updated_at < now() - interval '5 years';
  get diagnostics lesson_packs_count = row_count;

  delete from public.availability_ranges
  where (
    ends_at < now() - interval '12 months'
    or deleted_at < now() - interval '12 months'
  );
  get diagnostics availability_ranges_count = row_count;

  delete from public.pricing_rates rates
  where rates.deleted_at < now() - interval '12 months'
    and not exists (
      select 1
      from public.bookings
      where bookings.pricing_rate_id = rates.id
    );
  get diagnostics pricing_rates_count = row_count;

  delete from public.student_coach_relationships
  where status = 'inactive'
    and updated_at < now() - interval '5 years';
  get diagnostics relationships_count = row_count;

  return jsonb_build_object(
    'activationTokens', activation_tokens_count,
    'availabilityRanges', availability_ranges_count,
    'bookings', bookings_count,
    'deliveryAttempts', delivery_attempts_count,
    'historyEvents', history_count,
    'lessonPacks', lesson_packs_count,
    'notifications', notifications_count,
    'pricingRates', pricing_rates_count,
    'privateNotes', private_notes_count,
    'pushTokens', push_tokens_count,
    'relationships', relationships_count,
    'completedAt', now()
  );
end;
$$;

comment on function public.purge_expired_personal_data() is
  'Service-role maintenance job enforcing the documented active-database retention periods.';

revoke all on function public.purge_expired_personal_data() from public;
revoke execute on function public.purge_expired_personal_data() from anon, authenticated;
grant execute on function public.purge_expired_personal_data() to service_role;
