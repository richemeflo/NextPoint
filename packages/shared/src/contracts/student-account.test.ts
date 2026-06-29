import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateStudentAccountSchema,
  isStudentAccountStatus,
  studentAccountStatuses,
} from './student-account';

test('student account lifecycle exposes the four approved states', () => {
  assert.deepEqual(studentAccountStatuses, [
    'pending_activation',
    'active',
    'suspended',
    'deleted',
  ]);
  assert.equal(isStudentAccountStatus('active'), true);
  assert.equal(isStudentAccountStatus('inactive'), false);
});

test('activation requires a token and a matching robust password', () => {
  assert.equal(
    activateStudentAccountSchema.safeParse({
      token: 'opaque-token',
      password: 'NextPoint-2026',
      confirmPassword: 'NextPoint-2026',
    }).success,
    true
  );
  assert.equal(
    activateStudentAccountSchema.safeParse({
      token: '',
      password: 'short',
      confirmPassword: 'different',
    }).success,
    false
  );
});
