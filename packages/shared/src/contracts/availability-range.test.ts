import assert from 'node:assert/strict';
import test from 'node:test';

import {
  availabilityLocations,
  availabilityRangeSchema,
  availabilityRecurrenceTypes,
  availabilitySlotStatuses,
  availabilitySlotDurations,
  buildAvailabilityPreviewSlots,
  defaultAvailabilityLocation,
  getDefaultAvailabilityRecurrenceEndsOn,
  isAvailabilitySlotRequestable,
  toAvailabilityRangeInput,
} from './availability-range';

test('availability constants expose P0 durations, location and recurrence limits', () => {
  assert.deepEqual(availabilitySlotDurations, [60, 90]);
  assert.deepEqual(availabilitySlotStatuses, ['available', 'booked', 'cancelled']);
  assert.equal(defaultAvailabilityLocation, 'Les Bruyères Centre Sportif');
  assert.deepEqual(availabilityLocations, ['Les Bruyères Centre Sportif']);
  assert.deepEqual(availabilityRecurrenceTypes, ['none', 'daily', 'weekly']);
});

test('availabilityRangeSchema accepts a valid 1h30 coach range', () => {
  const parsed = availabilityRangeSchema.safeParse({
    date: '2026-07-01',
    startsAtLocalTime: '18:00',
    endsAtLocalTime: '20:00',
    slotDurationMinutes: '90',
    location: defaultAvailabilityLocation,
    recurrenceType: 'none',
    recurrenceEndsOn: '',
  });

  assert.equal(parsed.success, true);
});

test('availabilityRangeSchema accepts a valid daily recurring range with horizon', () => {
  const parsed = availabilityRangeSchema.safeParse({
    date: '2026-07-01',
    startsAtLocalTime: '18:00',
    endsAtLocalTime: '20:00',
    slotDurationMinutes: '60',
    location: defaultAvailabilityLocation,
    recurrenceType: 'daily',
    recurrenceEndsOn: '2026-08-01',
  });

  assert.equal(parsed.success, true);
});

test('availabilityRangeSchema rejects incomplete or incoherent ranges', () => {
  const invalidRanges = [
    {
      date: '',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '19:00',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'none',
      recurrenceEndsOn: '',
    },
    {
      date: '2026-07-01',
      startsAtLocalTime: '20:00',
      endsAtLocalTime: '19:00',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'none',
      recurrenceEndsOn: '',
    },
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '18:45',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'none',
      recurrenceEndsOn: '',
    },
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '20:00',
      slotDurationMinutes: '45',
      location: 'Club inconnu',
      recurrenceType: 'monthly',
      recurrenceEndsOn: '',
    },
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '20:00',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'daily',
      recurrenceEndsOn: '',
    },
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '20:00',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'weekly',
      recurrenceEndsOn: '2026-06-30',
    },
  ];

  for (const candidate of invalidRanges) {
    assert.equal(availabilityRangeSchema.safeParse(candidate).success, false);
  }
});

test('toAvailabilityRangeInput converts local UI boundaries to UTC ISO strings', () => {
  const input = toAvailabilityRangeInput(
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '20:00',
      slotDurationMinutes: '90',
      location: defaultAvailabilityLocation,
      recurrenceType: 'none',
      recurrenceEndsOn: '',
    },
    -120
  );

  assert.deepEqual(input, {
    startsAt: '2026-07-01T16:00:00.000Z',
    endsAt: '2026-07-01T18:00:00.000Z',
    slotDurationMinutes: 90,
    location: defaultAvailabilityLocation,
    recurrenceType: 'none',
    recurrenceEndsOn: null,
  });
});

test('toAvailabilityRangeInput preserves recurring generation horizon', () => {
  const input = toAvailabilityRangeInput(
    {
      date: '2026-07-01',
      startsAtLocalTime: '18:00',
      endsAtLocalTime: '20:00',
      slotDurationMinutes: '60',
      location: defaultAvailabilityLocation,
      recurrenceType: 'weekly',
      recurrenceEndsOn: '2026-08-01',
    },
    -120
  );

  assert.equal(input.recurrenceEndsOn, '2026-08-01');
});

test('getDefaultAvailabilityRecurrenceEndsOn proposes one month by default', () => {
  assert.equal(getDefaultAvailabilityRecurrenceEndsOn('2026-07-01'), '2026-08-01');
  assert.equal(getDefaultAvailabilityRecurrenceEndsOn('2026-01-31'), '2026-02-28');
});

test('buildAvailabilityPreviewSlots keeps generated slot location and duration', () => {
  const slots = buildAvailabilityPreviewSlots({
    startsAt: '2026-07-01T16:00:00.000Z',
    endsAt: '2026-07-01T18:00:00.000Z',
    slotDurationMinutes: 60,
    location: defaultAvailabilityLocation,
    recurrenceType: 'none',
    recurrenceEndsOn: null,
  });

  assert.deepEqual(slots, [
    {
      startsAt: '2026-07-01T16:00:00.000Z',
      endsAt: '2026-07-01T17:00:00.000Z',
      durationMinutes: 60,
      location: defaultAvailabilityLocation,
    },
    {
      startsAt: '2026-07-01T17:00:00.000Z',
      endsAt: '2026-07-01T18:00:00.000Z',
      durationMinutes: 60,
      location: defaultAvailabilityLocation,
    },
  ]);
});

test('buildAvailabilityPreviewSlots creates only complete slots', () => {
  const slots = buildAvailabilityPreviewSlots({
    startsAt: '2026-07-01T16:00:00.000Z',
    endsAt: '2026-07-01T18:15:00.000Z',
    slotDurationMinutes: 90,
    location: defaultAvailabilityLocation,
    recurrenceType: 'none',
    recurrenceEndsOn: null,
  });

  assert.deepEqual(slots, [
    {
      startsAt: '2026-07-01T16:00:00.000Z',
      endsAt: '2026-07-01T17:30:00.000Z',
      durationMinutes: 90,
      location: defaultAvailabilityLocation,
    },
  ]);
});

test('isAvailabilitySlotRequestable only exposes available slots', () => {
  assert.equal(isAvailabilitySlotRequestable({ status: 'available' }), true);
  assert.equal(isAvailabilitySlotRequestable({ status: 'booked' }), false);
  assert.equal(isAvailabilitySlotRequestable({ status: 'cancelled' }), false);
});
