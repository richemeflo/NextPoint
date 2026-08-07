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
  if (data.role === 'coach') return resolveCurrentUserAccess(data.role, null);

  const profile = await supabase
    .from('student_profiles')
    .select('account_status')
    .eq('user_id', userId)
    .maybeSingle();

  if (profile.error || !profile.data) return null;
  return resolveCurrentUserAccess(data.role, profile.data.account_status);
}
