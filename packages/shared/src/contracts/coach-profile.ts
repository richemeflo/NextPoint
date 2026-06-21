import { z } from 'zod';

import { appLanguages } from '../domain/languages';

export const coachProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'name_too_short').max(100, 'name_too_long'),
  bio: z.string().trim().min(20, 'bio_too_short').max(500, 'bio_too_long'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9 .()-]{5,29}$/, 'invalid_phone'),
  email: z.string().trim().pipe(z.email('invalid_email')),
  preferredLanguage: z.enum(appLanguages),
});

export type CoachProfileFormInput = z.infer<typeof coachProfileSchema>;

export type CoachProfileInput = {
  displayName: string;
  bio: string;
  phone: string;
  email: string;
  preferredLanguage: CoachProfileFormInput['preferredLanguage'];
};

export function toCoachProfileInput(form: CoachProfileFormInput): CoachProfileInput {
  return {
    displayName: form.displayName.trim(),
    bio: form.bio.trim(),
    phone: form.phone.trim(),
    email: form.email.trim().toLowerCase(),
    preferredLanguage: form.preferredLanguage,
  };
}
