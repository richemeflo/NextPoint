import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { adminClient, isServiceRoleRequest } from '../_shared/supabase.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: { code: 'method_not_allowed' } }, 405);
  }

  if (!(await isServiceRoleRequest(request))) {
    return jsonResponse({ ok: false, error: { code: 'unauthorized' } }, 401);
  }

  const { data, error } = await adminClient.rpc('purge_expired_personal_data');
  if (error) {
    return jsonResponse({ ok: false, error: { code: 'purge_failed' } }, 500);
  }

  return jsonResponse({ ok: true, data });
});
