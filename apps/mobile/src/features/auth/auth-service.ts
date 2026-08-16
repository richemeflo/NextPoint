import type { AppRole } from '@nextpoint/shared';
import type { Session } from '@supabase/supabase-js';

import { mapSupabaseAuthError, type AuthFailureCode } from './auth-error';
import { parsePasswordRecoveryUrl } from './password-recovery';

import { supabase } from '@/lib/supabase/client';

export type AuthResult =
  | { ok: true; session: Session | null }
  | { ok: false; code: AuthFailureCode };
export type SignOutScope = 'global' | 'local' | 'others';
export type AuthOperationResult =
  | { ok: true }
  | { ok: false; code: AuthFailureCode };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isCoachRegistrationOpen(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.rpc('is_coach_registration_open');
    return !error && data === true;
  } catch {
    return false;
  }
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

export async function requestPasswordReset(
  email: string,
  redirectTo: string
): Promise<AuthOperationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizeEmail(email),
      { redirectTo }
    );

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function establishPasswordRecoverySession(
  url: string
): Promise<AuthOperationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const credentials = parsePasswordRecoveryUrl(url);
  if (!credentials) return { ok: false, code: 'unknown' };

  try {
    const { error } =
      credentials.kind === 'code'
        ? await supabase.auth.exchangeCodeForSession(credentials.code)
        : await supabase.auth.setSession({
            access_token: credentials.accessToken,
            refresh_token: credentials.refreshToken,
          });

    if (!error) return { ok: true };

    const { data } = await supabase.auth.getSession();
    if (data.session) return { ok: true };

    return { ok: false, code: mapSupabaseAuthError(error) };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function updatePassword(
  password: string
): Promise<AuthOperationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true };
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
