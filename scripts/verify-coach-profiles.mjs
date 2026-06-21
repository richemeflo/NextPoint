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
let ownerClient;
let ownerUserId;
let originalProfile;

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const email = `story-1-7-${suffix}-${Date.now()}@nextpoint.local`;
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

  return { client, email, userId };
}

try {
  const existingCoach = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'coach')
    .maybeSingle();
  assert.equal(existingCoach.error, null);

  const owner = existingCoach.data
    ? await authenticateExistingCoach(existingCoach.data.user_id)
    : await createUser('coach', 'owner');
  ownerClient = owner.client;
  ownerUserId = owner.userId;

  const other = await createUser('eleve', 'other');
  originalProfile = await owner.client
    .from('coach_profiles')
    .select('*')
    .eq('user_id', owner.userId)
    .maybeSingle();
  assert.equal(originalProfile.error, null);

  const initialProfile = {
    user_id: owner.userId,
    display_name: 'Coach NextPoint',
    bio: 'Un accompagnement padel clair, progressif et adapté à chaque joueur.',
    phone: '+33 6 12 34 56 78',
    email: owner.email,
    preferred_language: 'fr',
  };

  const saved = await owner.client
    .from('coach_profiles')
    .upsert(initialProfile)
    .select('*')
    .single();
  assert.equal(saved.error, null);
  assert.equal(saved.data.display_name, 'Coach NextPoint');

  const updated = await owner.client
    .from('coach_profiles')
    .update({
      display_name: 'Coach NextPoint Padel',
      preferred_language: 'es',
    })
    .eq('user_id', owner.userId)
    .select('*')
    .single();
  assert.equal(updated.error, null);
  assert.equal(updated.data.display_name, 'Coach NextPoint Padel');
  assert.equal(updated.data.preferred_language, 'es');

  const publicClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const publicRead = await publicClient
    .from('coach_profiles')
    .select('display_name, bio, phone, email')
    .eq('user_id', owner.userId)
    .single();
  assert.equal(publicRead.error, null);
  assert.equal(publicRead.data.display_name, 'Coach NextPoint Padel');

  const forbiddenWrite = await other.client
    .from('coach_profiles')
    .upsert({
      ...initialProfile,
      display_name: 'Modification interdite',
    });
  assert.ok(forbiddenWrite.error);

  const unchanged = await owner.client
    .from('coach_profiles')
    .select('display_name')
    .eq('user_id', owner.userId)
    .single();
  assert.equal(unchanged.error, null);
  assert.equal(unchanged.data.display_name, 'Coach NextPoint Padel');

  console.log(
    'COACH_PROFILE_INTEGRATION_OK owner save/update, public read, cross-user write denial'
  );
} finally {
  if (ownerClient && ownerUserId && !createdUserIds.includes(ownerUserId)) {
    if (originalProfile?.data) {
      const restored = await ownerClient
        .from('coach_profiles')
        .update({
          display_name: originalProfile.data.display_name,
          bio: originalProfile.data.bio,
          phone: originalProfile.data.phone,
          email: originalProfile.data.email,
          preferred_language: originalProfile.data.preferred_language,
        })
        .eq('user_id', ownerUserId);
      if (restored.error) throw restored.error;
    } else if (originalProfile) {
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
          `delete from public.coach_profiles where user_id = '${ownerUserId}'::uuid;`,
        ],
        { stdio: 'ignore' }
      );
    }
  }

  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
