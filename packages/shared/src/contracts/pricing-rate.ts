import { z } from 'zod';

export const pricingLessonTypes = ['individual', 'group'] as const;
export const pricingDurations = [60, 90] as const;
export const pricingApplicabilityContexts = [
  'student',
  'senior',
  'weekend',
  'public_holiday',
] as const;

const amountEurosSchema = z
  .string()
  .trim()
  .regex(/^\d{1,5}([.,]\d{1,2})?$/, 'invalid_amount')
  .refine((value) => Number(value.replace(',', '.')) > 0, 'invalid_amount');

export const pricingRateSchema = z.object({
  label: z.string().trim().min(2, 'label_too_short').max(100, 'label_too_long'),
  amountEuros: amountEurosSchema,
  durationMinutes: z.enum(['60', '90']),
  lessonType: z.enum(pricingLessonTypes),
  isActive: z.boolean(),
  applicabilityContexts: z.array(z.enum(pricingApplicabilityContexts)),
  targetStudentIds: z.array(z.uuid('invalid_student')),
});

export type PricingLessonType = (typeof pricingLessonTypes)[number];
export type PricingDuration = (typeof pricingDurations)[number];
export type PricingApplicabilityContext =
  (typeof pricingApplicabilityContexts)[number];
export type PricingRateFormInput = z.infer<typeof pricingRateSchema>;

export type PricingRateInput = {
  label: string;
  amountCents: number;
  currency: 'EUR';
  durationMinutes: PricingDuration;
  lessonType: PricingLessonType;
  isActive: boolean;
  applicabilityContexts: PricingApplicabilityContext[];
  targetStudentIds: string[];
};

export type PricingRateCandidate = PricingRateInput & {
  id: string;
};

export type PricingSelectionContext = {
  lessonType: PricingLessonType;
  durationMinutes: PricingDuration;
  studentId?: string;
  isStudent?: boolean;
  isSenior?: boolean;
  isWeekend?: boolean;
  isPublicHoliday?: boolean;
};

export function toPricingRateInput(
  form: PricingRateFormInput
): PricingRateInput {
  return {
    label: form.label.trim(),
    amountCents: Math.round(Number(form.amountEuros.replace(',', '.')) * 100),
    currency: 'EUR',
    durationMinutes: Number(form.durationMinutes) as PricingDuration,
    lessonType: form.lessonType,
    isActive: form.isActive,
    applicabilityContexts: form.applicabilityContexts,
    targetStudentIds: form.targetStudentIds,
  };
}

export function selectApplicablePricingRate(
  rates: PricingRateCandidate[],
  context: PricingSelectionContext
): PricingRateCandidate | null {
  const contextMatches: Record<PricingApplicabilityContext, boolean> = {
    student: context.isStudent ?? false,
    senior: context.isSenior ?? false,
    weekend: context.isWeekend ?? false,
    public_holiday: context.isPublicHoliday ?? false,
  };

  const candidates = rates
    .filter(
      (rate) =>
        rate.isActive &&
        rate.lessonType === context.lessonType &&
        rate.durationMinutes === context.durationMinutes &&
        rate.applicabilityContexts.every((criterion) => contextMatches[criterion]) &&
        (rate.targetStudentIds.length === 0 ||
          (!!context.studentId && rate.targetStudentIds.includes(context.studentId)))
    )
    .map((rate, index) => ({
      rate,
      index,
      specificity:
        rate.applicabilityContexts.length +
        (rate.targetStudentIds.length > 0 ? 10 : 0),
    }))
    .sort(
      (left, right) =>
        right.specificity - left.specificity || left.index - right.index
    );

  return candidates[0]?.rate ?? null;
}
