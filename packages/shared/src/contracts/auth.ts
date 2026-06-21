import { z } from 'zod';

const requiredString = z.string().trim().min(1, 'required');
const email = requiredString.pipe(z.email('invalid_email'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'required'),
});

export const signUpSchema = z
  .object({
    email,
    password: z.string().min(8, 'password_too_short'),
    confirmPassword: z.string().min(1, 'required'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'password_mismatch',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
