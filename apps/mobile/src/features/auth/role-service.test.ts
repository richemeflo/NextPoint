import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCurrentUserAccess } from './user-access';

test('student access fails closed when the profile is absent or hidden', () => {
  assert.equal(resolveCurrentUserAccess('eleve', null), null);
  assert.equal(resolveCurrentUserAccess('eleve', undefined), null);
});

test('student access preserves every explicit account status', () => {
  assert.deepEqual(resolveCurrentUserAccess('eleve', 'active'), {
    role: 'eleve',
    accountStatus: 'active',
  });
  assert.deepEqual(resolveCurrentUserAccess('eleve', 'suspended'), {
    role: 'eleve',
    accountStatus: 'suspended',
  });
});

test('coach access does not require a student profile', () => {
  assert.deepEqual(resolveCurrentUserAccess('coach', null), {
    role: 'coach',
    accountStatus: null,
  });
});
