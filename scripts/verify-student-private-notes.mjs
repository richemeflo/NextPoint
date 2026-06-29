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
  const email = `story-2-5-${suffix}-${Date.now()}@nextpoint.local`;
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
  const userResult = await adminClient.auth.admin.getUserById(userId);
  if (userResult.error) throw userResult.error;
  assert.ok(userResult.data.user.email);

  const link = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: userResult.data.user.email,
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

  const ownerCoach = existingCoach.data
    ? await authenticate(existingCoach.data.user_id)
    : await createUser('coach', 'owner');
  const student = await createUser('eleve', 'student');
  const nonOwner = await createUser('eleve', 'non-owner');

  const profile = await student.client.from('student_profiles').insert({
    user_id: student.userId,
    full_name: 'Nina Note Privée',
    phone: '+33 6 12 34 57 81',
    email: student.email,
    padel_level: 5,
    age: 28,
    sex: 'female',
    preferred_language: 'fr',
  });
  assert.equal(profile.error, null);

  const relationship = await adminClient
    .from('student_coach_relationships')
    .select('coach_id')
    .eq('student_id', student.userId)
    .eq('status', 'active')
    .single();
  assert.equal(relationship.error, null);

  assert.equal(relationship.data.coach_id, ownerCoach.userId);

  const saved = await ownerCoach.client.rpc('save_student_private_note', {
    p_student_id: student.userId,
    p_content: 'Préparer les sorties de vitre.',
  });
  assert.equal(saved.error, null);
  assert.equal(saved.data.content, 'Préparer les sorties de vitre.');

  const updated = await ownerCoach.client.rpc('save_student_private_note', {
    p_student_id: student.userId,
    p_content: 'Préparer la défense puis les sorties de vitre.',
  });
  assert.equal(updated.error, null);
  assert.equal(
    updated.data.content,
    'Préparer la défense puis les sorties de vitre.'
  );
  assert.equal(updated.data.id, saved.data.id);

  const ownerRead = await ownerCoach.client
    .from('student_private_notes')
    .select('content')
    .eq('student_id', student.userId)
    .single();
  assert.equal(ownerRead.error, null);

  const studentRead = await student.client
    .from('student_private_notes')
    .select('content')
    .eq('student_id', student.userId);
  assert.equal(studentRead.error, null);
  assert.deepEqual(studentRead.data, []);

  const studentWrite = await student.client.rpc('save_student_private_note', {
    p_student_id: student.userId,
    p_content: 'Tentative élève.',
  });
  assert.notEqual(studentWrite.error, null);

  const nonOwnerRead = await nonOwner.client
    .from('student_private_notes')
    .select('content')
    .eq('student_id', student.userId);
  assert.equal(nonOwnerRead.error, null);
  assert.deepEqual(nonOwnerRead.data, []);

  const nonOwnerWrite = await nonOwner.client.rpc(
    'save_student_private_note',
    {
      p_student_id: student.userId,
      p_content: 'Tentative utilisateur non propriétaire.',
    }
  );
  assert.notEqual(nonOwnerWrite.error, null);

  const profileProjection = await student.client
    .from('student_profiles')
    .select('*')
    .eq('user_id', student.userId)
    .single();
  assert.equal(profileProjection.error, null);
  assert.equal(Object.hasOwn(profileProjection.data, 'private_note'), false);
  assert.equal(
    JSON.stringify(profileProjection.data).includes('sorties de vitre'),
    false
  );

  console.log(
    'STUDENT_PRIVATE_NOTES_INTEGRATION_OK explicit create/update, owner-only read/write, student and non-owner denial'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error && error.code !== 'user_not_found') throw error;
  }
}
