import { isAppRole, type AppRole } from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

export async function getCurrentUserRole(userId: string): Promise<AppRole | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !isAppRole(data?.role)) return null;
  return data.role;
}
