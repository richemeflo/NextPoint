import { useMemo } from 'react';

import type { Booking } from '@/features/bookings/booking-service';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import {
  isCoachPlanningBookingBlockVisible,
  isCoachPlanningBookingVisible,
  isCoachPlanningSlotVisible,
} from '@/features/scheduling/coach-planning-visibility';
import { getSlotDateKey } from '@/features/scheduling/planning-window';

export type CoachPlanningItem =
  | {
      kind: 'availability';
      id: string;
      startsAt: string;
      endsAt: string;
      slot: AvailabilitySlot;
    }
  | {
      kind: 'booking';
      id: string;
      startsAt: string;
      endsAt: string;
      booking: Booking;
    };

export function useCoachPlanningItems({
  bookings,
  showAvailability,
  showConfirmedLessons,
  slots,
}: {
  bookings: Booking[];
  showAvailability: boolean;
  showConfirmedLessons: boolean;
  slots: AvailabilitySlot[];
}) {
  const planningItems = useMemo<CoachPlanningItem[]>(
    () => [
      ...slots
        .filter((slot) =>
          isCoachPlanningSlotVisible(slot.status, showAvailability)
        )
        .map((slot) => ({
          kind: 'availability' as const,
          id: `availability-${slot.id}`,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          slot,
        })),
      ...bookings
        .filter((booking) =>
          isCoachPlanningBookingBlockVisible(
            booking.status,
            showConfirmedLessons
          )
        )
        .map((booking) => ({
          kind: 'booking' as const,
          id: `booking-${booking.id}`,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          booking,
        })),
    ],
    [bookings, showAvailability, showConfirmedLessons, slots]
  );

  const planningItemsByDay = useMemo(() => {
    const grouped = new Map<string, CoachPlanningItem[]>();

    for (const item of planningItems) {
      const key = getSlotDateKey(item.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    }

    return grouped;
  }, [planningItems]);

  const bookingsBySlotId = useMemo(() => {
    const grouped = new Map<string, Booking[]>();

    for (const booking of bookings) {
      if (
        !booking.availabilitySlotId ||
        !isCoachPlanningBookingVisible(booking.status) ||
        isCoachPlanningBookingBlockVisible(booking.status)
      ) {
        continue;
      }

      const current = grouped.get(booking.availabilitySlotId) ?? [];
      current.push(booking);
      grouped.set(booking.availabilitySlotId, current);
    }

    return grouped;
  }, [bookings]);

  return { bookingsBySlotId, planningItems, planningItemsByDay };
}
