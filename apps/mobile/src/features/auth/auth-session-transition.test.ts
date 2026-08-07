import assert from 'node:assert/strict';
import test from 'node:test';

import { createAuthSessionTransitionGuard } from './auth-session-transition';

test('only the latest session transition can apply its asynchronous result', () => {
  const guard = createAuthSessionTransitionGuard();
  const firstSession = guard.begin();
  const secondSession = guard.begin();

  assert.equal(guard.isCurrent(firstSession), false);
  assert.equal(guard.isCurrent(secondSession), true);
});

test('unmount invalidates every pending session transition', () => {
  const guard = createAuthSessionTransitionGuard();
  const pendingSession = guard.begin();

  guard.deactivate();

  assert.equal(guard.isCurrent(pendingSession), false);
});
