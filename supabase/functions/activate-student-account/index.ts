import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { sha256Hex } from '../_shared/security.ts';
import { adminClient } from '../_shared/supabase.ts';

const currentTermsVersion = '2026-08-16';
const currentPrivacyPolicyVersion = '2026-08-16';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const body = await request.json().catch(() => null);
  const token = body && typeof body.token === 'string' ? body.token.trim() : '';
  const password =
    body && typeof body.password === 'string' ? body.password : '';
  const termsVersion =
    body && typeof body.termsVersion === 'string' ? body.termsVersion : '';
  const privacyPolicyVersion =
    body && typeof body.privacyPolicyVersion === 'string'
      ? body.privacyPolicyVersion
      : '';
  const legalAcceptanceSource =
    body && typeof body.legalAcceptanceSource === 'string'
      ? body.legalAcceptanceSource
      : '';

  const isStrongPassword =
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

  if (
    !token ||
    !isStrongPassword ||
    termsVersion !== currentTermsVersion ||
    privacyPolicyVersion !== currentPrivacyPolicyVersion ||
    legalAcceptanceSource !== 'student_activation'
  ) {
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
        legal_acceptance_source: legalAcceptanceSource,
        legal_accepted_at: new Date().toISOString(),
        privacy_policy_version: privacyPolicyVersion,
        terms_version: termsVersion,
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

  const acceptanceRecorded = await adminClient
    .from('legal_acceptances')
    .upsert(
      {
        user_id: claimed.data.student_id,
        terms_version: termsVersion,
        privacy_policy_version: privacyPolicyVersion,
        source: 'student_activation',
        accepted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,terms_version,privacy_policy_version' }
    );

  if (acceptanceRecorded.error) {
    await adminClient.rpc('rollback_student_activation_claim', {
      p_token_id: claimed.data.id,
    });
    return jsonResponse({
      ok: false,
      error: { code: 'activation_failed', message: 'Legal acceptance could not be recorded' },
    });
  }

  const finalized = await adminClient.rpc('finalize_student_activation', {
    p_token_id: claimed.data.id,
    p_student_id: claimed.data.student_id,
  });

  if (finalized.error) {
    await adminClient
      .from('legal_acceptances')
      .delete()
      .eq('user_id', claimed.data.student_id)
      .eq('terms_version', termsVersion)
      .eq('privacy_policy_version', privacyPolicyVersion)
      .eq('source', 'student_activation');
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
