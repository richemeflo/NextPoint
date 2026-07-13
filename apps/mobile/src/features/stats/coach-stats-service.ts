import {
  coachStatsReadModelSchema,
  getCoachStatsPeriodRange,
  type CoachStatsPeriod,
  type CoachStatsReadModel,
} from '@nextpoint/shared';

import { normalizeCoachStatsError, type CoachStatsError } from './coach-stats-error';

import { supabase } from '@/lib/supabase/client';

export type CoachStatsResult =
  | { ok: true; data: CoachStatsReadModel }
  | { ok: false; error: CoachStatsError };

export async function getCoachStats(
  period: CoachStatsPeriod = 'month'
): Promise<CoachStatsResult> {
  if (!supabase) return { ok: false, error: 'unavailable' };

  const range = getCoachStatsPeriodRange(period);
  const { data, error } = await supabase.rpc('get_coach_stats', {
    p_period_start: range.startsAt,
    p_period_end: range.endsAt,
  });

  if (error) {
    return { ok: false, error: normalizeCoachStatsError(error.code) };
  }

  const row = data?.[0];
  if (!row) return { ok: false, error: 'invalid_response' };

  const parsed = coachStatsReadModelSchema.safeParse({
    periodStart: row.period_start,
    periodEnd: row.period_end,
    generatedAt: row.generated_at,
    completedCourses: row.completed_courses,
    completedMinutes: row.completed_minutes,
    estimatedRevenueCents: row.estimated_revenue_cents,
    currency: row.currency,
    activeStudents: row.active_students,
  });

  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: 'invalid_response' };
}
