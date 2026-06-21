import assert from 'node:assert/strict';
import test from 'node:test';

import { mapSupabaseAuthError } from './auth-error';

test('maps known Supabase errors to stable client codes', () => {
  assert.equal(mapSupabaseAuthError({ code: 'invalid_credentials' }), 'invalid_credentials');
  assert.equal(mapSupabaseAuthError({ code: 'user_already_exists' }), 'email_in_use');
  assert.equal(mapSupabaseAuthError({ code: 'weak_password' }), 'weak_password');
  assert.equal(mapSupabaseAuthError({ status: 429 }), 'rate_limited');
});

test('does not expose unknown technical errors', () => {
  assert.equal(mapSupabaseAuthError({ code: 'database_error', status: 500 }), 'unknown');
});
