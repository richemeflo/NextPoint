import assert from 'node:assert/strict';
import test from 'node:test';

import { getAuthRouteAccess } from './access-policy';

test('an unauthenticated user can only access auth routes', () => {
  assert.deepEqual(getAuthRouteAccess('unauthenticated'), {
    allowAuthRoutes: true,
    allowAppRoutes: false,
    isLoading: false,
  });
});

test('an authenticated coach or eleve can access the shared app boundary', () => {
  for (const role of ['coach', 'eleve']) {
    assert.deepEqual(
      { role, ...getAuthRouteAccess('authenticated') },
      {
        role,
        allowAuthRoutes: false,
        allowAppRoutes: true,
        isLoading: false,
      }
    );
  }
});

test('role-specific rejection remains outside the shared auth boundary', () => {
  const access = getAuthRouteAccess('authenticated');

  assert.equal(access.allowAppRoutes, true);
  assert.equal(access.allowAuthRoutes, false);
});
