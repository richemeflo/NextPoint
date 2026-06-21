import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';

import { AuthContext } from './auth-context';
import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from './auth-service';
import type { AuthStatus } from './access-policy';

import { supabase } from '@/lib/supabase/client';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    supabase ? 'loading' : 'configuration-error'
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      setSession(error ? null : data.session);
      setStatus(data.session && !error ? 'authenticated' : 'unauthenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
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
      status,
      signIn: signInWithPassword,
      signUp: signUpWithPassword,
      signOut: signOutSession,
    }),
    [session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
