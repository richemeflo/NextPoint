import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isCoachPlanningBookingVisible,
  isCoachPlanningSlotVisible,
} from './coach-planning-visibility';

test('cancelled availability slots stay out of the coach planning', () => {
  assert.equal(isCoachPlanningSlotVisible('available'), true);
  assert.equal(isCoachPlanningSlotVisible('booked'), true);
  assert.equal(isCoachPlanningSlotVisible('cancelled'), false);
});

test('cancelled bookings stay out of linked planning slot details', () => {
  assert.equal(isCoachPlanningBookingVisible('pending'), true);
  assert.equal(isCoachPlanningBookingVisible('confirmed'), true);
  assert.equal(isCoachPlanningBookingVisible('cancelled'), false);
});
