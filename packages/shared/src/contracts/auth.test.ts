import assert from 'node:assert/strict';
import test from 'node:test';

import { signInSchema, signUpSchema } from './auth';

test('signInSchema accepts valid credentials', () => {
  const result = signInSchema.safeParse({
    email: 'student@example.com',
    password: 'password',
  });

  assert.equal(result.success, true);
});

test('signInSchema rejects invalid or incomplete credentials', () => {
  assert.equal(signInSchema.safeParse({ email: 'invalid', password: '' }).success, false);
  assert.equal(signInSchema.safeParse({ email: '', password: 'password' }).success, false);
});

test('signUpSchema requires a strong matching password', () => {
  assert.equal(
    signUpSchema.safeParse({
      email: 'coach@example.com',
      password: 'short',
      confirmPassword: 'short',
    }).success,
    false
  );
  assert.equal(
    signUpSchema.safeParse({
      email: 'coach@example.com',
      password: 'password',
      confirmPassword: 'different',
    }).success,
    false
  );
  assert.equal(
    signUpSchema.safeParse({
      email: 'coach@example.com',
      password: 'password',
      confirmPassword: 'password',
    }).success,
    true
  );
});
