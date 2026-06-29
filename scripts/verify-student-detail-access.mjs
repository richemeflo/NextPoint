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
        const key = line.slice(0, separator);
        const value = line.slice(separator + 1).replace(/^"|"$/g, '');
        return [key, value];
      })
  );
}

const environment = getSupabaseEnvironment();
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const adminClient = createClient(
  environment.API_URL,
  environment.SECRET_KEY,
  clientOptions
);
const createdUserIds = [];
const password = 'NextPoint-test-2026';

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const email = `story-2-4-${suffix}-${Date.now()}@nextpoint.local`;
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

async function authenticateExistingCoach(userId) {
  const userResult = await adminClient.auth.admin.getUserById(userId);
  if (userResult.error) throw userResult.error;
  assert.ok(userResult.data.user.email);

  const linkResult = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: userResult.data.user.email,
  });
  if (linkResult.error) throw linkResult.error;

  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const sessionResult = await client.auth.verifyOtp({
    token_hash: linkResult.data.properties.hashed_token,
    type: 'magiclink',
  });
  if (sessionResult.error) throw sessionResult.error;
  return { client, userId };
}

try {
  const existingCoach = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'coach')
    .maybeSingle();
  assert.equal(existingCoach.error, null);

  const coach = existingCoach.data
    ? await authenticateExistingCoach(existingCoach.data.user_id)
    : await createUser('coach', 'coach');
  const student = await createUser('eleve', 'student');

  const profile = await student.client.from('student_profiles').insert({
    user_id: student.userId,
    full_name: 'Élise Historique',
    phone: '+33 6 12 34 57 80',
    email: student.email,
    padel_level: 6,
    age: 31,
    sex: 'female',
    preferred_language: 'fr',
  });
  assert.equal(profile.error, null);

  const historyInsert = await adminClient.from('student_history_events').insert([
    {
      coach_id: coach.userId,
      student_id: student.userId,
      event_type: 'booking_requested',
      status: 'pending',
      title: 'Demande du 23 juin',
      description: 'Cours individuel · 60 min',
      occurred_at: '2026-06-23T08:00:00.000Z',
    },
    {
      coach_id: coach.userId,
      student_id: student.userId,
      event_type: 'lesson_confirmed',
      status: 'confirmed',
      title: 'Cours confirmé',
      description: 'Terrain central',
      occurred_at: '2026-06-24T10:00:00.000Z',
    },
  ]);
  assert.equal(historyInsert.error, null);

  const coachProfile = await coach.client
    .from('student_profiles')
    .select('user_id, full_name, account_status')
    .eq('user_id', student.userId)
    .single();
  assert.equal(coachProfile.error, null);
  assert.equal(coachProfile.data.full_name, 'Élise Historique');

  const coachHistory = await coach.client
    .from('student_history_events')
    .select('event_type, status, title')
    .eq('student_id', student.userId)
    .order('occurred_at', { ascending: false });
  assert.equal(coachHistory.error, null);
  assert.deepEqual(
    coachHistory.data.map(({ event_type }) => event_type),
    ['lesson_confirmed', 'booking_requested']
  );

  const studentHistory = await student.client
    .from('student_history_events')
    .select('id')
    .eq('student_id', student.userId);
  assert.equal(studentHistory.error, null);
  assert.deepEqual(studentHistory.data, []);

  const anonymousClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const anonymousHistory = await anonymousClient
    .from('student_history_events')
    .select('id')
    .eq('student_id', student.userId);
  assert.notEqual(anonymousHistory.error, null);

  console.log(
    'STUDENT_DETAIL_ACCESS_INTEGRATION_OK associated coach profile/history, student and anonymous history denial'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error && error.code !== 'user_not_found') throw error;
  }
}
