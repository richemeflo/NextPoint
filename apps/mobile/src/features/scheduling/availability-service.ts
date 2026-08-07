import type {
  AvailabilityOccupation,
  AvailabilityRangeInput,
  AvailabilityRecurrenceType,
  AvailabilitySlotDuration,
  AvailabilitySlotStatus,
  Tables,
} from '@nextpoint/shared';
import { getAvailabilityFreeFragments } from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type AvailabilityRangeRow = Tables<'availability_ranges'>;
type AvailabilitySlotRow = Tables<'availability_slots'>;

export type AvailabilityRange = {
  id: string;
  coachId: string;
  startsAt: string;
  endsAt: string;
  slotDurationMinutes: AvailabilitySlotDuration;
  location: string;
  recurrenceType: AvailabilityRecurrenceType;
  recurrenceEndsOn: string | null;
  updatedAt: string;
};

export type AvailabilitySlot = {
  id: string;
  occurrenceId: string;
  rangeId: string;
  coachId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  location: string;
  status: AvailabilitySlotStatus;
  updatedAt: string;
  occurrenceStartsAt: string;
  occurrenceEndsAt: string;
  occupations: AvailabilityOccupation[];
};

type AvailabilityRangesResult =
  | { ok: true; data: AvailabilityRange[] }
  | { ok: false };

type AvailabilitySlotsResult =
  | { ok: true; data: AvailabilitySlot[] }
  | { ok: false };

type CreateAvailabilityRangeResult =
  | { ok: true; data: AvailabilityRange }
  | { ok: false; code?: 'conflict' | 'forbidden' | 'invalid' };

type AvailabilitySlotMutationInput = {
  slotId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  location: string;
  applyToSeries: boolean;
};

type AvailabilitySlotMutationResult =
  | { ok: true; data: AvailabilitySlot[] }
  | { ok: false; code?: 'blocked' | 'conflict' | 'forbidden' | 'invalid' };

type AvailabilitySlotDeleteResult =
  | { ok: true; deletedCount: number }
  | { ok: false; code?: 'blocked' | 'forbidden' };

function mapAvailabilityMutationErrorCode(errorCode: string | undefined) {
  return errorCode === '23P01'
    ? 'conflict'
    : errorCode === '42501'
      ? 'forbidden'
      : errorCode === '55000'
        ? 'blocked'
        : errorCode === '23514' || errorCode === '22023'
          ? 'invalid'
          : undefined;
}

function mapAvailabilityCreationErrorCode(errorCode: string | undefined) {
  const code = mapAvailabilityMutationErrorCode(errorCode);

  return code === 'blocked' ? undefined : code;
}

function mapAvailabilityRange(row: AvailabilityRangeRow): AvailabilityRange {
  return {
    id: row.id,
    coachId: row.coach_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    slotDurationMinutes: row.slot_duration_minutes as AvailabilitySlotDuration,
    location: row.location,
    recurrenceType: row.recurrence_type,
    recurrenceEndsOn: row.recurrence_ends_on,
    updatedAt: row.updated_at,
  };
}

function mapAvailabilitySlot(row: AvailabilitySlotRow): AvailabilitySlot {
  return {
    id: row.id,
    occurrenceId: row.id,
    rangeId: row.availability_range_id,
    coachId: row.coach_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes,
    location: row.location,
    status: row.status,
    updatedAt: row.updated_at,
    occurrenceStartsAt: row.starts_at,
    occurrenceEndsAt: row.ends_at,
    occupations: [],
  };
}

export async function getCoachAvailabilityRanges(
  coachId: string
): Promise<AvailabilityRangesResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('availability_ranges')
    .select('*')
    .eq('coach_id', coachId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: true });

  if (error) return { ok: false };
  return { ok: true, data: data.map(mapAvailabilityRange) };
}

export async function getCoachAvailabilitySlots(
  coachId: string
): Promise<AvailabilitySlotsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('coach_id', coachId)
    .is('deleted_at', null)
    .order('starts_at', { ascending: true });

  if (error) return { ok: false };
  return { ok: true, data: data.map(mapAvailabilitySlot) };
}

export async function getCoachAvailabilitySlotsInRange(
  coachId: string,
  startsAt: string,
  endsAt: string
): Promise<AvailabilitySlotsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('coach_id', coachId)
    .neq('status', 'cancelled')
    .is('deleted_at', null)
    .gte('starts_at', startsAt)
    .lt('starts_at', endsAt)
    .order('starts_at', { ascending: true });

  if (error) return { ok: false };
  return { ok: true, data: data.map(mapAvailabilitySlot) };
}

export async function getStudentRequestableAvailabilitySlotsInRange(
  startsAt: string,
  endsAt: string
): Promise<AvailabilitySlotsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc(
    'get_student_availability_occurrences',
    { p_starts_at: startsAt, p_ends_at: endsAt }
  );

  if (error || !data) return { ok: false };
  const fragments: AvailabilitySlot[] = [];

  for (const row of data) {
    if (!Array.isArray(row.occupations)) return { ok: false };

    const occupations: AvailabilityOccupation[] = [];
    for (const occupation of row.occupations) {
      if (
        typeof occupation !== 'object' ||
        occupation === null ||
        !('startsAt' in occupation) ||
        !('endsAt' in occupation) ||
        typeof occupation.startsAt !== 'string' ||
        typeof occupation.endsAt !== 'string' ||
        !Number.isFinite(new Date(occupation.startsAt).getTime()) ||
        !Number.isFinite(new Date(occupation.endsAt).getTime()) ||
        new Date(occupation.endsAt).getTime() <=
          new Date(occupation.startsAt).getTime()
      ) {
        return { ok: false };
      }
      occupations.push({
        startsAt: occupation.startsAt,
        endsAt: occupation.endsAt,
      });
    }

    const rowFragments = getAvailabilityFreeFragments({
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      occupations,
    });

    for (const fragment of rowFragments) {
      fragments.push({
        id: `${row.id}:${fragment.startsAt}`,
        occurrenceId: row.id,
        rangeId: row.availability_range_id,
        coachId: row.coach_id,
        startsAt: fragment.startsAt,
        endsAt: fragment.endsAt,
        durationMinutes: Math.round(
          (new Date(fragment.endsAt).getTime() -
            new Date(fragment.startsAt).getTime()) /
            60_000
        ),
        location: row.location,
        status: row.status,
        updatedAt: row.updated_at,
        occurrenceStartsAt: row.starts_at,
        occurrenceEndsAt: row.ends_at,
        occupations,
      });
    }
  }

  return {
    ok: true,
    data: fragments.sort(
      (first, second) =>
        new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime()
    ),
  };
}

export async function createAvailabilityRange(
  range: AvailabilityRangeInput
): Promise<CreateAvailabilityRangeResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('create_availability_range', {
    p_starts_at: range.startsAt,
    p_ends_at: range.endsAt,
    p_slot_duration_minutes: range.slotDurationMinutes,
    p_location: range.location,
    p_recurrence_type: range.recurrenceType,
    p_recurrence_ends_on: range.recurrenceEndsOn as string,
  });

  if (error || !data) {
    return { ok: false, code: mapAvailabilityCreationErrorCode(error?.code) };
  }

  return { ok: true, data: mapAvailabilityRange(data) };
}

export async function updateAvailabilitySlot(
  input: AvailabilitySlotMutationInput
): Promise<AvailabilitySlotMutationResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('update_availability_slot', {
    p_slot_id: input.slotId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_duration_minutes: input.durationMinutes,
    p_location: input.location,
    p_apply_to_series: input.applyToSeries,
  });

  if (error || !data) {
    return { ok: false, code: mapAvailabilityMutationErrorCode(error?.code) };
  }

  return { ok: true, data: data.map(mapAvailabilitySlot) };
}

export async function deleteAvailabilitySlot(
  slotId: string,
  applyToSeries: boolean
): Promise<AvailabilitySlotDeleteResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('delete_availability_slot', {
    p_slot_id: slotId,
    p_apply_to_series: applyToSeries,
  });

  if (error || typeof data !== 'number') {
    const code = mapAvailabilityMutationErrorCode(error?.code);
    return {
      ok: false,
      code:
        code === 'blocked' || code === 'forbidden' ? code : undefined,
    };
  }

  return { ok: true, deletedCount: data };
}
