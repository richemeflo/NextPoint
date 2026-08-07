import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateSchedulingEndTime,
  getSchedulingDateKey,
  getSchedulingTime,
  schedulingLocalDateTimeToIso,
  schedulingTimeZone,
} from './scheduling-time';

test('scheduling uses the Europe/Paris timezone', () => {
  assert.equal(schedulingTimeZone, 'Europe/Paris');
  assert.equal(
    schedulingLocalDateTimeToIso('2026-07-01', '00:00'),
    '2026-06-30T22:00:00.000Z'
  );
  assert.equal(
    schedulingLocalDateTimeToIso('2026-01-01', '00:00'),
    '2025-12-31T23:00:00.000Z'
  );
});

test('scheduling date and time keys stay Paris-based around UTC midnight', () => {
  const instant = '2026-07-01T22:30:00.000Z';

  assert.equal(getSchedulingDateKey(instant), '2026-07-02');
  assert.equal(getSchedulingTime(instant), '00:30');
});

test('scheduling rejects missing and ambiguous Paris times during DST changes', () => {
  assert.equal(schedulingLocalDateTimeToIso('2026-03-29', '02:30'), null);
  assert.equal(schedulingLocalDateTimeToIso('2026-10-25', '02:30'), null);
  assert.equal(calculateSchedulingEndTime('2026-03-29', '01:30', 90), '04:00');
});
