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
  const email = `story-2-2-${suffix}-${Date.now()}@nextpoint.local`;
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
  const associated = await createUser('eleve', 'associated');
  const inactive = await createUser('eleve', 'inactive');

  for (const [student, fullName, level, age, sex] of [
    [associated, 'Alice Associée', 4, 17, 'female'],
    [inactive, 'Nora Non Associée', 8, 34, 'not_specified'],
  ]) {
    const profile = await student.client.from('student_profiles').insert({
      user_id: student.userId,
      full_name: fullName,
      phone:
        student.userId === associated.userId
          ? '+33 6 12 34 56 78'
          : '+33 6 12 34 56 79',
      email: student.email,
      padel_level: level,
      age,
      sex,
      preferred_language: 'fr',
    });
    assert.equal(profile.error, null);
  }

  execFileSync(
    'docker',
    [
      'exec',
      'supabase_db_nextpoint',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      `update public.student_coach_relationships set status = 'inactive' where coach_id = '${coach.userId}'::uuid and student_id = '${inactive.userId}'::uuid;`,
    ],
    { stdio: 'ignore' }
  );

  const relationships = await coach.client
    .from('student_coach_relationships')
    .select('student_id')
    .eq('coach_id', coach.userId)
    .eq('status', 'active')
    .in('student_id', [associated.userId, inactive.userId]);
  assert.equal(relationships.error, null);
  assert.deepEqual(
    relationships.data.map(({ student_id }) => student_id),
    [associated.userId]
  );

  const visibleProfiles = await coach.client
    .from('student_profiles')
    .select('user_id, full_name, sex')
    .in('user_id', [associated.userId, inactive.userId]);
  assert.equal(visibleProfiles.error, null);
  assert.deepEqual(
    visibleProfiles.data.map(({ user_id }) => user_id),
    [associated.userId]
  );
  assert.equal(visibleProfiles.data[0].sex, 'female');

  const studentCannotList = await associated.client
    .from('student_profiles')
    .select('user_id')
    .in('user_id', [associated.userId, inactive.userId]);
  assert.equal(studentCannotList.error, null);
  assert.deepEqual(
    studentCannotList.data.map(({ user_id }) => user_id),
    [associated.userId]
  );

  console.log(
    'STUDENT_LIST_ACCESS_INTEGRATION_OK active relation only, inactive hidden, student cannot list peers'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
