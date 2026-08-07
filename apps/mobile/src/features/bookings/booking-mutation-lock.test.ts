import assert from 'node:assert/strict';
import test from 'node:test';

import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
  type BookingMutationLock,
} from './booking-mutation-lock';

test('booking mutations cannot acquire the same lock twice in parallel', () => {
  const lock: BookingMutationLock = { current: false };

  assert.equal(acquireBookingMutationLock(lock), true);
  assert.equal(acquireBookingMutationLock(lock), false);

  releaseBookingMutationLock(lock);
  assert.equal(acquireBookingMutationLock(lock), true);
});
