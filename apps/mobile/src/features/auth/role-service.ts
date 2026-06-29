import {
  isAppRole,
  isStudentAccountStatus,
  type AppRole,
  type StudentAccountStatus,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

export type CurrentUserAccess = {
  role: AppRole;
  accountStatus: StudentAccountStatus | null;
};

export async function getCurrentUserAccess(
  userId: string
): Promise<CurrentUserAccess | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !isAppRole(data?.role)) return null;
  if (data.role === 'coach') {
    return { role: data.role, accountStatus: null };
  }

  const profile = await supabase
    .from('student_profiles')
    .select('account_status')
    .eq('user_id', userId)
    .maybeSingle();

  if (profile.error) return null;
  const accountStatus = profile.data?.account_status ?? 'active';
  if (!isStudentAccountStatus(accountStatus)) return null;

  return { role: data.role, accountStatus };
}
