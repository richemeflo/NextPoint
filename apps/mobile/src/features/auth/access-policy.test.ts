import assert from 'node:assert/strict';
import test from 'node:test';

import { getAuthRouteAccess } from './access-policy';

test('an unauthenticated user can only access auth routes', () => {
  assert.deepEqual(getAuthRouteAccess('unauthenticated', null), {
    allowAuthRoutes: true,
    allowCoachRoutes: false,
    allowEleveRoutes: false,
    allowLegalAcceptanceRoute: false,
    isLoading: false,
    hasAccessError: false,
  });
});

test('an authenticated coach can only access coach routes', () => {
  assert.deepEqual(getAuthRouteAccess('authenticated', 'coach'), {
    allowAuthRoutes: false,
    allowCoachRoutes: true,
    allowEleveRoutes: false,
    allowLegalAcceptanceRoute: false,
    isLoading: false,
    hasAccessError: false,
  });
});

test('an authenticated eleve can only access eleve routes', () => {
  assert.deepEqual(getAuthRouteAccess('authenticated', 'eleve'), {
    allowAuthRoutes: false,
    allowCoachRoutes: false,
    allowEleveRoutes: true,
    allowLegalAcceptanceRoute: false,
    isLoading: false,
    hasAccessError: false,
  });
});

test('a missing trusted role blocks every private route', () => {
  assert.deepEqual(getAuthRouteAccess('access-error', null), {
    allowAuthRoutes: false,
    allowCoachRoutes: false,
    allowEleveRoutes: false,
    allowLegalAcceptanceRoute: false,
    isLoading: false,
    hasAccessError: true,
  });
});

test('a user missing legal acceptance can only complete signup', () => {
  assert.deepEqual(getAuthRouteAccess('legal-acceptance-required', 'eleve'), {
    allowAuthRoutes: false,
    allowCoachRoutes: false,
    allowEleveRoutes: false,
    allowLegalAcceptanceRoute: true,
    isLoading: false,
    hasAccessError: false,
  });
});
