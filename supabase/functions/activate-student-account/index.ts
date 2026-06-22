import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { sha256Hex } from '../_shared/security.ts';
import { adminClient } from '../_shared/supabase.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const body = await request.json().catch(() => null);
  const token = body && typeof body.token === 'string' ? body.token.trim() : '';
  const password =
    body && typeof body.password === 'string' ? body.password : '';

  if (!token || password.length < 8) {
    return jsonResponse({
      ok: false,
      error: { code: 'invalid_activation', message: 'Invalid activation data' },
    });
  }

  const tokenHash = await sha256Hex(token);
  const claimed = await adminClient.rpc('claim_student_activation_token', {
    p_token_hash: tokenHash,
  });

  if (claimed.error || !claimed.data) {
    return jsonResponse({
      ok: false,
      error: { code: 'invalid_activation', message: 'Activation link is invalid' },
    });
  }

  const passwordUpdated = await adminClient.auth.admin.updateUserById(
    claimed.data.student_id,
    {
      password,
      email_confirm: true,
      user_metadata: {
        role: 'eleve',
        provisioned_by_coach: false,
      },
    }
  );

  if (passwordUpdated.error) {
    await adminClient.rpc('rollback_student_activation_claim', {
      p_token_id: claimed.data.id,
    });
    return jsonResponse({
      ok: false,
      error: { code: 'password_update_failed', message: 'Password update failed' },
    });
  }

  const finalized = await adminClient.rpc('finalize_student_activation', {
    p_token_id: claimed.data.id,
    p_student_id: claimed.data.student_id,
  });

  if (finalized.error) {
    await adminClient.rpc('rollback_student_activation_claim', {
      p_token_id: claimed.data.id,
    });
    return jsonResponse({
      ok: false,
      error: { code: 'activation_failed', message: 'Activation failed' },
    });
  }

  return jsonResponse({ ok: true, data: { activated: true } });
});
