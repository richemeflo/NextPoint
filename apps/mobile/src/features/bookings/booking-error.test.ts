import assert from 'node:assert/strict';
import test from 'node:test';

import { mapBookingError } from './booking-error';

test('booking errors distinguish pending limits from other check constraints', () => {
  assert.equal(
    mapBookingError('23514', 'pending limit reached'),
    'pending_limit_reached'
  );
  assert.equal(
    mapBookingError('23514', 'Pending Limit Reached'),
    'pending_limit_reached'
  );
  assert.equal(
    mapBookingError(
      '23514',
      'new row violates check constraint "student_history_events_description_check"'
    ),
    'invalid_input'
  );
  assert.equal(mapBookingError('23514'), 'invalid_input');
});

test('booking errors preserve cancellation message validation', () => {
  assert.equal(
    mapBookingError('22023', 'student cancellation message is required'),
    'invalid_input'
  );
});
