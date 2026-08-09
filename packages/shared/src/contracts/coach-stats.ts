import { z } from 'zod';

import {
  getSchedulingDateKey,
  schedulingLocalDateTimeToIso,
} from '../domain/scheduling-time';

export const coachStatsPeriods = ['month', 'quarter', 'year'] as const;

export const coachStatsPeriodSchema = z.enum(coachStatsPeriods);

export const coachStatsActiveStudentSchema = z.object({
  studentId: z.uuid(),
  fullName: z.string().trim().min(1).nullable(),
  courseCount: z.number().int().nonnegative(),
});

export const coachStatsReadModelSchema = z.object({
  periodStart: z.iso.datetime({ offset: true }),
  periodEnd: z.iso.datetime({ offset: true }),
  generatedAt: z.iso.datetime({ offset: true }),
  completedCourses: z.number().int().nonnegative(),
  completedMinutes: z.number().int().nonnegative(),
  estimatedRevenueCents: z.number().int().nonnegative(),
  currency: z.literal('EUR'),
  activeStudents: z.array(coachStatsActiveStudentSchema).max(5),
});

export type CoachStatsPeriod = z.infer<typeof coachStatsPeriodSchema>;
export type CoachStatsActiveStudent = z.infer<typeof coachStatsActiveStudentSchema>;
export type CoachStatsReadModel = z.infer<typeof coachStatsReadModelSchema>;

export function getCoachStatsPeriodRange(
  period: CoachStatsPeriod = 'month',
  referenceDate = new Date()
) {
  const [year, calendarMonth] = getSchedulingDateKey(referenceDate)
    .split('-')
    .map(Number);
  const month = calendarMonth - 1;
  const startMonth = period === 'quarter' ? Math.floor(month / 3) * 3 : month;
  const start =
    period === 'year'
      ? new Date(Date.UTC(year, 0, 1))
      : new Date(Date.UTC(year, startMonth, 1));
  const end =
    period === 'month'
      ? new Date(Date.UTC(year, month + 1, 1))
      : period === 'quarter'
        ? new Date(Date.UTC(year, startMonth + 3, 1))
        : new Date(Date.UTC(year + 1, 0, 1));
  const formatDate = (date: Date) =>
    [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-');
  const startsAt = schedulingLocalDateTimeToIso(formatDate(start), '00:00');
  const endsAt = schedulingLocalDateTimeToIso(formatDate(end), '00:00');

  if (!startsAt || !endsAt) {
    throw new RangeError('Invalid Europe/Paris stats period');
  }

  return {
    period,
    startsAt,
    endsAt,
  };
}

export function hasCoachStatsData(stats: CoachStatsReadModel) {
  return stats.completedCourses > 0;
}
