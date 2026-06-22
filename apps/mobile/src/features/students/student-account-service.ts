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
