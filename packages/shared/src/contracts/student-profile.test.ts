import assert from 'node:assert/strict';
import test from 'node:test';

import {
  manualStudentProfileSchema,
  studentProfileSchema,
  toManualStudentProfileInput,
  toStudentProfileInput,
} from './student-profile';

const validProfile = {
  fullName: 'Camille Martin',
  phone: '+33 6 12 34 56 78',
  email: 'camille@example.com',
  padelLevel: '6',
  age: '29',
  sex: 'female' as const,
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
  assert.equal(
    studentProfileSchema.safeParse({ ...validProfile, sex: 'invalid' }).success,
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
    sex: 'female',
    preferredLanguage: 'fr',
  });
});

test('manualStudentProfileSchema accepts only the fields required by manual creation', () => {
  const manualProfile = {
    fullName: validProfile.fullName,
    phone: validProfile.phone,
    email: validProfile.email,
    padelLevel: validProfile.padelLevel,
    age: validProfile.age,
    sex: validProfile.sex,
  };

  assert.equal(manualStudentProfileSchema.safeParse(manualProfile).success, true);
  assert.equal(
    manualStudentProfileSchema.safeParse({ ...manualProfile, fullName: '' })
      .success,
    false
  );
});

test('toManualStudentProfileInput normalizes the manual profile command', () => {
  assert.deepEqual(
    toManualStudentProfileInput({
      fullName: '  Camille Martin ',
      phone: ' +33 6 12 34 56 78 ',
      email: ' Camille@Example.com ',
      padelLevel: '6',
      age: '29',
      sex: 'female',
    }),
    {
      fullName: 'Camille Martin',
      phone: '+33 6 12 34 56 78',
      email: 'camille@example.com',
      padelLevel: 6,
      age: 29,
      sex: 'female',
    }
  );
});
