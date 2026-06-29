import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isStudentHistoryEventStatus,
  isStudentHistoryEventType,
  studentHistoryEventStatuses,
  studentHistoryEventTypes,
} from './student-history';

test('student history exposes only P0 activity types', () => {
  assert.deepEqual(studentHistoryEventTypes, [
    'booking_requested',
    'lesson_confirmed',
    'booking_cancelled',
    'booking_modified',
    'lesson_pack_assigned',
    'lesson_pack_consumed',
  ]);
  assert.equal(isStudentHistoryEventType('lesson_confirmed'), true);
  assert.equal(isStudentHistoryEventType('sport_progress'), false);
});

test('student history statuses remain explicit and translatable', () => {
  assert.deepEqual(studentHistoryEventStatuses, [
    'pending',
    'confirmed',
    'refused',
    'expired',
    'cancelled',
    'modified',
    'active',
    'exhausted',
  ]);
  assert.equal(isStudentHistoryEventStatus('cancelled'), true);
  assert.equal(isStudentHistoryEventStatus('unknown'), false);
});
