import type {
  AvailabilityRangeInput,
  AvailabilityRecurrenceType,
  AvailabilitySlotDuration,
  AvailabilitySlotStatus,
  Tables,
} from '@nextpoint/shared';

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
  rangeId: string;
  coachId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: AvailabilitySlotDuration;
  location: string;
  status: AvailabilitySlotStatus;
  updatedAt: string;
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
    rangeId: row.availability_range_id,
    coachId: row.coach_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: row.duration_minutes as AvailabilitySlotDuration,
    location: row.location,
    status: row.status,
    updatedAt: row.updated_at,
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
    const code =
      error?.code === '23P01'
        ? 'conflict'
        : error?.code === '42501'
          ? 'forbidden'
          : error?.code === '23514' || error?.code === '22023'
            ? 'invalid'
            : undefined;
    return { ok: false, code };
  }

  return { ok: true, data: mapAvailabilityRange(data) };
}
