import type {
  PricingApplicabilityContext,
  PricingDuration,
  PricingLessonType,
  PricingRateInput,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type PricingRateRow = Tables<'pricing_rates'>;

export type PricingRate = {
  id: string;
  coachId: string;
  label: string;
  amountCents: number;
  currency: 'EUR';
  durationMinutes: PricingDuration;
  lessonType: PricingLessonType;
  isActive: boolean;
  applicabilityContexts: PricingApplicabilityContext[];
  targetStudentIds: string[];
  updatedAt: string;
};

type PricingRatesResult =
  | { ok: true; data: PricingRate[] }
  | { ok: false };

type PricingRateResult =
  | { ok: true; data: PricingRate }
  | { ok: false };

function mapPricingRate(
  row: PricingRateRow,
  targetStudentIds: string[] = []
): PricingRate {
  return {
    id: row.id,
    coachId: row.coach_id,
    label: row.label,
    amountCents: row.amount_cents,
    currency: row.currency as 'EUR',
    durationMinutes: row.duration_minutes as PricingDuration,
    lessonType: row.lesson_type as PricingLessonType,
    isActive: row.is_active,
    applicabilityContexts:
      row.applicability_contexts as PricingApplicabilityContext[],
    targetStudentIds,
    updatedAt: row.updated_at,
  };
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
  return { ok: true, data: data.map((row) => mapPricingRate(row)) };
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

  return {
    ok: true,
    data: rates.data.map((row) =>
      mapPricingRate(
        row,
        targets.data
          .filter(({ pricing_rate_id }) => pricing_rate_id === row.id)
          .map(({ student_id }) => student_id)
      )
    ),
  };
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
  return { ok: true, data: mapPricingRate(data, rate.targetStudentIds) };
}

export async function deletePricingRate(rateId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.rpc('delete_pricing_rate', {
    p_rate_id: rateId,
  });

  return !error;
}
