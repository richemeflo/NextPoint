import type { CoachStatsPeriod } from '@nextpoint/shared';

export const coachStatsPeriodOptions = [
  { period: 'month', labelKey: 'stats.period.month' },
  { period: 'quarter', labelKey: 'stats.period.quarter' },
  { period: 'year', labelKey: 'stats.period.year' },
] as const satisfies readonly {
  period: CoachStatsPeriod;
  labelKey: 'stats.period.month' | 'stats.period.quarter' | 'stats.period.year';
}[];

export function getCoachStatsStudentName(
  fullName: string | null,
  fallback: string
) {
  return fullName ?? fallback;
}
