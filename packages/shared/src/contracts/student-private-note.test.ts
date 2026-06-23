import assert from 'node:assert/strict';
import test from 'node:test';

import {
  studentPrivateNoteSchema,
  toStudentPrivateNoteInput,
} from './student-private-note';

test('student private note accepts useful bounded content', () => {
  const parsed = studentPrivateNoteSchema.safeParse({
    content: 'Travailler les sorties de vitre au prochain cours.',
  });

  assert.equal(parsed.success, true);
});

test('student private note rejects empty and oversized content', () => {
  assert.equal(
    studentPrivateNoteSchema.safeParse({ content: '   ' }).success,
    false
  );
  assert.equal(
    studentPrivateNoteSchema.safeParse({ content: 'x'.repeat(2001) }).success,
    false
  );
});

test('student private note input trims deliberate saves', () => {
  assert.deepEqual(
    toStudentPrivateNoteInput({ content: '  Rappel utile.  ' }),
    { content: 'Rappel utile.' }
  );
});
