import assert from 'node:assert/strict';
import test from 'node:test';

import {
  lessonPackSchema,
  lessonPackStatuses,
  toLessonPackInput,
} from './lesson-pack';

const validLessonPackInput = {
  includedSessions: '10',
  pricingRateId: '20000000-0000-4000-8000-000000000001',
  lessonType: 'group',
  durationMinutes: '90',
} as const;

test('lesson pack accepts a positive lesson count for a pricing rate', () => {
  const parsed = lessonPackSchema.safeParse(validLessonPackInput);

  assert.equal(parsed.success, true);
  assert.deepEqual(
    toLessonPackInput(validLessonPackInput),
    {
      includedSessions: 10,
      pricingRateId: validLessonPackInput.pricingRateId,
      lessonType: 'group',
      durationMinutes: 90,
    }
  );
});

test('lesson pack rejects zero, decimals and excessive counts', () => {
  for (const includedSessions of ['0', '1.5', '101', 'invalid']) {
    assert.equal(
      lessonPackSchema.safeParse({
        ...validLessonPackInput,
        includedSessions,
      }).success,
      false
    );
  }
});

test('lesson pack rejects invalid pricing dimensions', () => {
  assert.equal(
    lessonPackSchema.safeParse({
      ...validLessonPackInput,
      pricingRateId: 'invalid',
    }).success,
    false
  );
  assert.equal(
    lessonPackSchema.safeParse({
      ...validLessonPackInput,
      lessonType: 'unexpected',
    }).success,
    false
  );
});

test('lesson pack exposes active and exhausted statuses only', () => {
  assert.deepEqual(lessonPackStatuses, ['active', 'exhausted']);
});
