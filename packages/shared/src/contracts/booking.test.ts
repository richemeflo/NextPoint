import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canApproveBooking,
  canCancelBooking,
  canCreatePendingBooking,
  canRefuseBooking,
  isBookingExpired,
  normalizeParticipantIds,
} from './booking';

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
