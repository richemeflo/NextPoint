import assert from 'node:assert/strict';
import test from 'node:test';

import {
  bookingReadModelSchema,
  canApproveBooking,
  canCancelBooking,
  canCreatePendingBooking,
  canRefuseBooking,
  coachCreateBookingSchema,
  coachModifyBookingSchema,
  isBookingParticipantCountValid,
  isBookingExpired,
  normalizeParticipantIds,
  requestBookingSchema,
  studentCancelBookingSchema,
} from './booking';

const validBookingReadModel = {
  id: '20000000-0000-4000-8000-000000000001',
  availabilitySlotId: '20000000-0000-4000-8000-000000000002',
  coachId: '20000000-0000-4000-8000-000000000003',
  studentId: '20000000-0000-4000-8000-000000000004',
  pricingRateId: '20000000-0000-4000-8000-000000000005',
  lessonType: 'individual',
  status: 'confirmed',
  origin: 'coach_created',
  startsAt: '2026-08-10T16:00:00+00:00',
  endsAt: '2026-08-10T17:00:00+00:00',
  durationMinutes: 60,
  location: 'Les Bruyères Centre Sportif',
  studentComment: null,
  coachRefusalComment: null,
  expiresAt: null,
  createdAt: '2026-08-07T10:00:00+00:00',
  updatedAt: '2026-08-07T10:00:00+00:00',
  participants: [
    {
      studentId: '20000000-0000-4000-8000-000000000004',
      fullName: 'Élève Test',
    },
  ],
  pricing: {
    id: '20000000-0000-4000-8000-000000000005',
    label: 'Cours individuel',
    amountCents: 4500,
    currency: 'EUR',
  },
} as const;

test('booking read models reject unexpected Supabase domain values', () => {
  assert.equal(
    bookingReadModelSchema.safeParse(validBookingReadModel).success,
    true
  );
  assert.equal(
    bookingReadModelSchema.safeParse({
      ...validBookingReadModel,
      lessonType: 'unexpected',
      durationMinutes: 45,
    }).success,
    false
  );
});

const validCoachCreateBooking = {
  studentIds: ['10000000-0000-4000-8000-000000000001'],
  startsAt: '2026-08-10T16:00:00.000Z',
  durationMinutes: 60,
  location: 'Les Bruyères Centre Sportif',
  lessonType: 'individual',
  recurrenceEndsOn: null,
} as const;

test('coach booking creation validates every RPC input', () => {
  assert.equal(
    coachCreateBookingSchema.safeParse(validCoachCreateBooking).success,
    true
  );
  assert.equal(
    coachCreateBookingSchema.safeParse({
      ...validCoachCreateBooking,
      studentIds: [],
    }).success,
    false
  );
  assert.equal(
    coachCreateBookingSchema.safeParse({
      ...validCoachCreateBooking,
      studentIds: Array.from(
        { length: 5 },
        (_, index) => `10000000-0000-4000-8000-00000000000${index + 1}`
      ),
    }).success,
    false
  );
  assert.equal(
    coachCreateBookingSchema.safeParse({
      ...validCoachCreateBooking,
      recurrenceEndsOn: '2026-02-30',
    }).success,
    false
  );
  assert.equal(
    coachCreateBookingSchema.safeParse({
      ...validCoachCreateBooking,
      lessonType: 'duo',
      studentIds: [
        '10000000-0000-4000-8000-000000000001',
        '10000000-0000-4000-8000-000000000002',
      ],
    }).success,
    true
  );
  assert.equal(
    coachCreateBookingSchema.safeParse({
      ...validCoachCreateBooking,
      lessonType: 'duo',
    }).success,
    false
  );
});

test('coach booking modification rejects malformed RPC input', () => {
  const valid = {
    bookingId: '20000000-0000-4000-8000-000000000001',
    startsAt: '2026-08-10T16:00:00.000Z',
    durationMinutes: 90,
    location: 'Les Bruyères Centre Sportif',
  } as const;

  assert.equal(coachModifyBookingSchema.safeParse(valid).success, true);
  assert.equal(
    coachModifyBookingSchema.safeParse({ ...valid, bookingId: 'invalid' })
      .success,
    false
  );
  assert.equal(
    coachModifyBookingSchema.safeParse({ ...valid, durationMinutes: 30 }).success,
    false
  );
});

test('duo bookings require exactly two participants', () => {
  assert.equal(isBookingParticipantCountValid('individual', 1), true);
  assert.equal(isBookingParticipantCountValid('duo', 1), false);
  assert.equal(isBookingParticipantCountValid('duo', 2), true);
  assert.equal(isBookingParticipantCountValid('duo', 3), false);

  const duoRequest = {
    slotId: '20000000-0000-4000-8000-000000000001',
    startsAt: '2026-07-01T15:00:00.000Z',
    durationMinutes: 60,
    lessonType: 'duo',
    participantIds: ['30000000-0000-4000-8000-000000000001'],
  } as const;

  assert.equal(requestBookingSchema.safeParse(duoRequest).success, true);
  assert.equal(
    requestBookingSchema.safeParse({ ...duoRequest, participantIds: [] })
      .success,
    false
  );
  assert.equal(
    requestBookingSchema.safeParse({
      ...duoRequest,
      participantIds: [
        '30000000-0000-4000-8000-000000000001',
        '30000000-0000-4000-8000-000000000002',
      ],
    }).success,
    false
  );
});

test('canCreatePendingBooking enforces slot and student pending limits', () => {
  assert.deepEqual(
    canCreatePendingBooking({
      slotStatus: 'available',
      slotPendingCount: 1,
      studentPendingCount: 9,
      hasConfirmedBooking: false,
    }),
    { ok: true }
  );

  assert.deepEqual(
    canCreatePendingBooking({
      slotStatus: 'available',
      slotPendingCount: 2,
      studentPendingCount: 0,
      hasConfirmedBooking: false,
    }),
    { ok: false, error: 'pending_limit_reached' }
  );

  assert.deepEqual(
    canCreatePendingBooking({
      slotStatus: 'available',
      slotPendingCount: 0,
      studentPendingCount: 10,
      hasConfirmedBooking: false,
    }),
    { ok: false, error: 'student_pending_limit_reached' }
  );
});

test('canCreatePendingBooking rejects unavailable or already confirmed slots', () => {
  assert.deepEqual(
    canCreatePendingBooking({
      slotStatus: 'booked',
      slotPendingCount: 0,
      studentPendingCount: 0,
      hasConfirmedBooking: false,
    }),
    { ok: false, error: 'slot_unavailable' }
  );

  assert.deepEqual(
    canCreatePendingBooking({
      slotStatus: 'available',
      slotPendingCount: 0,
      studentPendingCount: 0,
      hasConfirmedBooking: true,
    }),
    { ok: false, error: 'slot_unavailable' }
  );
});

test('approval and refusal only accept pending bookings', () => {
  assert.deepEqual(canApproveBooking({ status: 'pending' }), { ok: true });
  assert.deepEqual(canRefuseBooking({ status: 'pending' }), { ok: true });
  assert.deepEqual(canApproveBooking({ status: 'expired' }), {
    ok: false,
    error: 'already_processed',
  });
  assert.deepEqual(canRefuseBooking({ status: 'confirmed' }), {
    ok: false,
    error: 'already_processed',
  });
});

test('student cancellation is blocked after the lesson starts', () => {
  const now = new Date('2026-06-29T12:00:00.000Z').getTime();

  assert.deepEqual(
    canCancelBooking(
      { status: 'pending', startsAt: '2026-06-29T13:00:00.000Z' },
      'student',
      now
    ),
    { ok: true }
  );

  assert.deepEqual(
    canCancelBooking(
      { status: 'modified', startsAt: '2026-06-29T13:00:00.000Z' },
      'student',
      now
    ),
    { ok: true }
  );

  assert.deepEqual(
    canCancelBooking(
      { status: 'pending', startsAt: '2026-06-29T13:00:00.000Z' },
      'coach',
      now
    ),
    { ok: false, error: 'already_processed' }
  );

  assert.deepEqual(
    canCancelBooking(
      { status: 'confirmed', startsAt: '2026-06-29T13:00:00.000Z' },
      'student',
      now
    ),
    { ok: true }
  );

  assert.deepEqual(
    canCancelBooking(
      { status: 'confirmed', startsAt: '2026-06-29T11:59:00.000Z' },
      'student',
      now
    ),
    { ok: false, error: 'past_booking' }
  );

  assert.deepEqual(
    canCancelBooking(
      { status: 'confirmed', startsAt: '2026-06-29T11:59:00.000Z' },
      'coach',
      now
    ),
    { ok: true }
  );
});

test('student cancellation message is trimmed and limited to 500 characters', () => {
  const valid = studentCancelBookingSchema.parse({
    bookingId: '10000000-0000-4000-8000-000000000001',
    cancellationMessage: '  Empêchement professionnel.  ',
  });

  assert.equal(valid.cancellationMessage, 'Empêchement professionnel.');
  assert.equal(
    studentCancelBookingSchema.parse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: 'a',
    }).cancellationMessage,
    'a'
  );
  assert.equal(
    studentCancelBookingSchema.safeParse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: ' '.repeat(10),
    }).success,
    false
  );
  assert.equal(
    studentCancelBookingSchema.safeParse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: 'a'.repeat(500),
    }).success,
    true
  );
  assert.equal(
    studentCancelBookingSchema.safeParse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: 'a'.repeat(501),
    }).success,
    false
  );
  assert.equal(
    studentCancelBookingSchema.safeParse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: '🙂'.repeat(500),
    }).success,
    true
  );
  assert.equal(
    studentCancelBookingSchema.safeParse({
      bookingId: '10000000-0000-4000-8000-000000000001',
      cancellationMessage: '🙂'.repeat(501),
    }).success,
    false
  );
});

test('pending booking expiration uses a seven day TTL', () => {
  const now = new Date('2026-06-29T12:00:00.000Z').getTime();

  assert.equal(isBookingExpired('2026-06-22T11:59:59.000Z', now), true);
  assert.equal(isBookingExpired('2026-06-22T12:00:01.000Z', now), false);
});

test('normalizeParticipantIds includes requester once and caps group size', () => {
  assert.deepEqual(
    normalizeParticipantIds('student-1', [
      'student-2',
      'student-1',
      'student-3',
      'student-4',
      'student-5',
    ]),
    ['student-1', 'student-2', 'student-3', 'student-4']
  );
});
