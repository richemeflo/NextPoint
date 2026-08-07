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
  const reference = new Date('2026-07-13T10:00:00.000Z');

  assert.deepEqual(getCoachStatsPeriodRange(undefined, reference), {
    period: 'month',
    startsAt: '2026-06-30T22:00:00.000Z',
    endsAt: '2026-07-31T22:00:00.000Z',
  });
  assert.deepEqual(getCoachStatsPeriodRange('quarter', reference), {
    period: 'quarter',
    startsAt: '2026-06-30T22:00:00.000Z',
    endsAt: '2026-09-30T22:00:00.000Z',
  });
  assert.deepEqual(getCoachStatsPeriodRange('year', reference), {
    period: 'year',
    startsAt: '2025-12-31T23:00:00.000Z',
    endsAt: '2026-12-31T23:00:00.000Z',
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
