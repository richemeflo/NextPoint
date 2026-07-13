import type {
  BookingOrigin,
  BookingStatus,
  CoachCreateBookingInput,
  CoachModifyBookingInput,
  PricingDuration,
  PricingLessonType,
  RequestBookingInput,
  Tables,
} from '@nextpoint/shared';

import { processPendingPushNotifications } from '@/features/notifications/notification-service';
import { supabase } from '@/lib/supabase/client';

type BookingRow = Tables<'bookings'>;
type BookingParticipantRow = Tables<'booking_participants'>;
type PricingRateRow = Tables<'pricing_rates'>;
type StudentProfileRow = Tables<'student_profiles'>;

export type BookingParticipant = {
  studentId: string;
  fullName: string | null;
};

export type BookingPricing = {
  id: string;
  label: string;
  amountCents: number;
  currency: 'EUR';
};

export type Booking = {
  id: string;
  availabilitySlotId: string | null;
  coachId: string;
  studentId: string;
  pricingRateId: string | null;
  lessonType: PricingLessonType;
  status: BookingStatus;
  origin: BookingOrigin;
  startsAt: string;
  endsAt: string;
  durationMinutes: PricingDuration;
  location: string;
  studentComment: string | null;
  coachRefusalComment: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: BookingParticipant[];
  pricing: BookingPricing | null;
};

export type BookingMutationError =
  | 'unauthorized'
  | 'slot_unavailable'
  | 'pending_limit_reached'
  | 'student_pending_limit_reached'
  | 'already_processed'
  | 'past_booking'
  | 'invalid_participants'
  | 'pricing_rate_missing'
  | 'not_found'
  | 'unknown';

type BookingsResult = { ok: true; data: Booking[] } | { ok: false };
type BookingResult =
  | { ok: true; data: Booking }
  | { ok: false; error: BookingMutationError };
type CoachBookingResult =
  | { ok: true; data: Booking[] }
  | { ok: false; error: BookingMutationError };
type RequestableParticipantsResult =
  | { ok: true; data: BookingParticipant[] }
  | { ok: false };

function mapBookingError(code: string | undefined, message?: string): BookingMutationError {
  if (code === '42501') return 'unauthorized';
  if (code === 'P0002') {
    return message?.includes('pricing') ? 'pricing_rate_missing' : 'not_found';
  }
  if (code === '23505') return 'slot_unavailable';
  if (code === '23514') return 'pending_limit_reached';
  if (code === '22023') {
    return message?.includes('past')
      ? 'past_booking'
      : message?.includes('participant')
        ? 'invalid_participants'
        : 'student_pending_limit_reached';
  }
  if (code === '55000') {
    return message?.includes('processed') || message?.includes('refused')
      ? 'already_processed'
      : 'slot_unavailable';
  }

  return 'unknown';
}

function mapPricing(row: PricingRateRow | undefined): BookingPricing | null {
  if (!row) return null;

  return {
    id: row.id,
    label: row.label,
    amountCents: row.amount_cents,
    currency: row.currency as 'EUR',
  };
}

function mapBooking(
  row: BookingRow,
  participantsByBookingId: Map<string, BookingParticipant[]>,
  pricingById: Map<string, PricingRateRow>
): Booking {
  return {
    id: row.id,
    availabilitySlotId: row.availability_slot_id,
    coachId: row.coach_id,
    studentId: row.student_id,
    pricingRateId: row.pricing_rate_id,
    lessonType: row.lesson_type as PricingLessonType,
    status: row.status,
    origin: row.origin,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes as PricingDuration,
    location: row.location,
    studentComment: row.student_comment,
    coachRefusalComment: row.coach_refusal_comment,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participants: participantsByBookingId.get(row.id) ?? [],
    pricing: row.pricing_rate_id
      ? mapPricing(pricingById.get(row.pricing_rate_id))
      : null,
  };
}

async function hydrateBookings(rows: BookingRow[]): Promise<Booking[]> {
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
  const pricingById = new Map<string, PricingRateRow>();

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
    const participantRows = participantsResult.data as BookingParticipantRow[];
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
      const current = participantsByBookingId.get(participant.booking_id) ?? [];
      current.push({
        studentId: participant.student_id,
        fullName: profilesById.get(participant.student_id)?.full_name ?? null,
      });
      participantsByBookingId.set(participant.booking_id, current);
    }
  }

  if (!pricingResult.error) {
    for (const rate of pricingResult.data) {
      pricingById.set(rate.id, rate);
    }
  }

  return rows.map((row) => mapBooking(row, participantsByBookingId, pricingById));
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
  return { ok: true, data: await hydrateBookings(data) };
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
  return { ok: true, data: await hydrateBookings(data) };
}

export async function getStudentBookings(): Promise<BookingsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('starts_at', { ascending: false });

  if (error) return { ok: false };
  return { ok: true, data: await hydrateBookings(data) };
}

export async function getRequestableBookingParticipants(): Promise<RequestableParticipantsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc(
    'get_requestable_booking_participants'
  );

  if (error || !data) return { ok: false };

  return {
    ok: true,
    data: data.map((profile) => ({
      studentId: profile.user_id,
      fullName: profile.full_name,
    })),
  };
}

export async function requestBooking(
  input: RequestBookingInput
): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('request_booking', {
    p_slot_id: input.slotId,
    p_lesson_type: input.lessonType,
    p_student_comment: input.studentComment ?? '',
    p_participant_ids: input.participantIds,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const [booking] = await hydrateBookings([data]);
  void processPendingPushNotifications();
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

  const [booking] = await hydrateBookings([data]);
  void processPendingPushNotifications();
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

  const [booking] = await hydrateBookings([data]);
  void processPendingPushNotifications();
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
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('create_coach_booking', {
    p_student_ids: input.studentIds,
    p_starts_at: input.startsAt,
    p_duration_minutes: input.durationMinutes,
    p_location: input.location,
    p_lesson_type: input.lessonType,
    p_recurrence_ends_on: (input.recurrenceEndsOn ?? null) as string,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const bookings = await hydrateBookings(data);
  void processPendingPushNotifications();
  return { ok: true, data: bookings };
}

export async function cancelBooking(bookingId: string): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('cancel_booking', {
    p_booking_id: bookingId,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const [booking] = await hydrateBookings([data]);
  void processPendingPushNotifications();
  return { ok: true, data: booking };
}

export async function modifyBooking(
  input: CoachModifyBookingInput
): Promise<BookingResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('modify_booking', {
    p_booking_id: input.bookingId,
    p_starts_at: input.startsAt,
    p_duration_minutes: input.durationMinutes,
    p_location: input.location,
  });

  if (error || !data) {
    return { ok: false, error: mapBookingError(error?.code, error?.message) };
  }

  const [booking] = await hydrateBookings([data]);
  void processPendingPushNotifications();
  return { ok: true, data: booking };
}
