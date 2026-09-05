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

async function secretsMatch(actual: string | null, expected: string | undefined) {
  if (!actual || !expected) return false;

  const encoder = new TextEncoder();
  const [actualDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(actual)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;

  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}

export async function isServiceRoleRequest(request: Request) {
  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? request.headers.get('apikey');
  return secretsMatch(token ?? null, serviceRoleKey);
}

export async function isApiKeyRequest(request: Request, expectedSecret: string | undefined) {
  return secretsMatch(request.headers.get('apikey'), expectedSecret);
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
