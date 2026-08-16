export const studentHistoryPageSize = 25;

export type StudentHistoryCursor = {
  occurredAt: string;
  id: string;
};

type CursorStudentHistoryEvent = StudentHistoryCursor;

export function buildStudentHistoryCursorFilter(cursor: StudentHistoryCursor) {
  return `occurred_at.lt.${cursor.occurredAt},and(occurred_at.eq.${cursor.occurredAt},id.lt.${cursor.id})`;
}

export function getStudentHistoryCursor(
  events: CursorStudentHistoryEvent[],
): StudentHistoryCursor | null {
  const lastEvent = events.at(-1);
  return lastEvent
    ? { occurredAt: lastEvent.occurredAt, id: lastEvent.id }
    : null;
}

export function mergeStudentHistoryPages<Event extends { id: string }>(
  current: Event[],
  next: Event[],
) {
  const knownIds = new Set(current.map((event) => event.id));
  return [...current, ...next.filter((event) => !knownIds.has(event.id))];
}
