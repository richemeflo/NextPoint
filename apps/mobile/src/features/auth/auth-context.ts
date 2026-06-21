import { createContext, useContext } from 'react';
import type { AppRole } from '@nextpoint/shared';
import type { Session, User } from '@supabase/supabase-js';

import type { AuthStatus } from './access-policy';
import type { AuthResult } from './auth-service';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, role: AppRole) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
