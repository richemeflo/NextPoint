import type { ActivateStudentAccountInput } from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

export type StudentActivationFailureCode =
  | 'invalid_activation'
  | 'password_update_failed'
  | 'activation_failed'
  | 'configuration_error';

export type StudentActivationResult =
  | { ok: true }
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

export async function activateStudentAccount(
  input: Pick<ActivateStudentAccountInput, 'token' | 'password'>
): Promise<StudentActivationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const { data, error } = await supabase.functions.invoke(
    'activate-student-account',
    { body: input }
  );

  if (error || !data?.ok) {
    return {
      ok: false,
      code:
        data?.error?.code === 'password_update_failed' ||
        data?.error?.code === 'activation_failed'
          ? data.error.code
          : 'invalid_activation',
    };
  }

  return { ok: true };
}

export async function generateStudentActivationLink(
  studentId: string
): Promise<GenerateStudentActivationLinkResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const { data, error } = await supabase.functions.invoke(
    'generate-student-activation-link',
    { body: { studentId } }
  );

  if (error || !data?.ok || !data.data) {
    return {
      ok: false,
      code:
        data?.error?.code === 'unauthorized'
          ? 'unauthorized'
          : data?.error?.code === 'account_not_activatable'
            ? 'account_not_activatable'
            : 'configuration_error',
    };
  }

  return {
    ok: true,
    data: {
      activationLink: data.data.activationLink,
      expiresAt: data.data.expiresAt,
    },
  };
}
