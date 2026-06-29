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

async function createEleve(suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const email = `story-1-6-${suffix}-${Date.now()}@nextpoint.local`;
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { role: 'eleve' } },
  });

  if (error) throw error;
  assert.ok(data.user);
  assert.ok(data.session);
  createdUserIds.push(data.user.id);

  return { client, email, userId: data.user.id };
}

try {
  const owner = await createEleve('owner');
  const other = await createEleve('other');
  const initialProfile = {
    user_id: owner.userId,
    full_name: 'Camille Martin',
    phone: '+33 6 12 34 56 78',
    email: owner.email,
    padel_level: 4,
    age: 28,
    sex: 'female',
    preferred_language: 'fr',
  };

  const created = await owner.client
    .from('student_profiles')
    .insert(initialProfile)
    .select('*')
    .single();
  assert.equal(created.error, null);
  assert.equal(created.data.padel_level, 4);

  const reloadedClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const signIn = await reloadedClient.auth.signInWithPassword({
    email: owner.email,
    password,
  });
  assert.equal(signIn.error, null);

  const reloaded = await reloadedClient
    .from('student_profiles')
    .select('*')
    .eq('user_id', owner.userId)
    .single();
  assert.equal(reloaded.error, null);
  assert.equal(reloaded.data.full_name, 'Camille Martin');
  assert.equal(reloaded.data.sex, 'female');

  const updated = await reloadedClient
    .from('student_profiles')
    .update({ padel_level: 7, preferred_language: 'es', sex: 'other' })
    .eq('user_id', owner.userId)
    .select('*')
    .single();
  assert.equal(updated.error, null);
  assert.equal(updated.data.padel_level, 7);
  assert.equal(updated.data.preferred_language, 'es');
  assert.equal(updated.data.sex, 'other');

  const hiddenFromOther = await other.client
    .from('student_profiles')
    .select('*')
    .eq('user_id', owner.userId);
  assert.equal(hiddenFromOther.error, null);
  assert.deepEqual(hiddenFromOther.data, []);

  const forbiddenWrite = await other.client
    .from('student_profiles')
    .upsert({ ...initialProfile, full_name: 'Unauthorized change' });
  assert.ok(forbiddenWrite.error);

  const unchanged = await reloadedClient
    .from('student_profiles')
    .select('full_name')
    .eq('user_id', owner.userId)
    .single();
  assert.equal(unchanged.error, null);
  assert.equal(unchanged.data.full_name, 'Camille Martin');

  console.log(
    'STUDENT_PROFILE_INTEGRATION_OK create, reload, update, cross-user read/write denial'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
