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
const publicOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const adminClient = createClient(
  environment.API_URL,
  environment.SECRET_KEY,
  publicOptions
);
const createdUserIds = [];

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    publicOptions
  );
  const email = `story-1-5-${suffix}-${Date.now()}@nextpoint.local`;
  const password = 'NextPoint-test-2026';
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { role } },
  });

  if (error) throw error;
  assert.ok(data.user);
  assert.ok(data.session);
  createdUserIds.push(data.user.id);

  return { client, userId: data.user.id };
}

try {
  const firstEleve = await createUser('eleve', 'eleve-a');
  const secondEleve = await createUser('eleve', 'eleve-b');

  const ownRole = await firstEleve.client
    .from('user_roles')
    .select('role')
    .eq('user_id', firstEleve.userId)
    .single();
  assert.equal(ownRole.error, null);
  assert.equal(ownRole.data.role, 'eleve');

  const otherRole = await firstEleve.client
    .from('user_roles')
    .select('role')
    .eq('user_id', secondEleve.userId);
  assert.equal(otherRole.error, null);
  assert.deepEqual(otherRole.data, []);

  const forbiddenUpdate = await firstEleve.client
    .from('user_roles')
    .update({ role: 'coach' })
    .eq('user_id', firstEleve.userId);
  assert.ok(forbiddenUpdate.error);

  const existingCoach = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role', 'coach')
    .maybeSingle();
  assert.equal(existingCoach.error, null);

  if (!existingCoach.data) {
    const coach = await createUser('coach', 'coach');
    const coachRole = await coach.client
      .from('user_roles')
      .select('role')
      .eq('user_id', coach.userId)
      .single();
    assert.equal(coachRole.error, null);
    assert.equal(coachRole.data.role, 'coach');
  }

  const secondCoachClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    publicOptions
  );
  const secondCoach = await secondCoachClient.auth.signUp({
    email: `story-1-5-second-coach-${Date.now()}@nextpoint.local`,
    password: 'NextPoint-test-2026',
    options: { data: { role: 'coach' } },
  });
  assert.ok(secondCoach.error);

  console.log(
    'AUTH_ROLE_INTEGRATION_OK trigger, own-role RLS, cross-user denial, mutation denial, single coach'
  );
} finally {
  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
