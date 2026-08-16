import type {
  AvailabilitySlotStatus,
  BookingStatus,
} from '@nextpoint/shared';

export function isCoachPlanningSlotVisible(
  status: AvailabilitySlotStatus,
  showAvailability = true
) {
  return showAvailability && status !== 'cancelled';
}

export function isCoachPlanningBookingVisible(status: BookingStatus) {
  return status !== 'cancelled';
}

export function isCoachPlanningBookingBlockVisible(
  status: BookingStatus,
  showConfirmedLessons = true
) {
  return (
    showConfirmedLessons && (status === 'confirmed' || status === 'modified')
  );
}
