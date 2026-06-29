import type { AppRole } from '@nextpoint/shared';
import type { Session } from '@supabase/supabase-js';

import { mapSupabaseAuthError, type AuthFailureCode } from './auth-error';

import { supabase } from '@/lib/supabase/client';

export type AuthResult =
  | { ok: true; session: Session | null }
  | { ok: false; code: AuthFailureCode };
export type SignOutScope = 'global' | 'local' | 'others';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true, session: data.session };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  role: AppRole
): Promise<AuthResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        data: { role },
      },
    });

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true, session: data.session };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function signOutSession(
  scope: SignOutScope = 'global'
): Promise<AuthResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { error } = await supabase.auth.signOut({ scope });

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true, session: null };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}
