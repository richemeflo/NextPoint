import type { Booking } from './booking-service';

export type StudentBookingStatusFilter =
  | 'all'
  | 'pending'
  | 'confirmed'
  | 'refused'
  | 'cancelled'
  | 'expired';

export function filterStudentBookings(
  bookings: Booking[],
  filter: StudentBookingStatusFilter
) {
  if (filter === 'all') return bookings;
  if (filter === 'confirmed') {
    return bookings.filter(
      ({ status }) => status === 'confirmed' || status === 'modified'
    );
  }
  return bookings.filter(({ status }) => status === filter);
}
