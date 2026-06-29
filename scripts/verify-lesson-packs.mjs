import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import { createClient } from '@supabase/supabase-js';

function getSupabaseEnvironment() {
  const output = execFileSync('npx', ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
  });
  return Object.fromEntries(
    output
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf('=');
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^"|"$/g, ''),
        ];
      })
  );
}

const environment = getSupabaseEnvironment();
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const adminClient = createClient(
  environment.API_URL,
  environment.SECRET_KEY,
  options
);
const createdUserIds = [];
const password = 'NextPoint-test-2026';

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    options
  );
  const email = `story-2-6-${suffix}-${Date.now()}@nextpoint.local`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { role } },
  });
  if (error) throw error;
  assert.ok(data.user);
  assert.ok(data.session);
  createdUserIds.push(data.user.id);
  return { client, email, userId: data.user.id };
}

async function authenticate(userId) {
  const user = await adminClient.auth.admin.getUserById(userId);
  if (user.error) throw user.error;
  assert.ok(user.data.user.email);
  const link = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: user.data.user.email,
  });
  if (link.error) throw link.error;
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    options
  );
  const session = await client.auth.verifyOtp({
    token_hash: link.data.properties.hashed_token,
    type: 'magiclink',
  });
  if (session.error) throw session.error;
  return { client, userId };
}

try {
  const existingCoach = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'coach')
    .limit(1)
    .maybeSingle();
  assert.equal(existingCoach.error, null);
  const coach = existingCoach.data
    ? await authenticate(existingCoach.data.user_id)
    : await createUser('coach', 'coach');
  const student = await createUser('eleve', 'student');
  const nonOwner = await createUser('eleve', 'non-owner');

  const profile = await student.client.from('student_profiles').insert({
    user_id: student.userId,
    full_name: 'Léo Pack Individuel',
    phone: '+33 6 12 34 57 82',
    email: student.email,
    padel_level: 4,
    age: 26,
    sex: 'male',
    preferred_language: 'fr',
  });
  assert.equal(profile.error, null);

  const assigned = await coach.client.rpc('assign_lesson_pack', {
    p_student_id: student.userId,
    p_included_sessions: 2,
  });
  assert.equal(assigned.error, null);
  assert.equal(assigned.data.included_sessions, 2);
  assert.equal(assigned.data.used_sessions, 0);
  assert.equal(assigned.data.remaining_sessions, 2);
  assert.equal(assigned.data.status, 'active');

  const duplicateActive = await coach.client.rpc('assign_lesson_pack', {
    p_student_id: student.userId,
    p_included_sessions: 5,
  });
  assert.notEqual(duplicateActive.error, null);

  const studentRead = await student.client
    .from('lesson_packs')
    .select('included_sessions, used_sessions, remaining_sessions, status')
    .eq('id', assigned.data.id)
    .single();
  assert.equal(studentRead.error, null);
  assert.equal(studentRead.data.remaining_sessions, 2);

  const studentAssign = await student.client.rpc('assign_lesson_pack', {
    p_student_id: student.userId,
    p_included_sessions: 3,
  });
  assert.notEqual(studentAssign.error, null);

  const nonOwnerAssign = await nonOwner.client.rpc('assign_lesson_pack', {
    p_student_id: student.userId,
    p_included_sessions: 3,
  });
  assert.notEqual(nonOwnerAssign.error, null);

  const firstUse = await coach.client.rpc('consume_lesson_pack_session', {
    p_pack_id: assigned.data.id,
  });
  assert.equal(firstUse.error, null);
  assert.equal(firstUse.data.used_sessions, 1);
  assert.equal(firstUse.data.remaining_sessions, 1);
  assert.equal(firstUse.data.status, 'active');

  const secondUse = await coach.client.rpc('consume_lesson_pack_session', {
    p_pack_id: assigned.data.id,
  });
  assert.equal(secondUse.error, null);
  assert.equal(secondUse.data.used_sessions, 2);
  assert.equal(secondUse.data.remaining_sessions, 0);
  assert.equal(secondUse.data.status, 'exhausted');

  const underZero = await coach.client.rpc('consume_lesson_pack_session', {
    p_pack_id: assigned.data.id,
  });
  assert.notEqual(underZero.error, null);

  const afterRefusal = await coach.client
    .from('lesson_packs')
    .select('used_sessions, remaining_sessions, status')
    .eq('id', assigned.data.id)
    .single();
  assert.equal(afterRefusal.error, null);
  assert.deepEqual(afterRefusal.data, {
    used_sessions: 2,
    remaining_sessions: 0,
    status: 'exhausted',
  });

  const studentConsume = await student.client.rpc(
    'consume_lesson_pack_session',
    { p_pack_id: assigned.data.id }
  );
  assert.notEqual(studentConsume.error, null);

  const paymentColumns = ['amount', 'price', 'payment', 'invoice', 'transaction'];
  assert.equal(
    Object.keys(assigned.data).some((key) =>
      paymentColumns.some((word) => key.includes(word))
    ),
    false
  );

  console.log(
    'LESSON_PACKS_INTEGRATION_OK coach assignment, counters, participant read, non-owner denial, zero floor, no payment data'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error && error.code !== 'user_not_found') throw error;
  }
}
