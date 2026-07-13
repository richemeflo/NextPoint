import assert from 'node:assert/strict';
import test from 'node:test';

import {
  coachStatsPeriodOptions,
  getCoachStatsStudentName,
} from './coach-stats-view';

test('P0 period options prioritize month and exclude week', () => {
  assert.deepEqual(
    coachStatsPeriodOptions.map((option) => option.period),
    ['month', 'quarter', 'year']
  );
  assert.equal(coachStatsPeriodOptions.some((option) => option.period === ('week' as never)), false);
});

test('active student display uses a discreet fallback when a profile name is unavailable', () => {
  assert.equal(getCoachStatsStudentName('Ada Lovelace', 'Élève'), 'Ada Lovelace');
  assert.equal(getCoachStatsStudentName(null, 'Élève'), 'Élève');
});
