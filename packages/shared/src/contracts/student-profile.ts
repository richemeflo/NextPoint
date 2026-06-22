import { z } from 'zod';

import { appLanguages } from '../domain/languages';

const numericString = z.string().trim().regex(/^\d+$/, 'invalid_number');

export const studentSexes = [
  'female',
  'male',
  'other',
  'not_specified',
] as const;

export type StudentSex = (typeof studentSexes)[number];

export const studentProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'name_too_short').max(100, 'name_too_long'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 .()-]{5,29}$/, 'invalid_phone'),
  email: z.string().trim().pipe(z.email('invalid_email')),
  padelLevel: numericString.refine(
    (value) => Number(value) >= 1 && Number(value) <= 10,
    'invalid_padel_level'
  ),
  age: numericString.refine(
    (value) => Number(value) >= 5 && Number(value) <= 100,
    'invalid_age'
  ),
  sex: z.enum(studentSexes),
  preferredLanguage: z.enum(appLanguages),
});

export type StudentProfileFormInput = z.infer<typeof studentProfileSchema>;

export const manualStudentProfileSchema = studentProfileSchema.pick({
  fullName: true,
  phone: true,
  email: true,
  padelLevel: true,
  age: true,
  sex: true,
});

export type ManualStudentProfileFormInput = z.infer<
  typeof manualStudentProfileSchema
>;

export type StudentProfileInput = {
  fullName: string;
  phone: string;
  email: string;
  padelLevel: number;
  age: number;
  sex: StudentSex;
  preferredLanguage: StudentProfileFormInput['preferredLanguage'];
};

export type ManualStudentProfileInput = Omit<
  StudentProfileInput,
  'preferredLanguage'
>;

export function toStudentProfileInput(
  form: StudentProfileFormInput
): StudentProfileInput {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim().toLowerCase(),
    padelLevel: Number(form.padelLevel),
    age: Number(form.age),
    sex: form.sex,
    preferredLanguage: form.preferredLanguage,
  };
}

export function toManualStudentProfileInput(
  form: ManualStudentProfileFormInput
): ManualStudentProfileInput {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim(),
    email: form.email.trim().toLowerCase(),
    padelLevel: Number(form.padelLevel),
    age: Number(form.age),
    sex: form.sex,
  };
}
