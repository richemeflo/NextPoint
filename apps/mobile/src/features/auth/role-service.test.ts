import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasPrivateRouteAccess,
  resolveCurrentUserAccess,
} from './user-access';

test('a student without a profile can access onboarding', () => {
  const access = resolveCurrentUserAccess('eleve', null);

  assert.deepEqual(access, { role: 'eleve', accountStatus: null });
  assert.equal(hasPrivateRouteAccess(access), true);
});

test('an unreadable student status fails closed', () => {
  assert.equal(resolveCurrentUserAccess('eleve', undefined), null);
  assert.equal(hasPrivateRouteAccess(null), false);
});

test('only active student account statuses grant private access', () => {
  const active = resolveCurrentUserAccess('eleve', 'active');
  const pending = resolveCurrentUserAccess('eleve', 'pending_activation');
  const suspended = resolveCurrentUserAccess('eleve', 'suspended');
  const deleted = resolveCurrentUserAccess('eleve', 'deleted');

  assert.deepEqual(active, {
    role: 'eleve',
    accountStatus: 'active',
  });
  assert.equal(hasPrivateRouteAccess(active), true);
  assert.equal(hasPrivateRouteAccess(pending), false);
  assert.equal(hasPrivateRouteAccess(suspended), false);
  assert.equal(hasPrivateRouteAccess(deleted), false);
});

test('coach access does not require a student profile', () => {
  const access = resolveCurrentUserAccess('coach', null);

  assert.deepEqual(access, {
    role: 'coach',
    accountStatus: null,
  });
  assert.equal(hasPrivateRouteAccess(access), true);
});
