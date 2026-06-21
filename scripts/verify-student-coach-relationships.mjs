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
  const email = `story-1-8-${suffix}-${Date.now()}@nextpoint.local`;
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

  const email = userResult.data.user.email;
  assert.ok(email);

  const linkResult = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
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
  const firstStudent = await createUser('eleve', 'student-a');
  const secondStudent = await createUser('eleve', 'student-b');

  const firstProfile = await firstStudent.client.from('student_profiles').insert({
    user_id: firstStudent.userId,
    full_name: 'Eleve Association A',
    phone: '+33 6 10 20 30 40',
    email: firstStudent.email,
    padel_level: 4,
    age: 26,
    preferred_language: 'fr',
  });
  assert.equal(firstProfile.error, null);

  const secondProfile = await secondStudent.client.from('student_profiles').insert({
    user_id: secondStudent.userId,
    full_name: 'Eleve Association B',
    phone: '+33 6 50 60 70 80',
    email: secondStudent.email,
    padel_level: 6,
    age: 31,
    preferred_language: 'en',
  });
  assert.equal(secondProfile.error, null);

  const ownRelationship = await firstStudent.client
    .from('student_coach_relationships')
    .select('*')
    .eq('student_id', firstStudent.userId)
    .single();
  assert.equal(ownRelationship.error, null);
  assert.equal(ownRelationship.data.coach_id, coach.userId);
  assert.equal(ownRelationship.data.status, 'active');
  assert.equal(ownRelationship.data.association_method, 'automatic');

  const otherRelationship = await firstStudent.client
    .from('student_coach_relationships')
    .select('*')
    .eq('student_id', secondStudent.userId);
  assert.equal(otherRelationship.error, null);
  assert.deepEqual(otherRelationship.data, []);

  const coachRelationships = await coach.client
    .from('student_coach_relationships')
    .select('student_id')
    .in('student_id', [firstStudent.userId, secondStudent.userId]);
  assert.equal(coachRelationships.error, null);
  assert.equal(coachRelationships.data.length, 2);

  const associatedProfiles = await coach.client
    .from('student_profiles')
    .select('user_id, full_name')
    .in('user_id', [firstStudent.userId, secondStudent.userId]);
  assert.equal(associatedProfiles.error, null);
  assert.equal(associatedProfiles.data.length, 2);

  const hiddenOtherProfile = await firstStudent.client
    .from('student_profiles')
    .select('user_id')
    .eq('user_id', secondStudent.userId);
  assert.equal(hiddenOtherProfile.error, null);
  assert.deepEqual(hiddenOtherProfile.data, []);

  const forbiddenMutation = await firstStudent.client
    .from('student_coach_relationships')
    .update({ status: 'inactive' })
    .eq('student_id', firstStudent.userId);
  assert.ok(forbiddenMutation.error);

  const reloadedClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const signIn = await reloadedClient.auth.signInWithPassword({
    email: firstStudent.email,
    password,
  });
  assert.equal(signIn.error, null);

  const reusedRelationship = await reloadedClient
    .from('student_coach_relationships')
    .select('id')
    .eq('student_id', firstStudent.userId);
  assert.equal(reusedRelationship.error, null);
  assert.equal(reusedRelationship.data.length, 1);
  assert.equal(reusedRelationship.data[0].id, ownRelationship.data.id);

  console.log(
    'STUDENT_COACH_RELATIONSHIP_INTEGRATION_OK automatic, idempotent, participant reads, privacy'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
