import { z } from 'zod';

export const coachStatsPeriods = ['month', 'quarter', 'year'] as const;

export const coachStatsPeriodSchema = z.enum(coachStatsPeriods);

export const coachStatsActiveStudentSchema = z.object({
  studentId: z.uuid(),
  fullName: z.string().trim().min(1).nullable(),
  courseCount: z.number().int().nonnegative(),
});

export const coachStatsReadModelSchema = z.object({
  periodStart: z.iso.datetime(),
  periodEnd: z.iso.datetime(),
  generatedAt: z.iso.datetime(),
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
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const startMonth = period === 'quarter' ? Math.floor(month / 3) * 3 : month;
  const startsAt =
    period === 'year' ? new Date(year, 0, 1) : new Date(year, startMonth, 1);
  const endsAt =
    period === 'month'
      ? new Date(year, month + 1, 1)
      : period === 'quarter'
        ? new Date(year, startMonth + 3, 1)
        : new Date(year + 1, 0, 1);

  return {
    period,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

export function hasCoachStatsData(stats: CoachStatsReadModel) {
  return stats.completedCourses > 0;
}
