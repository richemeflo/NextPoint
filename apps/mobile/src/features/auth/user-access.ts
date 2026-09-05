import {
  isAppRole,
  isStudentAccountStatus,
  type StudentAccountStatus,
} from '@nextpoint/shared';

export type CurrentUserAccess =
  | { role: 'coach'; accountStatus: null; hasCurrentLegalAcceptance: boolean }
  | {
      role: 'eleve';
      accountStatus: StudentAccountStatus | null;
      hasCurrentLegalAcceptance: boolean;
    };

export function resolveCurrentUserAccess(
  role: unknown,
  accountStatus: unknown,
  hasCurrentLegalAcceptance = true
): CurrentUserAccess | null {
  if (!isAppRole(role)) return null;
  if (role === 'coach') {
    return { role, accountStatus: null, hasCurrentLegalAcceptance };
  }
  if (accountStatus === null) {
    return { role, accountStatus: null, hasCurrentLegalAcceptance };
  }
  if (!isStudentAccountStatus(accountStatus)) return null;

  return { role, accountStatus, hasCurrentLegalAcceptance };
}

export function hasPrivateRouteAccess(
  access: CurrentUserAccess | null
): boolean {
  if (!access) return false;
  if (!access.hasCurrentLegalAcceptance) return false;
  if (access.role === 'coach') return true;

  return access.accountStatus === null || access.accountStatus === 'active';
}
