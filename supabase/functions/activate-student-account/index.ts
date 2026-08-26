import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { sha256Hex } from '../_shared/security.ts';
import { adminClient } from '../_shared/supabase.ts';

const currentTermsVersion = '2026-08-19';
const currentPrivacyPolicyVersion = '2026-08-19';
const internalActivationEmailSuffix = '@activation.equationpadel.invalid';

async function rollbackClaim(tokenId: string) {
  await adminClient.rpc('rollback_student_activation_claim', {
    p_token_id: tokenId,
  });
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const body = await request.json().catch(() => null);
  const token = body && typeof body.token === 'string' ? body.token.trim() : '';
  const password =
    body && typeof body.password === 'string' ? body.password : '';
  const email =
    body && typeof body.email === 'string'
      ? body.email.trim().toLowerCase()
      : '';
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
    (email !== '' &&
      (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
        email.endsWith(internalActivationEmailSuffix))) ||
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

  const [profile, authUser] = await Promise.all([
    adminClient
      .from('student_profiles')
      .select('email')
      .eq('user_id', claimed.data.student_id)
      .single(),
    adminClient.auth.admin.getUserById(claimed.data.student_id),
  ]);

  if (profile.error || authUser.error || !authUser.data.user) {
    await rollbackClaim(claimed.data.id);
    return jsonResponse({
      ok: false,
      error: { code: 'activation_failed', message: 'Student account not found' },
    });
  }

  const existingEmail = profile.data.email.trim().toLowerCase();
  const activationEmail = existingEmail || email;
  if (!activationEmail) {
    await rollbackClaim(claimed.data.id);
    return jsonResponse({
      ok: false,
      error: {
        code: 'email_required',
        message: 'A login email is required to activate this account',
      },
    });
  }

  if (!existingEmail) {
    const duplicateEmail = await adminClient
      .from('student_profiles')
      .select('user_id')
      .eq('email', activationEmail)
      .neq('user_id', claimed.data.student_id)
      .limit(1);

    if (duplicateEmail.error) {
      await rollbackClaim(claimed.data.id);
      return jsonResponse({
        ok: false,
        error: {
          code: 'activation_failed',
          message: 'Email could not be validated',
        },
      });
    }
    if (duplicateEmail.data.length > 0) {
      await rollbackClaim(claimed.data.id);
      return jsonResponse({
        ok: false,
        error: { code: 'email_in_use', message: 'Email is already in use' },
      });
    }
  }

  const passwordUpdated = await adminClient.auth.admin.updateUserById(
    claimed.data.student_id,
    {
      email: activationEmail,
      password,
      email_confirm: true,
      user_metadata: {
        ...authUser.data.user.user_metadata,
        role: 'eleve',
        provisioned_by_coach: false,
        contact_email_missing: false,
        legal_acceptance_source: legalAcceptanceSource,
        legal_accepted_at: new Date().toISOString(),
        privacy_policy_version: privacyPolicyVersion,
        terms_version: termsVersion,
      },
    }
  );

  if (passwordUpdated.error) {
    await rollbackClaim(claimed.data.id);
    return jsonResponse({
      ok: false,
      error: {
        code:
          passwordUpdated.error.code === 'email_exists' ||
          passwordUpdated.error.code === 'user_already_exists'
            ? 'email_in_use'
            : 'password_update_failed',
        message: 'Account credentials could not be updated',
      },
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
    await rollbackClaim(claimed.data.id);
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
    await rollbackClaim(claimed.data.id);
    return jsonResponse({
      ok: false,
      error: { code: 'activation_failed', message: 'Activation failed' },
    });
  }

  return jsonResponse({
    ok: true,
    data: { activated: true, email: activationEmail },
  });
});
