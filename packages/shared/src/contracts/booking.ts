import { z } from 'zod';

import { availabilityLocations, availabilitySlotDurations } from './availability-range';
import { pricingLessonTypes } from './pricing-rate';

export const bookingStatuses = [
  'pending',
  'confirmed',
  'refused',
  'expired',
  'cancelled',
  'modified',
] as const;

export const bookingOrigins = ['student_request', 'coach_created'] as const;

export const bookingErrorCodes = [
  'unauthorized',
  'slot_unavailable',
  'pending_limit_reached',
  'student_pending_limit_reached',
  'already_processed',
  'past_booking',
  'invalid_participants',
  'pricing_rate_missing',
  'invalid_input',
  'not_found',
] as const;

export const bookingCommentMaxLength = 500;
export const bookingRefusalCommentMaxLength = 500;
export const bookingPendingTtlDays = 7;
export const maxPendingBookingsPerSlot = 2;
export const maxPendingBookingsPerStudent = 10;
export const maxGroupBookingParticipants = 4;

export type BookingStatus = (typeof bookingStatuses)[number];
export type BookingOrigin = (typeof bookingOrigins)[number];
export type BookingErrorCode = (typeof bookingErrorCodes)[number];

export type BookingRuleResult =
  | { ok: true }
  | { ok: false; error: BookingErrorCode };

export type PendingBookingCandidate = {
  slotStatus: 'available' | 'booked' | 'cancelled';
  slotPendingCount: number;
  studentPendingCount: number;
  hasConfirmedBooking: boolean;
};

export type BookingStateCandidate = {
  status: BookingStatus;
  startsAt: string;
};

const uuidArraySchema = z.array(z.uuid()).max(maxGroupBookingParticipants);

export const requestBookingSchema = z.object({
  slotId: z.uuid(),
  lessonType: z.enum(pricingLessonTypes),
  studentComment: z.string().trim().max(bookingCommentMaxLength).optional(),
  participantIds: uuidArraySchema.default([]),
});

export const refuseBookingSchema = z.object({
  bookingId: z.uuid(),
  refusalComment: z
    .string()
    .trim()
    .max(bookingRefusalCommentMaxLength)
    .optional(),
});

export const bookingActionSchema = z.object({
  bookingId: z.uuid(),
});

export const coachCreateBookingSchema = z.object({
  studentIds: uuidArraySchema.min(1),
  startsAt: z.iso.datetime(),
  durationMinutes: z.union([z.literal(60), z.literal(90)]),
  location: z.enum(availabilityLocations),
  lessonType: z.enum(pricingLessonTypes),
  recurrenceEndsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export const coachModifyBookingSchema = z.object({
  bookingId: z.uuid(),
  startsAt: z.iso.datetime(),
  durationMinutes: z.union([z.literal(60), z.literal(90)]),
  location: z.enum(availabilityLocations),
});

export type RequestBookingInput = z.infer<typeof requestBookingSchema>;
export type RefuseBookingInput = z.infer<typeof refuseBookingSchema>;
export type BookingActionInput = z.infer<typeof bookingActionSchema>;
export type CoachCreateBookingInput = z.infer<typeof coachCreateBookingSchema>;
export type CoachModifyBookingInput = z.infer<typeof coachModifyBookingSchema>;

export function canCreatePendingBooking(
  candidate: PendingBookingCandidate
): BookingRuleResult {
  if (candidate.slotStatus !== 'available' || candidate.hasConfirmedBooking) {
    return { ok: false, error: 'slot_unavailable' };
  }

  if (candidate.slotPendingCount >= maxPendingBookingsPerSlot) {
    return { ok: false, error: 'pending_limit_reached' };
  }

  if (candidate.studentPendingCount >= maxPendingBookingsPerStudent) {
    return { ok: false, error: 'student_pending_limit_reached' };
  }

  return { ok: true };
}

export function canApproveBooking(
  booking: Pick<BookingStateCandidate, 'status'>
): BookingRuleResult {
  return booking.status === 'pending'
    ? { ok: true }
    : { ok: false, error: 'already_processed' };
}

export function canRefuseBooking(
  booking: Pick<BookingStateCandidate, 'status'>
): BookingRuleResult {
  return booking.status === 'pending'
    ? { ok: true }
    : { ok: false, error: 'already_processed' };
}

export function canCancelBooking(
  booking: BookingStateCandidate,
  actor: 'coach' | 'student',
  nowMs = Date.now()
): BookingRuleResult {
  if (booking.status !== 'confirmed' && booking.status !== 'modified') {
    return { ok: false, error: 'already_processed' };
  }

  if (actor === 'student' && new Date(booking.startsAt).getTime() <= nowMs) {
    return { ok: false, error: 'past_booking' };
  }

  return { ok: true };
}

export function isBookingExpired(
  createdAt: string,
  nowMs = Date.now(),
  ttlDays = bookingPendingTtlDays
) {
  return nowMs - new Date(createdAt).getTime() >= ttlDays * 24 * 60 * 60 * 1000;
}

export function normalizeParticipantIds(
  requesterId: string,
  participantIds: string[]
) {
  return Array.from(new Set([requesterId, ...participantIds])).slice(
    0,
    maxGroupBookingParticipants
  );
}
