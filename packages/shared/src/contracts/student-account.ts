import { z } from 'zod';

export const studentAccountStatuses = [
  'pending_activation',
  'active',
  'suspended',
  'deleted',
] as const;

export type StudentAccountStatus = (typeof studentAccountStatuses)[number];

export function isStudentAccountStatus(
  value: unknown
): value is StudentAccountStatus {
  return (
    typeof value === 'string' &&
    studentAccountStatuses.includes(value as StudentAccountStatus)
  );
}

export const activateStudentAccountSchema = z
  .object({
    token: z.string().trim().min(1, 'required'),
    password: z.string().min(8, 'password_too_short'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  });

export type ActivateStudentAccountInput = z.infer<
  typeof activateStudentAccountSchema
>;
