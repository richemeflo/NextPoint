import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { randomToken, sha256Hex } from '../_shared/security.ts';
import {
  adminClient,
  getRequestUser,
  isCoach,
} from '../_shared/supabase.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const coach = await getRequestUser(request);
  if (!coach || !(await isCoach(coach.id))) {
    return jsonResponse({
      ok: false,
      error: { code: 'unauthorized', message: 'Coach role required' },
    });
  }

  const body = await request.json().catch(() => null);
  const studentId =
    body && typeof body.studentId === 'string' ? body.studentId : '';
  if (!studentId) {
    return jsonResponse({
      ok: false,
      error: { code: 'invalid_student', message: 'Student is required' },
    });
  }

  const token = randomToken();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
  const created = await adminClient.rpc('create_student_activation_token', {
    p_coach_id: coach.id,
    p_student_id: studentId,
    p_token_hash: tokenHash,
    p_expires_at: expiresAt,
  });

  if (created.error || !created.data) {
    return jsonResponse({
      ok: false,
      error: {
        code: 'account_not_activatable',
        message: 'Student account is not activatable',
      },
    });
  }

  const publicAppUrl =
    Deno.env.get('NEXTPOINT_PUBLIC_APP_URL') ?? 'http://127.0.0.1:8081';
  const activationLink = `${publicAppUrl.replace(/\/$/, '')}/activate-student?token=${encodeURIComponent(token)}`;

  return jsonResponse({
    ok: true,
    data: {
      activationLink,
      expiresAt: created.data.expires_at,
    },
  });
});
