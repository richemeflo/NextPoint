import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getStudentAvailabilityMonth,
  isSameStudentAvailabilityMonth,
  moveStudentAvailabilityMonth,
} from './student-availability-month';

test('builds a Monday-first calendar around the requested month', () => {
  const month = getStudentAvailabilityMonth('2026-09-18');

  assert.equal(month.monthKey, '2026-09');
  assert.equal(month.startDate, '2026-09-01');
  assert.equal(month.endDate, '2026-09-30');
  assert.equal(month.days[0]?.date, '2026-08-31');
  assert.equal(month.days.at(-1)?.date, '2026-10-04');
  assert.equal(month.days.length, 35);
});

test('includes leap days and enough complete calendar weeks', () => {
  const month = getStudentAvailabilityMonth('2024-02-01');

  assert.equal(month.endDate, '2024-02-29');
  assert.equal(month.days.length % 7, 0);
  assert.ok(month.days.some((day) => day.date === '2024-02-29'));
});

test('moves across year boundaries', () => {
  assert.equal(moveStudentAvailabilityMonth('2026-12-18', 1), '2027-01-01');
  assert.equal(moveStudentAvailabilityMonth('2026-01-18', -1), '2025-12-01');
});

test('compares month keys independently from the day', () => {
  assert.equal(
    isSameStudentAvailabilityMonth('2026-08-01', '2026-08-31'),
    true
  );
  assert.equal(
    isSameStudentAvailabilityMonth('2026-08-31', '2026-09-01'),
    false
  );
});
