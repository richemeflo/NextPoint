import {
  isAppRole,
  isStudentAccountStatus,
  type StudentAccountStatus,
} from '@nextpoint/shared';

export type CurrentUserAccess =
  | { role: 'coach'; accountStatus: null }
  | { role: 'eleve'; accountStatus: StudentAccountStatus | null };

export function resolveCurrentUserAccess(
  role: unknown,
  accountStatus: unknown
): CurrentUserAccess | null {
  if (!isAppRole(role)) return null;
  if (role === 'coach') return { role, accountStatus: null };
  if (accountStatus === null) return { role, accountStatus: null };
  if (!isStudentAccountStatus(accountStatus)) return null;

  return { role, accountStatus };
}

export function hasPrivateRouteAccess(
  access: CurrentUserAccess | null
): boolean {
  if (!access) return false;
  if (access.role === 'coach') return true;

  return access.accountStatus === null || access.accountStatus === 'active';
}
