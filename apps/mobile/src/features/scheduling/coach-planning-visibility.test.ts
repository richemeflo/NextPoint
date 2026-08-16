import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isCoachPlanningBookingBlockVisible,
  isCoachPlanningBookingVisible,
  isCoachPlanningSlotVisible,
} from './coach-planning-visibility';

test('cancelled availability slots stay out of the coach planning', () => {
  assert.equal(isCoachPlanningSlotVisible('available'), true);
  assert.equal(isCoachPlanningSlotVisible('booked'), true);
  assert.equal(isCoachPlanningSlotVisible('cancelled'), false);
});

test('the coach can hide every availability without hiding lessons', () => {
  assert.equal(isCoachPlanningSlotVisible('available', false), false);
  assert.equal(isCoachPlanningSlotVisible('booked', false), false);
  assert.equal(isCoachPlanningBookingBlockVisible('confirmed'), true);
});

test('cancelled bookings stay out of linked planning slot details', () => {
  assert.equal(isCoachPlanningBookingVisible('pending'), true);
  assert.equal(isCoachPlanningBookingVisible('confirmed'), true);
  assert.equal(isCoachPlanningBookingVisible('cancelled'), false);
});

test('confirmed and modified lessons render as planning blocks', () => {
  assert.equal(isCoachPlanningBookingBlockVisible('pending'), false);
  assert.equal(isCoachPlanningBookingBlockVisible('confirmed'), true);
  assert.equal(isCoachPlanningBookingBlockVisible('modified'), true);
  assert.equal(isCoachPlanningBookingBlockVisible('refused'), false);
  assert.equal(isCoachPlanningBookingBlockVisible('cancelled'), false);
});

test('the coach can hide confirmed and modified lesson blocks', () => {
  assert.equal(isCoachPlanningBookingBlockVisible('confirmed', false), false);
  assert.equal(isCoachPlanningBookingBlockVisible('modified', false), false);
  assert.equal(isCoachPlanningBookingBlockVisible('confirmed', true), true);
});
