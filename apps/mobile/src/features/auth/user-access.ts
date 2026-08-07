import {
  isAppRole,
  isStudentAccountStatus,
  type AppRole,
  type StudentAccountStatus,
} from '@nextpoint/shared';

export type CurrentUserAccess = {
  role: AppRole;
  accountStatus: StudentAccountStatus | null;
};

export function resolveCurrentUserAccess(
  role: unknown,
  accountStatus: unknown
): CurrentUserAccess | null {
  if (!isAppRole(role)) return null;
  if (role === 'coach') return { role, accountStatus: null };
  if (!isStudentAccountStatus(accountStatus)) return null;

  return { role, accountStatus };
}
