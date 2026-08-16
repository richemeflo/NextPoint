import assert from 'node:assert/strict';
import test from 'node:test';

import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
  type PlanningRequestVersion,
} from './latest-planning-request';
import { createScreenReferenceCache } from './screen-reference-cache';

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

test('screen reference data is loaded once for every cache key', async () => {
  const cache = createScreenReferenceCache<string>();
  let loads = 0;
  const load = async () => {
    loads += 1;
    return { ok: true as const, data: `reference-${loads}` };
  };

  const first = await cache.get('coach-1', load);
  const second = await cache.get('coach-1', load);
  const otherCoach = await cache.get('coach-2', load);

  assert.deepEqual(first, { ok: true, data: 'reference-1' });
  assert.deepEqual(second, first);
  assert.deepEqual(otherCoach, { ok: true, data: 'reference-2' });
  assert.equal(loads, 2);
});

test('period changes share an in-flight reference request', async () => {
  const cache = createScreenReferenceCache<string>();
  let resolveLoad: ((result: { ok: true; data: string }) => void) | undefined;
  let loads = 0;
  const load = () => {
    loads += 1;
    return new Promise<{ ok: true; data: string }>((resolve) => {
      resolveLoad = resolve;
    });
  };

  const firstWindow = cache.get('student-agenda', load);
  const secondWindow = cache.get('student-agenda', load);
  resolveLoad?.({ ok: true, data: 'shared-reference' });

  assert.deepEqual(await firstWindow, {
    ok: true,
    data: 'shared-reference',
  });
  assert.deepEqual(await secondWindow, await firstWindow);
  assert.equal(loads, 1);
});

test('a failed reference request can be retried', async () => {
  const cache = createScreenReferenceCache<string>();
  let loads = 0;
  const load = async () => {
    loads += 1;
    return loads === 1
      ? ({ ok: false } as const)
      : ({ ok: true, data: 'recovered' } as const);
  };

  assert.deepEqual(await cache.get('planning', load), { ok: false });
  assert.deepEqual(await cache.get('planning', load), {
    ok: true,
    data: 'recovered',
  });
  assert.equal(loads, 2);
});
