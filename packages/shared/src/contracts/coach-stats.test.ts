import assert from 'node:assert/strict';
import test from 'node:test';

import {
  coachStatsReadModelSchema,
  getCoachStatsPeriodRange,
  hasCoachStatsData,
} from './coach-stats';

test('coach stats read model accepts a bounded aggregate without payment data', () => {
  const parsed = coachStatsReadModelSchema.parse({
    periodStart: '2026-07-01T00:00:00.000Z',
    periodEnd: '2026-08-01T00:00:00.000Z',
    generatedAt: '2026-07-13T12:00:00.000Z',
    completedCourses: 3,
    completedMinutes: 210,
    estimatedRevenueCents: 13500,
    currency: 'EUR',
    activeStudents: [
      { studentId: '20000000-0000-4000-8000-000000000001', fullName: 'Ada', courseCount: 2 },
    ],
  });

  assert.equal(parsed.estimatedRevenueCents, 13500);
  assert.equal('payments' in parsed, false);
  assert.equal(hasCoachStatsData(parsed), true);
});

test('coach stats read model rejects negative aggregates', () => {
  assert.equal(
    coachStatsReadModelSchema.safeParse({
      periodStart: '2026-07-01T00:00:00.000Z',
      periodEnd: '2026-08-01T00:00:00.000Z',
      generatedAt: '2026-07-13T12:00:00.000Z',
      completedCourses: -1,
      completedMinutes: 0,
      estimatedRevenueCents: 0,
      currency: 'EUR',
      activeStudents: [],
    }).success,
    false
  );
});

test('month is the default period and quarter/year boundaries are available', () => {
  const reference = new Date(2026, 6, 13, 12, 0, 0);

  assert.deepEqual(getCoachStatsPeriodRange(undefined, reference), {
    period: 'month',
    startsAt: new Date(2026, 6, 1).toISOString(),
    endsAt: new Date(2026, 7, 1).toISOString(),
  });
  assert.deepEqual(getCoachStatsPeriodRange('quarter', reference), {
    period: 'quarter',
    startsAt: new Date(2026, 6, 1).toISOString(),
    endsAt: new Date(2026, 9, 1).toISOString(),
  });
  assert.deepEqual(getCoachStatsPeriodRange('year', reference), {
    period: 'year',
    startsAt: new Date(2026, 0, 1).toISOString(),
    endsAt: new Date(2027, 0, 1).toISOString(),
  });
});

test('empty stats are explicit and usable', () => {
  const empty = coachStatsReadModelSchema.parse({
    periodStart: '2026-07-01T00:00:00.000Z',
    periodEnd: '2026-08-01T00:00:00.000Z',
    generatedAt: '2026-07-13T12:00:00.000Z',
    completedCourses: 0,
    completedMinutes: 0,
    estimatedRevenueCents: 0,
    currency: 'EUR',
    activeStudents: [],
  });

  assert.equal(hasCoachStatsData(empty), false);
});
