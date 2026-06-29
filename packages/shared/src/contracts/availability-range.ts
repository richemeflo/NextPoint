import { z } from 'zod';

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
  })
  .superRefine((value, context) => {
    const start = localDateTimeToUtcMs(
      value.date,
      value.startsAtLocalTime,
      getTimezoneOffsetForLocalDateTime(value.date, value.startsAtLocalTime)
    );
    const end = localDateTimeToUtcMs(
      value.date,
      value.endsAtLocalTime,
      getTimezoneOffsetForLocalDateTime(value.date, value.endsAtLocalTime)
    );
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

function getTimezoneOffsetForLocalDateTime(date: string, time: string) {
  const { year, monthIndex, day } = parseDate(date);
  const { hours, minutes } = parseTime(time);
  return new Date(year, monthIndex, day, hours, minutes).getTimezoneOffset();
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
  const startOffset =
    timezoneOffsetMinutes ??
    getTimezoneOffsetForLocalDateTime(form.date, form.startsAtLocalTime);
  const endOffset =
    timezoneOffsetMinutes ??
    getTimezoneOffsetForLocalDateTime(form.date, form.endsAtLocalTime);

  return {
    startsAt: new Date(
      localDateTimeToUtcMs(form.date, form.startsAtLocalTime, startOffset)
    ).toISOString(),
    endsAt: new Date(
      localDateTimeToUtcMs(form.date, form.endsAtLocalTime, endOffset)
    ).toISOString(),
    slotDurationMinutes: Number(
      form.slotDurationMinutes
    ) as AvailabilitySlotDuration,
    location: form.location,
    recurrenceType: form.recurrenceType,
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
