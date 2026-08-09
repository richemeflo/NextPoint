import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { AppRole, StudentAccountStatus } from '@nextpoint/shared';
import type { Session } from '@supabase/supabase-js';

import { AuthContext } from './auth-context';
import { createAuthSessionTransitionGuard } from './auth-session-transition';
import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from './auth-service';
import type { AuthStatus } from './access-policy';
import { getCurrentUserAccess } from './role-service';
import { hasPrivateRouteAccess } from './user-access';

import { supabase } from '@/lib/supabase/client';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [accountStatus, setAccountStatus] =
    useState<StudentAccountStatus | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    supabase ? 'loading' : 'configuration-error'
  );

  useEffect(() => {
    if (!supabase) return;

    const transitionGuard = createAuthSessionTransitionGuard();

    const applySession = async (nextSession: Session | null) => {
      const transitionVersion = transitionGuard.begin();
      if (!transitionGuard.isCurrent(transitionVersion)) return;

      setSession(nextSession);
      setRole(null);
      setAccountStatus(null);

      if (!nextSession) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('loading');

      try {
        const access = await getCurrentUserAccess(nextSession.user.id);
        if (!transitionGuard.isCurrent(transitionVersion)) return;

        setRole(access?.role ?? null);
        setAccountStatus(access?.accountStatus ?? null);
        setStatus(
          hasPrivateRouteAccess(access) ? 'authenticated' : 'access-error'
        );
      } catch {
        if (!transitionGuard.isCurrent(transitionVersion)) return;
        setRole(null);
        setAccountStatus(null);
        setStatus('access-error');
      }
    };

    const initialSessionVersion = transitionGuard.begin();
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!transitionGuard.isCurrent(initialSessionVersion)) return;
        return applySession(error ? null : data.session);
      })
      .catch(() => {
        if (!transitionGuard.isCurrent(initialSessionVersion)) return;
        setSession(null);
        setRole(null);
        setAccountStatus(null);
        setStatus('access-error');
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      transitionGuard.deactivate();
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      accountStatus,
      status,
      signIn: signInWithPassword,
      signUp: signUpWithPassword,
      signOut: signOutSession,
    }),
    [accountStatus, role, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
