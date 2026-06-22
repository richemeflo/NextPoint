import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase server environment is not configured');
}

export const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function getRequestUser(request: Request) {
  const authorization = request.headers.get('Authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data, error } = await adminClient.auth.getUser(token);
  return error ? null : data.user;
}

export async function isCoach(userId: string) {
  const { data, error } = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('role', 'coach')
    .maybeSingle();

  return !error && Boolean(data);
}
