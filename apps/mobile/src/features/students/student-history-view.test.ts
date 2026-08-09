import assert from 'node:assert/strict';
import test from 'node:test';

import { getStudentHistoryDisplayEvents } from './student-history-view';

const request = {
  id: 'request',
  eventType: 'booking_requested' as const,
  sourceId: 'booking-1',
};

test('keeps a lesson request while it is unanswered', () => {
  assert.deepEqual(getStudentHistoryDisplayEvents([request]), [request]);
});

test('hides a lesson request once the booking is confirmed', () => {
  const confirmation = {
    id: 'confirmation',
    eventType: 'lesson_confirmed' as const,
    sourceId: 'booking-1',
  };

  assert.deepEqual(getStudentHistoryDisplayEvents([confirmation, request]), [
    confirmation,
  ]);
});

test('hides a lesson request once it is refused or expired', () => {
  const refusal = {
    id: 'refusal',
    eventType: 'booking_cancelled' as const,
    sourceId: 'booking-1',
  };

  assert.deepEqual(getStudentHistoryDisplayEvents([refusal, request]), [refusal]);
});

test('does not hide requests belonging to another booking', () => {
  const confirmation = {
    id: 'confirmation',
    eventType: 'lesson_confirmed' as const,
    sourceId: 'booking-2',
  };

  assert.deepEqual(getStudentHistoryDisplayEvents([confirmation, request]), [
    confirmation,
    request,
  ]);
});
