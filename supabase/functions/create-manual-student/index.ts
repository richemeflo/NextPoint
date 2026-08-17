import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { randomTemporaryPassword } from '../_shared/security.ts';
import {
  adminClient,
  getRequestUser,
  isCoach,
} from '../_shared/supabase.ts';

const studentSexes = new Set([
  'female',
  'male',
  'other',
  'not_specified',
]);

function parseInput(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  const fullName = typeof value.fullName === 'string' ? value.fullName.trim() : '';
  const phone = typeof value.phone === 'string' ? value.phone.trim() : '';
  const email =
    typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
  const padelLevel = Number(value.padelLevel);
  const age =
    value.age === null ||
    value.age === undefined ||
    (typeof value.age === 'string' && value.age.trim() === '')
      ? null
      : Number(value.age);
  const sex = typeof value.sex === 'string' ? value.sex : '';

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    (phone !== '' && !/^\+?[0-9][0-9 .()-]{5,29}$/.test(phone)) ||
    (email !== '' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ||
    !Number.isInteger(padelLevel) ||
    padelLevel < 1 ||
    padelLevel > 10 ||
    (age !== null &&
      (!Number.isInteger(age) || age < 5 || age > 100)) ||
    !studentSexes.has(sex)
  ) {
    return null;
  }

  return { fullName, phone, email, padelLevel, age, sex };
}

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

  const input = parseInput(await request.json().catch(() => null));
  if (!input) {
    return jsonResponse({
      ok: false,
      error: { code: 'invalid_student', message: 'Invalid student data' },
    });
  }

  const [duplicateEmail, duplicatePhone] = await Promise.all([
    input.email
      ? adminClient
          .from('student_profiles')
          .select('user_id')
          .eq('email', input.email)
          .limit(1)
      : Promise.resolve({ data: [], error: null }),
    input.phone
      ? adminClient
          .from('student_profiles')
          .select('user_id')
          .eq('phone', input.phone)
          .limit(1)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (duplicateEmail.error || duplicatePhone.error) {
    return jsonResponse({
      ok: false,
      error: { code: 'server_error', message: 'Unable to validate student' },
    });
  }
  if (duplicateEmail.data.length > 0 || duplicatePhone.data.length > 0) {
    return jsonResponse({
      ok: false,
      error: { code: 'duplicate_student', message: 'Student already exists' },
    });
  }

  const hasContactEmail = input.email !== '';
  const authEmail = hasContactEmail
    ? input.email
    : `manual-${crypto.randomUUID()}@activation.equationpadel.invalid`;
  const createdUser = await adminClient.auth.admin.createUser({
    email: authEmail,
    password: randomTemporaryPassword(),
    email_confirm: hasContactEmail,
    user_metadata: {
      role: 'eleve',
      provisioned_by_coach: true,
      contact_email_missing: !hasContactEmail,
    },
  });

  if (createdUser.error || !createdUser.data.user) {
    return jsonResponse({
      ok: false,
      error: {
        code:
          createdUser.error?.code === 'email_exists'
            ? 'duplicate_student'
            : 'server_error',
        message: 'Unable to provision student account',
      },
    });
  }

  const studentId = createdUser.data.user.id;
  const provisioned = await adminClient.rpc(
    'complete_manual_student_provisioning',
    {
      p_coach_id: coach.id,
      p_student_id: studentId,
      p_full_name: input.fullName,
      p_phone: input.phone,
      p_email: input.email,
      p_padel_level: input.padelLevel,
      p_age: input.age,
      p_sex: input.sex,
    }
  );

  if (provisioned.error || !provisioned.data) {
    await adminClient.auth.admin.deleteUser(studentId);
    return jsonResponse({
      ok: false,
      error: {
        code:
          provisioned.error?.code === '23505'
            ? 'duplicate_student'
            : 'server_error',
        message: 'Unable to provision student profile',
      },
    });
  }

  return jsonResponse({ ok: true, data: provisioned.data });
});
