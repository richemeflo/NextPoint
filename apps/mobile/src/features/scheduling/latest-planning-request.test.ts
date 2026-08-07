import assert from 'node:assert/strict';
import test from 'node:test';

import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
  type PlanningRequestVersion,
} from './latest-planning-request';

test('only the latest planning request can update the screen', () => {
  const version: PlanningRequestVersion = { current: 0 };
  const previousWeek = beginPlanningRequest(version);
  const currentWeek = beginPlanningRequest(version);

  assert.equal(isLatestPlanningRequest(version, previousWeek), false);
  assert.equal(isLatestPlanningRequest(version, currentWeek), true);
});

test('effect cleanup invalidates its pending planning request', () => {
  const version: PlanningRequestVersion = { current: 0 };
  const pendingRequest = beginPlanningRequest(version);

  invalidatePlanningRequest(version);

  assert.equal(isLatestPlanningRequest(version, pendingRequest), false);
});
