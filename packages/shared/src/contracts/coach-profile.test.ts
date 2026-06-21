import assert from 'node:assert/strict';
import test from 'node:test';

import { coachProfileSchema, toCoachProfileInput } from './coach-profile';

const validProfile = {
  displayName: 'Coach NextPoint',
  bio: 'Coach de padel dédié à des cours simples, structurés et adaptés.',
  phone: '+33 6 12 34 56 78',
  email: 'coach@example.com',
  preferredLanguage: 'fr' as const,
};

test('coachProfileSchema accepts a complete public coach profile', () => {
  assert.equal(coachProfileSchema.safeParse(validProfile).success, true);
});

test('coachProfileSchema rejects invalid public information', () => {
  assert.equal(
    coachProfileSchema.safeParse({ ...validProfile, displayName: 'A' }).success,
    false
  );
  assert.equal(
    coachProfileSchema.safeParse({ ...validProfile, bio: 'Trop court' }).success,
    false
  );
  assert.equal(
    coachProfileSchema.safeParse({ ...validProfile, phone: 'invalid' }).success,
    false
  );
});

test('toCoachProfileInput normalizes public coach information', () => {
  assert.deepEqual(toCoachProfileInput(validProfile), validProfile);
});
