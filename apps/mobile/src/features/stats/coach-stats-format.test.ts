import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatCoachStatsHours,
  formatCoachStatsRevenue,
} from './coach-stats-format';

test('completed minutes are formatted as lightweight localized hours', () => {
  assert.equal(formatCoachStatsHours(120, 'fr'), '2 h');
  assert.equal(formatCoachStatsHours(90, 'fr'), '1,5 h');
  assert.equal(formatCoachStatsHours(90, 'en'), '1.5 h');
});

test('estimated revenue is formatted from cents in EUR', () => {
  const formatted = formatCoachStatsRevenue(10500, 'fr', 'EUR');

  assert.match(formatted, /105/);
  assert.match(formatted, /€/);
});
