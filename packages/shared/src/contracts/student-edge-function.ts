import { z } from 'zod';

import { appLanguages } from '../domain/languages';
import { studentAccountStatuses } from './student-account';
import { studentSexes } from './student-profile';

const edgeFunctionErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().optional(),
});

const edgeFunctionFailureSchema = z.object({
  ok: z.literal(false),
  error: edgeFunctionErrorSchema,
});

const studentProfileRowSchema = z.object({
  user_id: z.uuid(),
  full_name: z.string(),
  email: z.string(),
  phone: z.string(),
  padel_level: z.number().int(),
  age: z.number().int(),
  sex: z.enum(studentSexes),
  preferred_language: z.enum(appLanguages),
  account_status: z.enum(studentAccountStatuses),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createManualStudentResponseSchema = z.union([
  z.object({
    ok: z.literal(true),
    data: studentProfileRowSchema,
  }),
  edgeFunctionFailureSchema,
]);

export const activateStudentAccountResponseSchema = z.union([
  z.object({
    ok: z.literal(true),
    data: z.object({ activated: z.literal(true) }),
  }),
  edgeFunctionFailureSchema,
]);

export const generateStudentActivationLinkResponseSchema = z.union([
  z.object({
    ok: z.literal(true),
    data: z.object({
      activationLink: z.url(),
      expiresAt: z.iso.datetime({ offset: true }),
    }),
  }),
  edgeFunctionFailureSchema,
]);
