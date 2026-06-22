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
  const email = `story-2-3-${suffix}-${Date.now()}@nextpoint.local`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { role } },
  });

  if (error) throw error;
  assert.ok(data.user);
  assert.ok(data.session);
  createdUserIds.push(data.user.id);

  return { client, email, session: data.session, userId: data.user.id };
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
  assert.ok(sessionResult.data.session);

  return {
    client,
    session: sessionResult.data.session,
    userId,
  };
}

async function invoke(name, body, accessToken) {
  const response = await fetch(`${environment.API_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: environment.PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...(accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.ok, true);
  return response.json();
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
  const unauthorizedStudent = await createUser('eleve', 'unauthorized');
  const studentEmail = `manual-${Date.now()}@nextpoint.local`;
  const studentPhone = '+33 6 98 76 54 32';

  const created = await invoke(
    'create-manual-student',
    {
      fullName: 'Manon Sans Mot De Passe',
      phone: studentPhone,
      email: studentEmail,
      padelLevel: 5,
      age: 27,
      sex: 'female',
    },
    coach.session.access_token
  );
  assert.equal(created.ok, true);
  assert.equal(created.data.account_status, 'pending_activation');
  assert.equal(created.data.sex, 'female');
  createdUserIds.push(created.data.user_id);

  const authUser = await adminClient.auth.admin.getUserById(created.data.user_id);
  assert.equal(authUser.error, null);
  assert.equal(authUser.data.user.user_metadata.role, 'eleve');
  assert.equal(authUser.data.user.user_metadata.provisioned_by_coach, true);

  const relationship = await adminClient
    .from('student_coach_relationships')
    .select('association_method, coach_id, status')
    .eq('student_id', created.data.user_id)
    .single();
  assert.equal(relationship.error, null);
  assert.equal(relationship.data.coach_id, coach.userId);
  assert.equal(relationship.data.association_method, 'manual');
  assert.equal(relationship.data.status, 'active');

  const duplicateEmail = await invoke(
    'create-manual-student',
    {
      fullName: 'Doublon Email',
      phone: '+33 6 00 00 00 01',
      email: studentEmail.toUpperCase(),
      padelLevel: 3,
      age: 22,
      sex: 'male',
    },
    coach.session.access_token
  );
  assert.equal(duplicateEmail.ok, false);
  assert.equal(duplicateEmail.error.code, 'duplicate_student');

  const duplicatePhone = await invoke(
    'create-manual-student',
    {
      fullName: 'Doublon Téléphone',
      phone: '+33 (6) 98 76 54 32',
      email: `other-${Date.now()}@nextpoint.local`,
      padelLevel: 3,
      age: 22,
      sex: 'other',
    },
    coach.session.access_token
  );
  assert.equal(duplicatePhone.ok, false);
  assert.equal(duplicatePhone.error.code, 'duplicate_student');

  const forbidden = await invoke(
    'create-manual-student',
    {
      fullName: 'Création Refusée',
      phone: '+33 6 00 00 00 02',
      email: `forbidden-${Date.now()}@nextpoint.local`,
      padelLevel: 3,
      age: 22,
      sex: 'male',
    },
    unauthorizedStudent.session.access_token
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.error.code, 'unauthorized');

  const firstLink = await invoke(
    'generate-student-activation-link',
    { studentId: created.data.user_id },
    coach.session.access_token
  );
  assert.equal(firstLink.ok, true);
  const firstToken = new URL(firstLink.data.activationLink).searchParams.get(
    'token'
  );
  assert.ok(firstToken);

  const secondLink = await invoke(
    'generate-student-activation-link',
    { studentId: created.data.user_id },
    coach.session.access_token
  );
  assert.equal(secondLink.ok, true);
  const secondToken = new URL(secondLink.data.activationLink).searchParams.get(
    'token'
  );
  assert.ok(secondToken);
  assert.notEqual(secondToken, firstToken);
  const lifetime =
    new Date(secondLink.data.expiresAt).getTime() - Date.now();
  assert.ok(lifetime > 86_390_000 && lifetime <= 86_400_000);

  const oldLinkRejected = await invoke('activate-student-account', {
    token: firstToken,
    password: 'Activated-Password-2026',
  });
  assert.equal(oldLinkRejected.ok, false);
  assert.equal(oldLinkRejected.error.code, 'invalid_activation');

  const activated = await invoke('activate-student-account', {
    token: secondToken,
    password: 'Activated-Password-2026',
  });
  assert.equal(activated.ok, true);

  const activeProfile = await adminClient
    .from('student_profiles')
    .select('account_status')
    .eq('user_id', created.data.user_id)
    .single();
  assert.equal(activeProfile.error, null);
  assert.equal(activeProfile.data.account_status, 'active');

  const reusedLink = await invoke('activate-student-account', {
    token: secondToken,
    password: 'Another-Password-2026',
  });
  assert.equal(reusedLink.ok, false);
  assert.equal(reusedLink.error.code, 'invalid_activation');

  const generationAfterActivation = await invoke(
    'generate-student-activation-link',
    { studentId: created.data.user_id },
    coach.session.access_token
  );
  assert.equal(generationAfterActivation.ok, false);
  assert.equal(
    generationAfterActivation.error.code,
    'account_not_activatable'
  );

  const activatedClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const signIn = await activatedClient.auth.signInWithPassword({
    email: studentEmail,
    password: 'Activated-Password-2026',
  });
  assert.equal(signIn.error, null);
  assert.ok(signIn.data.session);

  console.log(
    'MANUAL_STUDENT_ACTIVATION_INTEGRATION_OK provision, duplicate denial, coach-only links, 24h regeneration, one-time activation'
  );
} finally {
  for (const userId of [...new Set(createdUserIds)]) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error && error.code !== 'user_not_found') throw error;
  }
}
