import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeCoachStatsError } from './coach-stats-error';

test('coach stats errors are normalized for translated UI states', () => {
  assert.equal(normalizeCoachStatsError('42501'), 'unauthorized');
  assert.equal(normalizeCoachStatsError('22023'), 'invalid_period');
  assert.equal(normalizeCoachStatsError('PGRST116'), 'unavailable');
  assert.equal(normalizeCoachStatsError(undefined), 'unknown');
});
