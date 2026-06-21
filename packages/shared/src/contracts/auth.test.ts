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
      role: 'coach',
    }).success,
    false
  );
  assert.equal(
    signUpSchema.safeParse({
      email: 'coach@example.com',
      password: 'password',
      confirmPassword: 'different',
      role: 'coach',
    }).success,
    false
  );
  assert.equal(
    signUpSchema.safeParse({
      email: 'coach@example.com',
      password: 'password',
      confirmPassword: 'password',
      role: 'coach',
    }).success,
    true
  );
});

test('signUpSchema only accepts trusted application roles', () => {
  assert.equal(
    signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'password',
      confirmPassword: 'password',
      role: 'admin',
    }).success,
    false
  );
});
