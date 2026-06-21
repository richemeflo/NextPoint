import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { AppRole } from '@nextpoint/shared';
import type { Session } from '@supabase/supabase-js';

import { AuthContext } from './auth-context';
import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from './auth-service';
import type { AuthStatus } from './access-policy';
import { getCurrentUserRole } from './role-service';

import { supabase } from '@/lib/supabase/client';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    supabase ? 'loading' : 'configuration-error'
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    const applySession = async (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      setRole(null);

      if (!nextSession) {
        setStatus('unauthenticated');
        return;
      }

      setStatus('loading');
      const nextRole = await getCurrentUserRole(nextSession.user.id);

      if (!active) return;

      setRole(nextRole);
      setStatus(nextRole ? 'authenticated' : 'access-error');
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      void applySession(error ? null : data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      role,
      status,
      signIn: signInWithPassword,
      signUp: signUpWithPassword,
      signOut: signOutSession,
    }),
    [role, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
