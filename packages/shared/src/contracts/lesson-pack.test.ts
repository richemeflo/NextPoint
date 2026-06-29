import assert from 'node:assert/strict';
import test from 'node:test';

import {
  lessonPackSchema,
  lessonPackStatuses,
  toLessonPackInput,
} from './lesson-pack';

test('lesson pack accepts a positive individual lesson count', () => {
  const parsed = lessonPackSchema.safeParse({ includedSessions: '10' });

  assert.equal(parsed.success, true);
  assert.deepEqual(
    toLessonPackInput({ includedSessions: '10' }),
    { includedSessions: 10 }
  );
});

test('lesson pack rejects zero, decimals and excessive counts', () => {
  for (const includedSessions of ['0', '1.5', '101', 'invalid']) {
    assert.equal(
      lessonPackSchema.safeParse({ includedSessions }).success,
      false
    );
  }
});

test('lesson pack exposes active and exhausted statuses only', () => {
  assert.deepEqual(lessonPackStatuses, ['active', 'exhausted']);
});
