export const schedulingTimeZone = 'Europe/Paris';

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const zonedDateTimeFormatter = new Intl.DateTimeFormat(
  'en-GB-u-ca-gregory-nu-latn',
  {
    timeZone: schedulingTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }
);

type SchedulingDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  const value = parts.find((part) => part.type === type)?.value;
  return value === undefined ? Number.NaN : Number(value);
}

function getSchedulingParts(value: Date | number | string): SchedulingDateTimeParts {
  const instant = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError('Invalid scheduling instant');
  }

  const parts = zonedDateTimeFormatter.formatToParts(instant);
  return {
    year: getPart(parts, 'year'),
    month: getPart(parts, 'month'),
    day: getPart(parts, 'day'),
    hour: getPart(parts, 'hour'),
    minute: getPart(parts, 'minute'),
    second: getPart(parts, 'second'),
  };
}

function parseSchedulingLocalDateTime(date: string, time: string) {
  const dateMatch = datePattern.exec(date);
  const timeMatch = timePattern.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const parts = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
  };
  const dateCheck = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  if (
    dateCheck.getUTCFullYear() !== parts.year ||
    dateCheck.getUTCMonth() !== parts.month - 1 ||
    dateCheck.getUTCDate() !== parts.day
  ) {
    return null;
  }

  return parts;
}

function getSchedulingOffsetMs(instantMs: number) {
  const parts = getSchedulingParts(instantMs);
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    ) - instantMs
  );
}

function getSchedulingInstantsForLocalDateTime(date: string, time: string) {
  const desired = parseSchedulingLocalDateTime(date, time);
  if (!desired) return [];

  const localEpochMs = Date.UTC(
    desired.year,
    desired.month - 1,
    desired.day,
    desired.hour,
    desired.minute
  );
  const sampleDistanceMs = 36 * 60 * 60 * 1_000;
  const offsets = new Set([
    getSchedulingOffsetMs(localEpochMs - sampleDistanceMs),
    getSchedulingOffsetMs(localEpochMs),
    getSchedulingOffsetMs(localEpochMs + sampleDistanceMs),
  ]);
  const matchingInstants = new Set<number>();

  for (const offsetMs of offsets) {
    const candidateMs = localEpochMs - offsetMs;
    const candidate = getSchedulingParts(candidateMs);

    if (
      candidate.year === desired.year &&
      candidate.month === desired.month &&
      candidate.day === desired.day &&
      candidate.hour === desired.hour &&
      candidate.minute === desired.minute
    ) {
      matchingInstants.add(candidateMs);
    }
  }

  return [...matchingInstants].sort((left, right) => left - right);
}

export function schedulingLocalDateTimeToIso(
  date: string,
  time: string
): string | null {
  const instants = getSchedulingInstantsForLocalDateTime(date, time);
  return instants.length === 1 ? new Date(instants[0]).toISOString() : null;
}

export function getSchedulingDateKey(value: Date | number | string) {
  const parts = getSchedulingParts(value);
  return [
    parts.year,
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-');
}

export function getSchedulingTime(value: Date | number | string) {
  const parts = getSchedulingParts(value);
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

export function getSchedulingTimeMinutes(value: Date | number | string) {
  const parts = getSchedulingParts(value);
  return parts.hour * 60 + parts.minute;
}

export function getSchedulingToday(referenceDate = new Date()) {
  return getSchedulingDateKey(referenceDate);
}

export function getSchedulingDateLabelInstant(date: string): Date | null {
  const iso = schedulingLocalDateTimeToIso(date, '12:00');
  return iso ? new Date(iso) : null;
}

export function calculateSchedulingEndTime(
  date: string,
  startsAtLocalTime: string,
  durationMinutes: number
): string | null {
  const startsAt = schedulingLocalDateTimeToIso(date, startsAtLocalTime);
  if (!startsAt || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  const endsAt = new Date(new Date(startsAt).getTime() + durationMinutes * 60_000);
  if (getSchedulingDateKey(endsAt) !== date) return null;

  const endsAtLocalTime = getSchedulingTime(endsAt);
  return schedulingLocalDateTimeToIso(date, endsAtLocalTime) === endsAt.toISOString()
    ? endsAtLocalTime
    : null;
}
