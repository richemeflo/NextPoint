import assert from 'node:assert/strict';
import test from 'node:test';

import { getAuthRouteAccess } from './access-policy';

test('an unauthenticated user can only access auth routes', () => {
  assert.deepEqual(getAuthRouteAccess('unauthenticated', null), {
    allowAuthRoutes: true,
    allowCoachRoutes: false,
    allowEleveRoutes: false,
    isLoading: false,
    hasAccessError: false,
  });
});

test('an authenticated coach can only access coach routes', () => {
  assert.deepEqual(getAuthRouteAccess('authenticated', 'coach'), {
    allowAuthRoutes: false,
    allowCoachRoutes: true,
    allowEleveRoutes: false,
    isLoading: false,
    hasAccessError: false,
  });
});

test('an authenticated eleve can only access eleve routes', () => {
  assert.deepEqual(getAuthRouteAccess('authenticated', 'eleve'), {
    allowAuthRoutes: false,
    allowCoachRoutes: false,
    allowEleveRoutes: true,
    isLoading: false,
    hasAccessError: false,
  });
});

test('a missing trusted role blocks every private route', () => {
  assert.deepEqual(getAuthRouteAccess('access-error', null), {
    allowAuthRoutes: false,
    allowCoachRoutes: false,
    allowEleveRoutes: false,
    isLoading: false,
    hasAccessError: true,
  });
});
