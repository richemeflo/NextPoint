import {
  bookingParticipantProfileReadModelSchema,
  bookingParticipantReadModelSchema,
  bookingPricingReadModelSchema,
  bookingReadModelSchema,
  coachCreateBookingSchema,
  coachCancelBookingRecurrencesSchema,
  coachModifyBookingSchema,
  requestBookingSchema,
  type BookingParticipantProfileReadModel,
  type BookingPricingReadModel,
  type BookingReadModel,
  type CoachCreateBookingInput,
  type CoachCancelBookingRecurrencesInput,
  type CoachModifyBookingInput,
  type RequestBookingInput,
  type Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

import { mapBookingError, type BookingMutationError } from './booking-error';

export type { BookingMutationError } from './booking-error';

type BookingRow = Tables<'bookings'>;
type BookingHydrationRow = Omit<BookingRow, 'recurrence_series_id'> & {
  recurrence_series_id?: string | null;
};
type PricingRateRow = Tables<'pricing_rates'>;
type StudentProfileRow = Tables<'student_profiles'>;

export type BookingParticipant = BookingParticipantProfileReadModel;
export type BookingPricing = BookingPricingReadModel;
export type Booking = BookingReadModel;

type BookingsResult = { ok: true; data: Booking[] } | { ok: false };
type BookingResult =
  | { ok: true; data: Booking }
  | { ok: false; error: BookingMutationError };
type CoachBookingResult =
  | { ok: true; data: Booking[] }
  | { ok: false; error: BookingMutationError };
type BookingRecurrenceCancellationResult =
  | { ok: true; cancelledCount: number }
  | { ok: false; error: BookingMutationError };
type RequestableParticipantsResult =
  | { ok: true; data: BookingParticipant[] }
  | { ok: false };

function parsePricing(row: PricingRateRow | undefined): BookingPricing | null {
  if (!row) return null;

  const parsed = bookingPricingReadModelSchema.safeParse({
    id: row.id,
    label: row.label,
    amountCents: row.amount_cents,
    currency: row.currency,
  });

  return parsed.success ? parsed.data : null;
}

function parseBooking(
  row: BookingHydrationRow,
  participantsByBookingId: Map<string, BookingParticipant[]>,
  pricingById: Map<string, BookingPricing>
): Booking | null {
  const parsed = bookingReadModelSchema.safeParse({
    id: row.id,
    availabilitySlotId: row.availability_slot_id,
    recurrenceSeriesId: row.recurrence_series_id ?? null,
    coachId: row.coach_id,
    studentId: row.student_id,
    pricingRateId: row.pricing_rate_id,
    lessonType: row.lesson_type,
    status: row.status,
    origin: row.origin,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    location: row.location,
    studentComment: row.student_comment,
    coachRefusalComment: row.coach_refusal_comment,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: participantsByBookingId.get(row.id) ?? [],
    pricing: row.pricing_rate_id
      ? pricingById.get(row.pricing_rate_id) ?? null
      : null,
  });

  return parsed.success ? parsed.data : null;
}

async function hydrateBookings(
  rows: BookingHydrationRow[]
): Promise<Booking[] | null> {
  if (!supabase || rows.length === 0) return [];

  const bookingIds = rows.map((row) => row.id);
  const pricingIds = Array.from(
    new Set(
      rows
        .map((row) => row.pricing_rate_id)
        .filter((pricingRateId): pricingRateId is string => !!pricingRateId)
    )
  );
  const participantsByBookingId = new Map<string, BookingParticipant[]>();
  const pricingById = new Map<string, BookingPricing>();

  const [participantsResult, pricingResult] = await Promise.all([
    supabase
      .from('booking_participants')
      .select('booking_id, student_id, created_at')
      .in('booking_id', bookingIds),
    pricingIds.length > 0
      ? supabase.from('pricing_rates').select('*').in('id', pricingIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (!participantsResult.error && participantsResult.data.length > 0) {
    const participantRows = participantsResult.data;
    const studentIds = Array.from(
      new Set(participantRows.map((participant) => participant.student_id))
    );
    const profileResult = await supabase
      .from('student_profiles')
      .select('*')
      .in('user_id', studentIds);
    const profilesById = new Map<string, StudentProfileRow>();

    if (!profileResult.error) {
      for (const profile of profileResult.data) {
        profilesById.set(profile.user_id, profile);
      }
    }

    for (const participant of participantRows) {
      const parsedParticipant = bookingParticipantReadModelSchema.safeParse({
        bookingId: participant.booking_id,
        studentId: participant.student_id,
        fullName: profilesById.get(participant.student_id)?.full_name ?? null,
      });
      if (!parsedParticipant.success) return null;

      const { bookingId, ...profile } = parsedParticipant.data;
      const current = participantsByBookingId.get(bookingId) ?? [];
      current.push(profile);
      participantsByBookingId.set(bookingId, current);
    }
  }

  if (!pricingResult.error) {
    for (const rate of pricingResult.data) {
      const parsedPricing = parsePricing(rate);
      if (!parsedPricing) return null;
      pricingById.set(parsedPricing.id, parsedPricing);
    }
  }

  const bookings: Booking[] = [];
  for (const row of rows) {
    const parsedBooking = parseBooking(
      row,
      participantsByBookingId,
      pricingById
    );
    if (!parsedBooking) return null;
    bookings.push(parsedBooking);
  }

  return bookings;
}

export async function getCoachBookingsInRange(
  coachId: string,
  startsAt: string,
  endsAt: string
): Promise<BookingsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('coach_id', coachId)
    .gte('starts_at', startsAt)
    .lt('starts_at', endsAt)
    .order('starts_at');

  if (error) return { ok: false };
  const bookings = await hydrateBookings(data);
  return bookings ? { ok: true, data: bookings } : { ok: false };
}

export async function getStudentBookingsInRange(
  startsAt: string,
  endsAt: string
): Promise<BookingsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('starts_at', startsAt)
    .lt('starts_at', endsAt)
    .order('starts_at');

  if (error) return { ok: false };
  const bookings = await hydrateBookings(data);
  return bookings ? { ok: true, data: bookings } : { ok: false };
}

export async function getRequestableBookingParticipants(): Promise<RequestableParticipantsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc(
    'get_requestable_booking_participants'
  );

  if (error || !data) return { ok: false };

  const participants = bookingParticipantProfileReadModelSchema.array().safeParse(
    data.map((profile) => ({
      studentId: profile.user_id,
      fullName: profile.full_name,
    }))
  );

  return participants.success
    ? { ok: true, data: participants.data }
    : { ok: false };
}

export async function requestBooking(
  input: RequestBookingInput
): Promise<BookingResult> {
  const parsed = requestBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('request_booking', {
    p_slot_id: parsed.data.slotId,
    p_starts_at: parsed.data.startsAt,
    p_duration_minutes: parsed.data.durationMinutes,
    p_lesson_type: parsed.data.lessonType,
    p_student_comment: parsed.data.studentComment ?? '',
    p_participant_ids: parsed.data.participantIds,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings([data]);
  const booking = bookings?.[0];
  if (!booking) return { ok: false, error: 'unknown' };
  return { ok: true, data: booking };
}

export async function approveBooking(bookingId: string): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('approve_booking', {
    p_booking_id: bookingId,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings([data]);
  const booking = bookings?.[0];
  if (!booking) return { ok: false, error: 'unknown' };
  return { ok: true, data: booking };
}

export async function refuseBooking(
  bookingId: string,
  refusalComment: string
): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('refuse_booking', {
    p_booking_id: bookingId,
    p_refusal_comment: refusalComment,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings([data]);
  const booking = bookings?.[0];
  if (!booking) return { ok: false, error: 'unknown' };
  return { ok: true, data: booking };
}

export async function expirePendingBookings(): Promise<
  { ok: true; expiredCount: number } | { ok: false }
> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('expire_pending_bookings');
  if (error || typeof data !== 'number') return { ok: false };

  return { ok: true, expiredCount: data };
}

export async function createCoachBooking(
  input: CoachCreateBookingInput
): Promise<CoachBookingResult> {
  const parsed = coachCreateBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('create_coach_booking', {
    p_student_ids: parsed.data.studentIds,
    p_starts_at: parsed.data.startsAt,
    p_duration_minutes: parsed.data.durationMinutes,
    p_location: parsed.data.location,
    p_lesson_type: parsed.data.lessonType,
    p_recurrence_ends_on: (parsed.data.recurrenceEndsOn ?? null) as string,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings(data);
  if (!bookings) return { ok: false, error: 'unknown' };
  return { ok: true, data: bookings };
}

export async function cancelBooking(
  bookingId: string,
  cancellationMessage?: string
): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
    p_cancellation_message: cancellationMessage,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings([data]);
  const booking = bookings?.[0];
  if (!booking) return { ok: false, error: 'unknown' };
  return { ok: true, data: booking };
}

export async function modifyBooking(
  input: CoachModifyBookingInput
): Promise<BookingResult> {
  const parsed = coachModifyBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('modify_booking', {
    p_booking_id: parsed.data.bookingId,
    p_student_ids: parsed.data.studentIds,
    p_starts_at: parsed.data.startsAt,
    p_duration_minutes: parsed.data.durationMinutes,
    p_location: parsed.data.location,
    p_lesson_type: parsed.data.lessonType,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings([data]);
  const booking = bookings?.[0];
  if (!booking) return { ok: false, error: 'unknown' };
  return { ok: true, data: booking };
}

export async function cancelBookingRecurrences(
  input: CoachCancelBookingRecurrencesInput
): Promise<BookingRecurrenceCancellationResult> {
  const parsed = coachCancelBookingRecurrencesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('cancel_booking_recurrences', {
    p_booking_id: parsed.data.bookingId,
    p_starts_on: parsed.data.startsOn,
    p_ends_on: parsed.data.endsOn,
  });

  if (error || typeof data !== 'number') {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  return { ok: true, cancelledCount: data };
}
