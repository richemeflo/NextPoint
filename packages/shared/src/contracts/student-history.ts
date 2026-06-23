export const studentHistoryEventTypes = [
  'booking_requested',
  'lesson_confirmed',
  'booking_cancelled',
  'booking_modified',
  'lesson_pack_assigned',
  'lesson_pack_consumed',
] as const;

export type StudentHistoryEventType =
  (typeof studentHistoryEventTypes)[number];

export const studentHistoryEventStatuses = [
  'pending',
  'confirmed',
  'refused',
  'expired',
  'cancelled',
  'modified',
  'active',
  'exhausted',
] as const;

export type StudentHistoryEventStatus =
  (typeof studentHistoryEventStatuses)[number];

export function isStudentHistoryEventType(
  value: unknown
): value is StudentHistoryEventType {
  return studentHistoryEventTypes.includes(value as StudentHistoryEventType);
}

export function isStudentHistoryEventStatus(
  value: unknown
): value is StudentHistoryEventStatus {
  return studentHistoryEventStatuses.includes(
    value as StudentHistoryEventStatus
  );
}
