import type {
  AvailabilitySlotStatus,
  BookingStatus,
} from '@nextpoint/shared';

export function isCoachPlanningSlotVisible(status: AvailabilitySlotStatus) {
  return status !== 'cancelled';
}

export function isCoachPlanningBookingVisible(status: BookingStatus) {
  return status !== 'cancelled';
}
