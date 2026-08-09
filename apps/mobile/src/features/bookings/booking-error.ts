export type BookingMutationError =
  | 'unauthorized'
  | 'slot_unavailable'
  | 'pending_limit_reached'
  | 'student_pending_limit_reached'
  | 'student_schedule_conflict'
  | 'already_processed'
  | 'past_booking'
  | 'invalid_participants'
  | 'invalid_input'
  | 'pricing_rate_missing'
  | 'not_found'
  | 'unknown';

export function mapBookingError(
  code: string | undefined,
  message?: string
): BookingMutationError {
  if (code === '42501') return 'unauthorized';
  if (code === 'P0002') {
    return message?.includes('pricing') ? 'pricing_rate_missing' : 'not_found';
  }
  if (code === '23505') return 'slot_unavailable';
  if (code === '23P01') return 'student_schedule_conflict';
  if (code === '23514') {
    return message?.toLowerCase().includes('pending limit reached')
      ? 'pending_limit_reached'
      : 'invalid_input';
  }
  if (code === '22023') {
    return message?.includes('past')
      ? 'past_booking'
      : message?.includes('cancellation message')
        ? 'invalid_input'
        : message?.includes('participant')
          ? 'invalid_participants'
          : 'student_pending_limit_reached';
  }
  if (code === '55000') {
    return message?.includes('processed') || message?.includes('refused')
      ? 'already_processed'
      : 'slot_unavailable';
  }

  return 'unknown';
}
