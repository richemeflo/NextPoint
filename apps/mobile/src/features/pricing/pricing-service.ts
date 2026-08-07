import {
  pricingRateReadModelSchema,
  type PricingRateInput,
  type PricingRateReadModel,
  type Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type PricingRateRow = Tables<'pricing_rates'>;

export type PricingRate = PricingRateReadModel;

type PricingRatesResult =
  | { ok: true; data: PricingRate[] }
  | { ok: false };

type PricingRateResult =
  | { ok: true; data: PricingRate }
  | { ok: false };

function parsePricingRate(
  row: PricingRateRow,
  targetStudentIds: string[] = []
): PricingRate | null {
  const parsed = pricingRateReadModelSchema.safeParse({
    id: row.id,
    coachId: row.coach_id,
    label: row.label,
    amountCents: row.amount_cents,
    currency: row.currency,
    durationMinutes: row.duration_minutes,
    lessonType: row.lesson_type,
    isActive: row.is_active,
    applicabilityContexts: row.applicability_contexts,
    targetStudentIds,
    updatedAt: row.updated_at,
  });

  return parsed.success ? parsed.data : null;
}

function parsePricingRates(
  rows: PricingRateRow[],
  getTargetStudentIds: (row: PricingRateRow) => string[] = () => []
): PricingRate[] | null {
  const parsedRates: PricingRate[] = [];

  for (const row of rows) {
    const parsedRate = parsePricingRate(row, getTargetStudentIds(row));
    if (!parsedRate) return null;
    parsedRates.push(parsedRate);
  }

  return parsedRates;
}

export async function getPublishedPricingRates(): Promise<PricingRatesResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('pricing_rates')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('lesson_type')
    .order('duration_minutes');

  if (error) return { ok: false };
  const parsedRates = parsePricingRates(data);
  return parsedRates ? { ok: true, data: parsedRates } : { ok: false };
}

export async function getCoachPricingRates(
  coachId: string
): Promise<PricingRatesResult> {
  if (!supabase) return { ok: false };

  const rates = await supabase
    .from('pricing_rates')
    .select('*')
    .eq('coach_id', coachId)
    .is('deleted_at', null)
    .order('created_at');

  if (rates.error) return { ok: false };
  if (rates.data.length === 0) return { ok: true, data: [] };

  const targets = await supabase
    .from('pricing_rate_students')
    .select('pricing_rate_id, student_id')
    .in(
      'pricing_rate_id',
      rates.data.map(({ id }) => id)
    );

  if (targets.error) return { ok: false };

  const parsedRates = parsePricingRates(
    rates.data,
    (row) =>
      targets.data
        .filter(({ pricing_rate_id }) => pricing_rate_id === row.id)
        .map(({ student_id }) => student_id)
  );

  return parsedRates ? { ok: true, data: parsedRates } : { ok: false };
}

export async function savePricingRate(
  rateId: string | null,
  rate: PricingRateInput
): Promise<PricingRateResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('save_pricing_rate', {
    p_rate_id: rateId as string,
    p_label: rate.label,
    p_amount_cents: rate.amountCents,
    p_currency: rate.currency,
    p_duration_minutes: rate.durationMinutes,
    p_lesson_type: rate.lessonType,
    p_is_active: rate.isActive,
    p_applicability_contexts: rate.applicabilityContexts,
    p_target_student_ids: rate.targetStudentIds,
  });

  if (error || !data) return { ok: false };
  const parsedRate = parsePricingRate(data, rate.targetStudentIds);
  return parsedRate ? { ok: true, data: parsedRate } : { ok: false };
}

export async function deletePricingRate(rateId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.rpc('delete_pricing_rate', {
    p_rate_id: rateId,
  });

  return !error;
}
