import assert from 'node:assert/strict';
import test from 'node:test';

import {
  activateStudentAccountResponseSchema,
  createManualStudentResponseSchema,
  deletePendingStudentResponseSchema,
  generateStudentActivationLinkResponseSchema,
} from './student-edge-function';

const studentRow = {
  user_id: '9c4ef2e5-ad51-46dc-a348-99d8f6378b0b',
  full_name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+33123456789',
  padel_level: 5,
  age: 30,
  sex: 'female',
  preferred_language: 'fr',
  account_status: 'pending_activation',
  created_at: '2026-08-06T10:00:00.000Z',
  updated_at: '2026-08-06T10:00:00.000Z',
};

test('manual student response requires a complete valid student row', () => {
  assert.equal(
    createManualStudentResponseSchema.safeParse({
      ok: true,
      data: { ...studentRow, age: null, email: '' },
    }).success,
    true
  );
  assert.equal(
    createManualStudentResponseSchema.safeParse({
      ok: true,
      data: studentRow,
    }).success,
    true
  );
  assert.equal(
    createManualStudentResponseSchema.safeParse({
      ok: true,
      data: { ...studentRow, user_id: 'not-a-uuid' },
    }).success,
    false
  );
});

test('activation response does not accept a truthy but malformed payload', () => {
  assert.equal(
    activateStudentAccountResponseSchema.safeParse({ ok: true }).success,
    false
  );
  assert.equal(
    activateStudentAccountResponseSchema.safeParse({
      ok: true,
      data: { activated: true, email: studentRow.email },
    }).success,
    true
  );
  assert.equal(
    activateStudentAccountResponseSchema.safeParse({
      ok: true,
      data: { activated: true },
    }).success,
    false
  );
});

test('activation link response validates the returned URL', () => {
  assert.equal(
    generateStudentActivationLinkResponseSchema.safeParse({
      ok: true,
      data: { activationLink: 'not-a-url', expiresAt: 'tomorrow' },
    }).success,
    false
  );
  assert.equal(
    generateStudentActivationLinkResponseSchema.safeParse({
      ok: true,
      data: {
        activationLink:
          'https://app.example.com/activate-student#token=secret&type=student_activation',
        expiresAt: '2026-08-07T10:00:00.000Z',
      },
    }).success,
    true
  );
});

test('known error envelope remains parseable', () => {
  assert.equal(
    generateStudentActivationLinkResponseSchema.safeParse({
      ok: false,
      error: { code: 'unauthorized', message: 'Coach role required' },
    }).success,
    true
  );
});

test('pending student deletion response requires the deleted student id', () => {
  assert.equal(
    deletePendingStudentResponseSchema.safeParse({
      ok: true,
      data: { deletedStudentId: studentRow.user_id },
    }).success,
    true
  );
  assert.equal(
    deletePendingStudentResponseSchema.safeParse({
      ok: true,
      data: { deletedStudentId: 'not-a-uuid' },
    }).success,
    false
  );
});
