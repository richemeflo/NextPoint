import type { AppRole } from '@nextpoint/shared';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'configuration-error'
  | 'access-error';

export type AuthRouteAccess = {
  allowAuthRoutes: boolean;
  allowCoachRoutes: boolean;
  allowEleveRoutes: boolean;
  isLoading: boolean;
  hasAccessError: boolean;
};

export function getAuthRouteAccess(
  status: AuthStatus,
  role: AppRole | null
): AuthRouteAccess {
  return {
    allowAuthRoutes: status === 'unauthenticated' || status === 'configuration-error',
    allowCoachRoutes: status === 'authenticated' && role === 'coach',
    allowEleveRoutes: status === 'authenticated' && role === 'eleve',
    isLoading: status === 'loading',
    hasAccessError: status === 'access-error',
  };
}
