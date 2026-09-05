import {
  isAppRole,
} from '@nextpoint/shared';

import {
  resolveCurrentUserAccess,
  type CurrentUserAccess,
} from './user-access';

import { supabase } from '@/lib/supabase/client';

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
  const legalAcceptance = await supabase.rpc('has_current_legal_acceptance');
  if (legalAcceptance.error || typeof legalAcceptance.data !== 'boolean') {
    return null;
  }
  if (data.role === 'coach') {
    return resolveCurrentUserAccess(data.role, null, legalAcceptance.data);
  }

  const profileStatus = await supabase.rpc(
    'get_current_student_account_status'
  );

  if (profileStatus.error) return null;
  return resolveCurrentUserAccess(
    data.role,
    profileStatus.data,
    legalAcceptance.data
  );
}
