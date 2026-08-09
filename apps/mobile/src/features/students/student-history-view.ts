import type { StudentHistoryEventType } from '@nextpoint/shared';

type StudentHistoryDisplayEvent = {
  eventType: StudentHistoryEventType;
  sourceId: string | null;
};

const answeredBookingEventTypes = new Set<StudentHistoryEventType>([
  'lesson_confirmed',
  'booking_cancelled',
  'booking_modified',
]);

export function getStudentHistoryDisplayEvents<
  TEvent extends StudentHistoryDisplayEvent,
>(events: readonly TEvent[]) {
  const answeredBookingIds = new Set(
    events.flatMap((event) =>
      event.sourceId && answeredBookingEventTypes.has(event.eventType)
        ? [event.sourceId]
        : []
    )
  );

  return events.filter(
    (event) =>
      event.eventType !== 'booking_requested' ||
      !event.sourceId ||
      !answeredBookingIds.has(event.sourceId)
  );
}
