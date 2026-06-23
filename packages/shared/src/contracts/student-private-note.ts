import { z } from 'zod';

export const studentPrivateNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'note_required')
    .max(2000, 'note_too_long'),
});

export type StudentPrivateNoteFormInput = z.input<
  typeof studentPrivateNoteSchema
>;

export type StudentPrivateNoteInput = z.output<
  typeof studentPrivateNoteSchema
>;

export function toStudentPrivateNoteInput(
  input: StudentPrivateNoteFormInput
): StudentPrivateNoteInput {
  return studentPrivateNoteSchema.parse(input);
}
