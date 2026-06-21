import assert from 'node:assert/strict';
import test from 'node:test';

import {
  studentProfileSchema,
  toStudentProfileInput,
} from './student-profile';

const validProfile = {
  fullName: 'Camille Martin',
  phone: '+33 6 12 34 56 78',
  email: 'camille@example.com',
  padelLevel: '6',
  age: '29',
  preferredLanguage: 'fr' as const,
};

test('studentProfileSchema accepts a complete valid profile', () => {
  assert.equal(studentProfileSchema.safeParse(validProfile).success, true);
});

test('studentProfileSchema rejects invalid level, age, phone and email', () => {
  assert.equal(
    studentProfileSchema.safeParse({ ...validProfile, padelLevel: '11' }).success,
    false
  );
  assert.equal(
    studentProfileSchema.safeParse({ ...validProfile, age: '4' }).success,
    false
  );
  assert.equal(
    studentProfileSchema.safeParse({ ...validProfile, phone: 'abc' }).success,
    false
  );
  assert.equal(
    studentProfileSchema.safeParse({ ...validProfile, email: 'invalid' }).success,
    false
  );
});

test('toStudentProfileInput maps form strings to the typed domain input', () => {
  assert.deepEqual(toStudentProfileInput(validProfile), {
    fullName: 'Camille Martin',
    phone: '+33 6 12 34 56 78',
    email: 'camille@example.com',
    padelLevel: 6,
    age: 29,
    preferredLanguage: 'fr',
  });
});
