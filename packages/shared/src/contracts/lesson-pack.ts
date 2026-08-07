import { z } from 'zod';

export const lessonPackStatuses = ['active', 'exhausted'] as const;
export const maximumLessonPackSessions = 100;

export type LessonPackStatus = (typeof lessonPackStatuses)[number];
export type LessonPackAdjustment = -1 | 1;

export const lessonPackSchema = z.object({
  includedSessions: z
    .string()
    .trim()
    .regex(/^\d+$/, 'invalid_session_count')
    .transform(Number)
    .refine(
      (value) =>
        Number.isInteger(value) &&
        value >= 1 &&
        value <= maximumLessonPackSessions,
      'invalid_session_count'
    ),
});

export type LessonPackFormInput = z.input<typeof lessonPackSchema>;
export type LessonPackInput = z.output<typeof lessonPackSchema>;

export function toLessonPackInput(
  input: LessonPackFormInput
): LessonPackInput {
  return lessonPackSchema.parse(input);
}
