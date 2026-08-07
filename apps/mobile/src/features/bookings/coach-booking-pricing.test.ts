import assert from 'node:assert/strict';
import test from 'node:test';

import { getCoachBookingPricingOptions } from './coach-booking-pricing';

const individualNinetyMinuteRate = {
  durationMinutes: 90 as const,
  isActive: true,
  lessonType: 'individual' as const,
  targetStudentIds: [],
};

test('coach booking defaults to an available active rate', () => {
  const options = getCoachBookingPricingOptions([individualNinetyMinuteRate], {
    durationMinutes: 60,
    lessonType: 'individual',
  });

  assert.deepEqual(options.lessonTypes, ['individual']);
  assert.deepEqual(options.durationMinutes, [90]);
  assert.deepEqual(options.selection, {
    durationMinutes: 90,
    lessonType: 'individual',
  });
  assert.equal(options.hasMatchingRate, true);
});

test('coach booking excludes inactive and unavailable targeted rates', () => {
  const options = getCoachBookingPricingOptions(
    [
      { ...individualNinetyMinuteRate, isActive: false },
      {
        ...individualNinetyMinuteRate,
        durationMinutes: 60,
        targetStudentIds: ['10000000-0000-4000-8000-000000000001'],
      },
    ],
    { durationMinutes: 60, lessonType: 'individual' },
    '20000000-0000-4000-8000-000000000001'
  );

  assert.deepEqual(options.lessonTypes, []);
  assert.deepEqual(options.durationMinutes, []);
  assert.equal(options.hasMatchingRate, false);
});

test('coach booking exposes targeted combinations before choosing a student', () => {
  const options = getCoachBookingPricingOptions(
    [
      {
        ...individualNinetyMinuteRate,
        targetStudentIds: ['10000000-0000-4000-8000-000000000001'],
      },
    ],
    { durationMinutes: 60, lessonType: 'individual' }
  );

  assert.deepEqual(options.lessonTypes, ['individual']);
  assert.deepEqual(options.durationMinutes, [90]);
});

test('coach booking keeps only combinations supported for the primary student', () => {
  const studentId = '10000000-0000-4000-8000-000000000001';
  const options = getCoachBookingPricingOptions(
    [
      individualNinetyMinuteRate,
      {
        durationMinutes: 60,
        isActive: true,
        lessonType: 'group',
        targetStudentIds: [studentId],
      },
    ],
    { durationMinutes: 90, lessonType: 'group' },
    studentId
  );

  assert.deepEqual(options.lessonTypes, ['individual', 'group']);
  assert.deepEqual(options.durationMinutes, [60]);
  assert.deepEqual(options.selection, {
    durationMinutes: 60,
    lessonType: 'group',
  });
});
