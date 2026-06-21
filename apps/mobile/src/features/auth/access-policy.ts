export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'configuration-error';

export type AuthRouteAccess = {
  allowAuthRoutes: boolean;
  allowAppRoutes: boolean;
  isLoading: boolean;
};

export function getAuthRouteAccess(status: AuthStatus): AuthRouteAccess {
  return {
    allowAuthRoutes: status === 'unauthenticated' || status === 'configuration-error',
    allowAppRoutes: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
