import assert from 'node:assert/strict';
import test from 'node:test';

import type { Booking } from './booking-service';
import {
  filterStudentBookings,
  type StudentBookingStatusFilter,
} from './student-booking-filter';

const bookings = [
  { id: 'pending', status: 'pending' },
  { id: 'confirmed', status: 'confirmed' },
  { id: 'modified', status: 'modified' },
  { id: 'refused', status: 'refused' },
  { id: 'cancelled', status: 'cancelled' },
  { id: 'expired', status: 'expired' },
] as Booking[];

function ids(filter: StudentBookingStatusFilter) {
  return filterStudentBookings(bookings, filter).map(({ id }) => id);
}

test('student booking filter preserves every booking when set to all', () => {
  assert.deepEqual(ids('all'), bookings.map(({ id }) => id));
});

test('confirmed student bookings include modified lessons', () => {
  assert.deepEqual(ids('confirmed'), ['confirmed', 'modified']);
});

test('student booking filter keeps other statuses separate', () => {
  assert.deepEqual(ids('pending'), ['pending']);
  assert.deepEqual(ids('refused'), ['refused']);
  assert.deepEqual(ids('cancelled'), ['cancelled']);
  assert.deepEqual(ids('expired'), ['expired']);
});
