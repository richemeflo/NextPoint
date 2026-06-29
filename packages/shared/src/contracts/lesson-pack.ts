import { z } from 'zod';

export const lessonPackStatuses = ['active', 'exhausted'] as const;

export type LessonPackStatus = (typeof lessonPackStatuses)[number];

export const lessonPackSchema = z.object({
  includedSessions: z
    .string()
    .trim()
    .regex(/^\d+$/, 'invalid_session_count')
    .transform(Number)
    .refine(
      (value) => Number.isInteger(value) && value >= 1 && value <= 100,
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
