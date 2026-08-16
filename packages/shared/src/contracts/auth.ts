import { z } from 'zod';

import { appRoles } from '../domain/roles';

const requiredString = z.string().trim().min(1, 'required');
const email = requiredString.pipe(z.email('invalid_email'));
export const strongPasswordSchema = z
  .string()
  .min(12, 'password_too_short')
  .regex(/[a-z]/, 'password_too_weak')
  .regex(/[A-Z]/, 'password_too_weak')
  .regex(/[0-9]/, 'password_too_weak');

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'required'),
});

export const passwordResetRequestSchema = z.object({ email });

export const passwordUpdateSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  });

export const signUpSchema = z
  .object({
    email,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'required'),
    role: z.enum(appRoles),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
