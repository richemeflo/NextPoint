import {
  activateStudentAccountResponseSchema,
  deletePendingStudentResponseSchema,
  generateStudentActivationLinkResponseSchema,
  type ActivateStudentAccountInput,
} from '@nextpoint/shared';

import {
  privacyPolicyVersion,
  termsVersion,
} from '@/features/legal/legal-config';
import { supabase } from '@/lib/supabase/client';

export type StudentActivationFailureCode =
  | 'invalid_activation'
  | 'email_required'
  | 'email_in_use'
  | 'password_update_failed'
  | 'activation_failed'
  | 'configuration_error';

export type StudentActivationResult =
  | { ok: true; loginEmail: string }
  | { ok: false; code: StudentActivationFailureCode };

export type GeneratedStudentActivationLink = {
  activationLink: string;
  expiresAt: string;
};

export type GenerateStudentActivationLinkResult =
  | { ok: true; data: GeneratedStudentActivationLink }
  | {
      ok: false;
      code:
        | 'account_not_activatable'
        | 'unauthorized'
        | 'configuration_error';
    };

export type DeletePendingStudentResult =
  | { ok: true }
  | {
      ok: false;
      code:
        | 'account_not_deletable'
        | 'unauthorized'
        | 'configuration_error';
    };

export async function activateStudentAccount(
  input: Pick<ActivateStudentAccountInput, 'token' | 'email' | 'password'>
): Promise<StudentActivationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const { data, error } = await supabase.functions.invoke(
    'activate-student-account',
    {
      body: {
        ...input,
        legalAcceptanceSource: 'student_activation',
        privacyPolicyVersion,
        termsVersion,
      },
    }
  );
  const parsed = activateStudentAccountResponseSchema.safeParse(data as unknown);

  if (error || !parsed.success) {
    return { ok: false, code: 'invalid_activation' };
  }
  if (!parsed.data.ok) {
    return {
      ok: false,
      code:
        parsed.data.error.code === 'email_required' ||
        parsed.data.error.code === 'email_in_use' ||
        parsed.data.error.code === 'password_update_failed' ||
        parsed.data.error.code === 'activation_failed'
          ? parsed.data.error.code
          : 'invalid_activation',
    };
  }

  return { ok: true, loginEmail: parsed.data.data.email };
}

export async function generateStudentActivationLink(
  studentId: string
): Promise<GenerateStudentActivationLinkResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const { data, error } = await supabase.functions.invoke(
    'generate-student-activation-link',
    { body: { studentId } }
  );
  const parsed = generateStudentActivationLinkResponseSchema.safeParse(
    data as unknown
  );

  if (error || !parsed.success) {
    return { ok: false, code: 'configuration_error' };
  }
  if (!parsed.data.ok) {
    return {
      ok: false,
      code:
        parsed.data.error.code === 'unauthorized'
          ? 'unauthorized'
          : parsed.data.error.code === 'account_not_activatable'
            ? 'account_not_activatable'
            : 'configuration_error',
    };
  }

  return {
    ok: true,
    data: {
      activationLink: parsed.data.data.activationLink,
      expiresAt: parsed.data.data.expiresAt,
    },
  };
}

export async function deletePendingStudent(
  studentId: string
): Promise<DeletePendingStudentResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const { data, error } = await supabase.functions.invoke(
    'delete-pending-student',
    { body: { studentId } }
  );
  const parsed = deletePendingStudentResponseSchema.safeParse(data as unknown);

  if (error || !parsed.success) {
    return { ok: false, code: 'configuration_error' };
  }
  if (!parsed.data.ok) {
    return {
      ok: false,
      code:
        parsed.data.error.code === 'unauthorized'
          ? 'unauthorized'
          : parsed.data.error.code === 'account_not_deletable'
            ? 'account_not_deletable'
            : 'configuration_error',
    };
  }

  return { ok: true };
}
