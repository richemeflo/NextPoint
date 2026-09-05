import {
  availabilitySlotDurations,
  findNearestAvailableStart,
  schedulingLocalDateTimeToIso,
  type AvailabilityOccurrenceCandidate,
  type AvailabilitySlotDuration,
} from '@nextpoint/shared';

const quarterHourTimePattern = /^(?:[01]\d|2[0-3]):(?:00|15|30|45)$/;
const bookingRequestIntervalMs = 15 * 60_000;

export function getEarliestBookingRequestStartsAt(nowMs = Date.now()) {
  return (
    Math.floor(nowMs / bookingRequestIntervalMs) * bookingRequestIntervalMs +
    bookingRequestIntervalMs
  );
}

export function toBookingRequestStartsAt(
  date: string,
  localTime: string
): string | null {
  const normalizedTime = localTime.trim();
  if (!quarterHourTimePattern.test(normalizedTime)) return null;

  return schedulingLocalDateTimeToIso(date, normalizedTime);
}

export type BookingRequestProposal = {
  startsAt: string | null;
  availableDurations: AvailabilitySlotDuration[];
};

export function getDefaultBookingRequestDuration(
  proposal: BookingRequestProposal
): AvailabilitySlotDuration {
  return proposal.availableDurations.includes(90) ? 90 : 60;
}

function getBounds(startsAt: string, endsAt: string) {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  return Number.isFinite(start) && Number.isFinite(end) && end > start
    ? { start, end }
    : null;
}

function isExactStartAvailable(
  occurrence: AvailabilityOccurrenceCandidate,
  startsAtMs: number,
  durationMinutes: AvailabilitySlotDuration
) {
  const startsAt = new Date(startsAtMs).toISOString();
  return (
    findNearestAvailableStart(occurrence, startsAt, durationMinutes) ===
    startsAt
  );
}

export function getBookingRequestProposal(
  occurrence: AvailabilityOccurrenceCandidate,
  desiredStartsAt: string
): BookingRequestProposal {
  const desiredStart = new Date(desiredStartsAt).getTime();
  if (!Number.isFinite(desiredStart)) {
    return { startsAt: null, availableDurations: [] };
  }

  const oneHourMs = availabilitySlotDurations[0] * 60_000;
  const desiredEnd = desiredStart + oneHourMs;
  const firstConflict = occurrence.occupations
    .map((occupation) => getBounds(occupation.startsAt, occupation.endsAt))
    .filter(
      (bounds): bounds is { start: number; end: number } => bounds !== null
    )
    .filter((bounds) => bounds.start < desiredEnd && bounds.end > desiredStart)
    .sort((first, second) => first.start - second.start)[0];

  const preferredStart = firstConflict ? firstConflict.start - oneHourMs : null;
  const proposedStartsAt =
    preferredStart !== null &&
    isExactStartAvailable(occurrence, preferredStart, 60)
      ? new Date(preferredStart).toISOString()
      : findNearestAvailableStart(occurrence, desiredStartsAt, 60);

  if (!proposedStartsAt) {
    return { startsAt: null, availableDurations: [] };
  }

  const proposedStartMs = new Date(proposedStartsAt).getTime();
  const availableDurations = availabilitySlotDurations.filter((duration) =>
    isExactStartAvailable(occurrence, proposedStartMs, duration)
  );

  return { startsAt: proposedStartsAt, availableDurations };
}
