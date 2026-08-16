import { useMemo } from 'react';

import type { Booking } from '@/features/bookings/booking-service';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { getSlotDateKey } from '@/features/scheduling/planning-window';

export type StudentHomeAgendaItem =
  | {
      id: string;
      startsAt: string;
      endsAt: string;
      kind: 'slot';
      slot: AvailabilitySlot;
    }
  | {
      id: string;
      startsAt: string;
      endsAt: string;
      kind: 'booking';
      booking: Booking;
    };

const homeBookingStatuses: Booking['status'][] = [
  'pending',
  'confirmed',
  'modified',
  'refused',
];

export function useStudentAgendaItems({
  agendaLoadedAt,
  bookings,
  endsAt,
  selectedSlotId,
  slots,
  startsAt,
}: {
  agendaLoadedAt: number | null;
  bookings: Booking[];
  endsAt: string;
  selectedSlotId: string | null;
  slots: AvailabilitySlot[];
  startsAt: string;
}) {
  const windowBookings = useMemo(() => {
    const lowerBound = new Date(startsAt).getTime();
    const upperBound = new Date(endsAt).getTime();

    return bookings.filter((booking) => {
      const bookingStartsAt = new Date(booking.startsAt).getTime();
      return bookingStartsAt >= lowerBound && bookingStartsAt < upperBound;
    });
  }, [bookings, endsAt, startsAt]);

  const bookingsByDay = useMemo(
    () => groupByDay<Booking>(windowBookings),
    [windowBookings]
  );

  const homeAgendaItems = useMemo<StudentHomeAgendaItem[]>(
    () =>
      [
        ...windowBookings
          .filter((booking) => homeBookingStatuses.includes(booking.status))
          .map((booking) => ({
            id: `booking-${booking.id}`,
            startsAt: booking.startsAt,
            endsAt: booking.endsAt,
            kind: 'booking' as const,
            booking,
          })),
        ...slots.map((slot) => ({
          id: `slot-${slot.id}`,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          kind: 'slot' as const,
          slot,
        })),
      ].sort(
        (first, second) =>
          new Date(first.startsAt).getTime() -
          new Date(second.startsAt).getTime()
      ),
    [slots, windowBookings]
  );

  const homeItemsByDay = useMemo(
    () => groupByDay<StudentHomeAgendaItem>(homeAgendaItems),
    [homeAgendaItems]
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slots]
  );

  const studentScheduleOccupations = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === 'confirmed' ||
            booking.status === 'modified' ||
            (booking.status === 'pending' &&
              (!booking.expiresAt ||
                agendaLoadedAt === null ||
                new Date(booking.expiresAt).getTime() > agendaLoadedAt))
        )
        .map((booking) => ({
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
        })),
    [agendaLoadedAt, bookings]
  );

  return {
    bookingsByDay,
    homeAgendaItems,
    homeItemsByDay,
    selectedSlot,
    studentScheduleOccupations,
    visibleBookings: bookings,
    windowBookings,
  };
}

function groupByDay<TItem extends { startsAt: string }>(items: TItem[]) {
  const grouped = new Map<string, TItem[]>();

  for (const item of items) {
    const key = getSlotDateKey(item.startsAt);
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  }

  return grouped;
}
