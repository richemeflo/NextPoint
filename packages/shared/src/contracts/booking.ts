import { z } from 'zod';

import { availabilityLocations, availabilitySlotDurations } from './availability-range';
import {
  pricingLessonTypes,
  type PricingLessonType,
} from './pricing-rate';

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
export const bookingCancellationMessageMaxLength = 500;
export const bookingPendingTtlDays = 7;
export const maxPendingBookingsPerSlot = 2;
export const maxPendingBookingsPerStudent = 10;
export const maxGroupBookingParticipants = 4;
export const bookingParticipantLimits: Record<
  PricingLessonType,
  { min: number; max: number }
> = {
  individual: { min: 1, max: 1 },
  duo: { min: 2, max: 2 },
  group: { min: 1, max: maxGroupBookingParticipants },
};

export type BookingStatus = (typeof bookingStatuses)[number];
export type BookingOrigin = (typeof bookingOrigins)[number];
export type BookingErrorCode = (typeof bookingErrorCodes)[number];

export const bookingParticipantProfileReadModelSchema = z.object({
  studentId: z.uuid(),
  fullName: z.string().nullable(),
});

export const bookingParticipantReadModelSchema =
  bookingParticipantProfileReadModelSchema.extend({
    bookingId: z.uuid(),
  });

export const bookingPricingReadModelSchema = z.object({
  id: z.uuid(),
  label: z.string().min(2).max(100),
  amountCents: z.number().int().min(1).max(10_000_000),
  currency: z.literal('EUR'),
});

export const bookingReadModelSchema = z.object({
  id: z.uuid(),
  availabilitySlotId: z.uuid().nullable(),
  coachId: z.uuid(),
  studentId: z.uuid(),
  pricingRateId: z.uuid().nullable(),
  lessonType: z.enum(pricingLessonTypes),
  status: z.enum(bookingStatuses),
  origin: z.enum(bookingOrigins),
  startsAt: z.iso.datetime({ offset: true }),
  endsAt: z.iso.datetime({ offset: true }),
  durationMinutes: z.union([z.literal(60), z.literal(90)]),
  location: z.enum(availabilityLocations),
  studentComment: z.string().max(bookingCommentMaxLength).nullable(),
  coachRefusalComment: z
    .string()
    .max(bookingRefusalCommentMaxLength)
    .nullable(),
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  participants: z
    .array(bookingParticipantProfileReadModelSchema)
    .max(maxGroupBookingParticipants),
  pricing: bookingPricingReadModelSchema.nullable(),
});

export type BookingParticipantReadModel = z.infer<
  typeof bookingParticipantReadModelSchema
>;
export type BookingParticipantProfileReadModel = z.infer<
  typeof bookingParticipantProfileReadModelSchema
>;
export type BookingPricingReadModel = z.infer<
  typeof bookingPricingReadModelSchema
>;
export type BookingReadModel = z.infer<typeof bookingReadModelSchema>;

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

export function isBookingParticipantCountValid(
  lessonType: PricingLessonType,
  participantCount: number
) {
  const limits = bookingParticipantLimits[lessonType];
  return participantCount >= limits.min && participantCount <= limits.max;
}

export const requestBookingSchema = z
  .object({
    slotId: z.uuid(),
    lessonType: z.enum(pricingLessonTypes),
    studentComment: z.string().trim().max(bookingCommentMaxLength).optional(),
    participantIds: z
      .array(z.uuid())
      .max(maxGroupBookingParticipants - 1)
      .default([]),
  })
  .superRefine((input, context) => {
    const uniqueParticipantCount = new Set(input.participantIds).size;
    if (
      uniqueParticipantCount !== input.participantIds.length ||
      !isBookingParticipantCountValid(
        input.lessonType,
        uniqueParticipantCount + 1
      )
    ) {
      context.addIssue({
        code: 'custom',
        message: 'invalid_participants',
        path: ['participantIds'],
      });
    }
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

export const studentCancelBookingSchema = z.object({
  bookingId: z.uuid(),
  cancellationMessage: z
    .string()
    .trim()
    .min(1)
    .refine(
      (value) =>
        Array.from(value).length <= bookingCancellationMessageMaxLength,
      { message: 'Cancellation message must not exceed 500 characters' }
    ),
});

export const coachCreateBookingSchema = z
  .object({
    studentIds: uuidArraySchema.min(1),
    startsAt: z.iso.datetime(),
    durationMinutes: z.union([z.literal(60), z.literal(90)]),
    location: z.enum(availabilityLocations),
    lessonType: z.enum(pricingLessonTypes),
    recurrenceEndsOn: z.iso.date().nullable(),
  })
  .superRefine((input, context) => {
    const uniqueStudentCount = new Set(input.studentIds).size;
    if (
      uniqueStudentCount !== input.studentIds.length ||
      !isBookingParticipantCountValid(input.lessonType, uniqueStudentCount)
    ) {
      context.addIssue({
        code: 'custom',
        message: 'invalid_participants',
        path: ['studentIds'],
      });
    }
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
export type StudentCancelBookingInput = z.infer<
  typeof studentCancelBookingSchema
>;
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
  const canCancelStatus =
    booking.status === 'confirmed' ||
    booking.status === 'modified' ||
    (actor === 'student' && booking.status === 'pending');

  if (!canCancelStatus) {
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
