import { z } from 'zod';

import {
  calculateSchedulingEndTime,
  schedulingLocalDateTimeToIso,
} from '../domain/scheduling-time';

export const availabilitySlotDurations = [60, 90] as const;
export const availabilitySlotStatuses = [
  'available',
  'booked',
  'cancelled',
] as const;
export const availabilityLocations = ['Les Bruyères Centre Sportif'] as const;
export const defaultAvailabilityLocation = availabilityLocations[0];
export const availabilityRecurrenceTypes = ['none', 'daily', 'weekly'] as const;

const localTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const localDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export type AvailabilitySlotDuration =
  (typeof availabilitySlotDurations)[number];
export type AvailabilitySlotStatus = (typeof availabilitySlotStatuses)[number];
export type AvailabilityLocation = (typeof availabilityLocations)[number];
export type AvailabilityRecurrenceType =
  (typeof availabilityRecurrenceTypes)[number];

export const availabilityRangeSchema = z
  .object({
    date: z.string().regex(localDateRegex, 'invalid_date'),
    startsAtLocalTime: z.string().regex(localTimeRegex, 'invalid_time'),
    endsAtLocalTime: z.string().regex(localTimeRegex, 'invalid_time'),
    slotDurationMinutes: z.enum(['60', '90']),
    location: z.enum(availabilityLocations),
    recurrenceType: z.enum(availabilityRecurrenceTypes),
    recurrenceEndsOn: z.string().optional(),
  })
  .superRefine((value, context) => {
    const startIso = schedulingLocalDateTimeToIso(
      value.date,
      value.startsAtLocalTime
    );
    const endIso = schedulingLocalDateTimeToIso(
      value.date,
      value.endsAtLocalTime
    );
    if (!startIso || !endIso) {
      context.addIssue({
        code: 'custom',
        message: 'invalid_time',
        path: [!startIso ? 'startsAtLocalTime' : 'endsAtLocalTime'],
      });
      return;
    }

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const durationMs = Number(value.slotDurationMinutes) * 60_000;

    if (end <= start) {
      context.addIssue({
        code: 'custom',
        message: 'end_before_start',
        path: ['endsAtLocalTime'],
      });
      return;
    }

    if (end - start < durationMs) {
      context.addIssue({
        code: 'custom',
        message: 'range_too_short',
        path: ['endsAtLocalTime'],
      });
    }

    const recurrenceEndsOn = value.recurrenceEndsOn?.trim() ?? '';
    if (value.recurrenceType === 'none') return;

    if (!recurrenceEndsOn) {
      context.addIssue({
        code: 'custom',
        message: 'recurrence_end_required',
        path: ['recurrenceEndsOn'],
      });
      return;
    }

    if (!localDateRegex.test(recurrenceEndsOn)) {
      context.addIssue({
        code: 'custom',
        message: 'invalid_date',
        path: ['recurrenceEndsOn'],
      });
      return;
    }

    if (recurrenceEndsOn < value.date) {
      context.addIssue({
        code: 'custom',
        message: 'recurrence_end_before_start',
        path: ['recurrenceEndsOn'],
      });
    }
  });

export type AvailabilityRangeFormInput = z.infer<
  typeof availabilityRangeSchema
>;

export type AvailabilityRangeInput = {
  startsAt: string;
  endsAt: string;
  slotDurationMinutes: AvailabilitySlotDuration;
  location: AvailabilityLocation;
  recurrenceType: AvailabilityRecurrenceType;
  recurrenceEndsOn: string | null;
};

export type AvailabilityPreviewSlot = {
  startsAt: string;
  endsAt: string;
  durationMinutes: AvailabilitySlotDuration;
  location: AvailabilityLocation;
};

export type AvailabilitySlotRequestabilityCandidate = {
  status: AvailabilitySlotStatus;
};

function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
}

function parseTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

export function calculateAvailabilityEndLocalTime(
  date: string,
  startsAtLocalTime: string,
  durationMinutes: number
) {
  if (
    !localDateRegex.test(date) ||
    !localTimeRegex.test(startsAtLocalTime) ||
    !availabilitySlotDurations.includes(
      durationMinutes as AvailabilitySlotDuration
    )
  ) {
    return null;
  }

  return calculateSchedulingEndTime(date, startsAtLocalTime, durationMinutes);
}

export function getDefaultAvailabilityRecurrenceEndsOn(date: string) {
  const { year, monthIndex, day } = parseDate(date);
  const targetMonthIndex = monthIndex + 1;
  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, targetMonthIndex + 1, 0)
  ).getUTCDate();
  const target = new Date(
    Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTargetMonth))
  );

  return [
    target.getUTCFullYear(),
    String(target.getUTCMonth() + 1).padStart(2, '0'),
    String(target.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function localDateTimeToUtcMs(
  date: string,
  time: string,
  timezoneOffsetMinutes: number
) {
  const { year, monthIndex, day } = parseDate(date);
  const { hours, minutes } = parseTime(time);
  return (
    Date.UTC(year, monthIndex, day, hours, minutes) +
    timezoneOffsetMinutes * 60_000
  );
}

export function toAvailabilityRangeInput(
  form: AvailabilityRangeFormInput,
  timezoneOffsetMinutes?: number
): AvailabilityRangeInput {
  const startsAt =
    timezoneOffsetMinutes === undefined
      ? schedulingLocalDateTimeToIso(form.date, form.startsAtLocalTime)
      : new Date(
          localDateTimeToUtcMs(
            form.date,
            form.startsAtLocalTime,
            timezoneOffsetMinutes
          )
        ).toISOString();
  const endsAt =
    timezoneOffsetMinutes === undefined
      ? schedulingLocalDateTimeToIso(form.date, form.endsAtLocalTime)
      : new Date(
          localDateTimeToUtcMs(
            form.date,
            form.endsAtLocalTime,
            timezoneOffsetMinutes
          )
        ).toISOString();

  if (!startsAt || !endsAt) {
    throw new RangeError('Invalid Europe/Paris availability range');
  }

  return {
    startsAt,
    endsAt,
    slotDurationMinutes: Number(
      form.slotDurationMinutes
    ) as AvailabilitySlotDuration,
    location: form.location,
    recurrenceType: form.recurrenceType,
    recurrenceEndsOn:
      form.recurrenceType === 'none'
        ? null
        : (form.recurrenceEndsOn?.trim() ?? null),
  };
}

export function buildAvailabilityPreviewSlots(
  range: AvailabilityRangeInput
): AvailabilityPreviewSlot[] {
  const startsAtMs = new Date(range.startsAt).getTime();
  const endsAtMs = new Date(range.endsAt).getTime();
  const durationMs = range.slotDurationMinutes * 60_000;
  const slots: AvailabilityPreviewSlot[] = [];

  for (
    let cursor = startsAtMs;
    cursor + durationMs <= endsAtMs;
    cursor += durationMs
  ) {
    slots.push({
      startsAt: new Date(cursor).toISOString(),
      endsAt: new Date(cursor + durationMs).toISOString(),
      durationMinutes: range.slotDurationMinutes,
      location: range.location,
    });
  }

  return slots;
}

export function isAvailabilitySlotRequestable(
  slot: AvailabilitySlotRequestabilityCandidate
) {
  return slot.status === 'available';
}
