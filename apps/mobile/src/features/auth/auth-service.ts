import type { AppRole } from '@nextpoint/shared';
import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { mapSupabaseAuthError, type AuthFailureCode } from './auth-error';
import {
  getPasswordAttemptBlockRemainingMs,
  recordFailedPasswordAttempt,
  resetFailedPasswordAttempts,
} from './password-attempt-lockout';
import {
  parsePasswordRecoveryUrl,
  type PasswordRecoveryUrlPolicy,
} from './password-recovery';
import {
  getGoogleOAuthRedirectUrl,
} from './google-oauth';
import { getOAuthCode } from './oauth-callback';

import {
  privacyPolicyVersion,
  termsVersion,
} from '@/features/legal/legal-config';
import { supabase } from '@/lib/supabase/client';

WebBrowser.maybeCompleteAuthSession();

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

let signInQueue = Promise.resolve();

function serializeSignIn<T>(operation: () => Promise<T>) {
  const result = signInQueue.then(operation, operation);
  signInQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

async function getLocalPasswordBlockRemainingMs() {
  try {
    return await getPasswordAttemptBlockRemainingMs(AsyncStorage);
  } catch {
    return 0;
  }
}

async function recordLocalPasswordFailure() {
  try {
    return await recordFailedPasswordAttempt(AsyncStorage);
  } catch {
    return 0;
  }
}

async function clearLocalPasswordFailures() {
  try {
    await resetFailedPasswordAttempts(AsyncStorage);
  } catch {
    // Local throttling must not invalidate a successful server authentication.
  }
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
  const authClient = supabase;

  return serializeSignIn(async () => {
    try {
      if ((await getLocalPasswordBlockRemainingMs()) > 0) {
        return { ok: false, code: 'rate_limited' };
      }

      const { data, error } = await authClient.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) {
        const code = mapSupabaseAuthError(error);
        if (code === 'invalid_credentials') {
          const lockDurationMs = await recordLocalPasswordFailure();
          if (lockDurationMs > 0) return { ok: false, code: 'rate_limited' };
        }
        return { ok: false, code };
      }

      await clearLocalPasswordFailures();
      return { ok: true, session: data.session };
    } catch {
      return { ok: false, code: 'network_error' };
    }
  });
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
        data: {
          role,
          legal_acceptance_source: 'signup',
          legal_accepted_at: new Date().toISOString(),
          privacy_policy_version: privacyPolicyVersion,
          terms_version: termsVersion,
        },
      },
    });

    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true, session: data.session };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const redirectTo = getGoogleOAuthRedirectUrl();

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error || !data.url) {
      return { ok: false, code: mapSupabaseAuthError(error) };
    }

    if (Platform.OS === 'web') {
      globalThis.location.assign(data.url);
      return { ok: true, session: null };
    }

    const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (browserResult.type !== 'success') {
      return { ok: false, code: 'oauth_cancelled' };
    }

    const code = getOAuthCode(browserResult.url, redirectTo);
    if (!code) return { ok: false, code: 'unknown' };

    const { data: sessionData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return { ok: false, code: mapSupabaseAuthError(exchangeError) };
    }

    return { ok: true, session: sessionData.session };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function exchangeGoogleOAuthCode(
  callbackUrl: string
): Promise<AuthResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const code = getOAuthCode(callbackUrl, getGoogleOAuthRedirectUrl());
  if (!code) return { ok: false, code: 'unknown' };

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, code: mapSupabaseAuthError(error) };
    return { ok: true, session: data.session };
  } catch {
    return { ok: false, code: 'network_error' };
  }
}

export async function acceptCurrentLegalTerms(): Promise<AuthOperationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { error } = await supabase.rpc('record_current_legal_acceptance');
    if (error) return { ok: false, code: 'unknown' };
    return { ok: true };
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
  url: string,
  policy: PasswordRecoveryUrlPolicy
): Promise<AuthOperationResult> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  const code = parsePasswordRecoveryUrl(url, policy);
  if (!code) return { ok: false, code: 'unknown' };

  let isPasswordRecovery = false;
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') isPasswordRecovery = true;
  });

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { ok: false, code: mapSupabaseAuthError(error) };

    if (data.session && isPasswordRecovery) return { ok: true };

    await supabase.auth.signOut({ scope: 'local' });
    return { ok: false, code: 'unknown' };
  } catch {
    return { ok: false, code: 'network_error' };
  } finally {
    subscription.unsubscribe();
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
