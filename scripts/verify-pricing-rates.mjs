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
const createdRateIds = [];
const password = 'NextPoint-test-2026';

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const email = `story-2-1-${suffix}-${Date.now()}@nextpoint.local`;
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
  const student = await createUser('eleve', 'student');

  const created = await coach.client.rpc('save_pricing_rate', {
    p_rate_id: null,
    p_label: 'Cours individuel',
    p_amount_cents: 4500,
    p_currency: 'EUR',
    p_duration_minutes: 60,
    p_lesson_type: 'individual',
    p_is_active: true,
    p_applicability_contexts: ['student'],
    p_target_student_ids: [student.userId],
  });
  assert.equal(created.error, null);
  createdRateIds.push(created.data.id);

  const publicClient = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    clientOptions
  );
  const published = await publicClient
    .from('pricing_rates')
    .select('id, amount_cents, duration_minutes, lesson_type')
    .eq('id', created.data.id)
    .single();
  assert.equal(published.error, null);
  assert.equal(published.data.amount_cents, 4500);
  assert.equal(published.data.duration_minutes, 60);
  assert.equal(published.data.lesson_type, 'individual');

  const hiddenTargets = await student.client
    .from('pricing_rate_students')
    .select('student_id')
    .eq('pricing_rate_id', created.data.id);
  assert.equal(hiddenTargets.error, null);
  assert.deepEqual(hiddenTargets.data, []);

  const invalidTarget = await coach.client.rpc('save_pricing_rate', {
    p_rate_id: created.data.id,
    p_label: 'Ciblage invalide',
    p_amount_cents: 4500,
    p_currency: 'EUR',
    p_duration_minutes: 60,
    p_lesson_type: 'individual',
    p_is_active: true,
    p_applicability_contexts: [],
    p_target_student_ids: ['00000000-0000-4000-8000-000000000000'],
  });
  assert.ok(invalidTarget.error);

  const updated = await coach.client.rpc('save_pricing_rate', {
    p_rate_id: created.data.id,
    p_label: 'Cours collectif week-end',
    p_amount_cents: 7000,
    p_currency: 'EUR',
    p_duration_minutes: 90,
    p_lesson_type: 'group',
    p_is_active: false,
    p_applicability_contexts: ['weekend', 'public_holiday'],
    p_target_student_ids: [],
  });
  assert.equal(updated.error, null);
  assert.equal(updated.data.amount_cents, 7000);
  assert.equal(updated.data.duration_minutes, 90);
  assert.equal(updated.data.lesson_type, 'group');

  const hiddenInactive = await student.client
    .from('pricing_rates')
    .select('id')
    .eq('id', created.data.id);
  assert.equal(hiddenInactive.error, null);
  assert.deepEqual(hiddenInactive.data, []);

  const coachStillSeesInactive = await coach.client
    .from('pricing_rates')
    .select('id, is_active')
    .eq('id', created.data.id)
    .single();
  assert.equal(coachStillSeesInactive.error, null);
  assert.equal(coachStillSeesInactive.data.is_active, false);

  const forbiddenSave = await student.client.rpc('save_pricing_rate', {
    p_rate_id: null,
    p_label: 'Modification interdite',
    p_amount_cents: 100,
    p_currency: 'EUR',
    p_duration_minutes: 60,
    p_lesson_type: 'individual',
    p_is_active: true,
    p_applicability_contexts: [],
    p_target_student_ids: [],
  });
  assert.ok(forbiddenSave.error);

  const directMutation = await student.client
    .from('pricing_rates')
    .update({ amount_cents: 1 })
    .eq('id', created.data.id);
  assert.ok(directMutation.error);

  const deleted = await coach.client.rpc('delete_pricing_rate', {
    p_rate_id: created.data.id,
  });
  assert.equal(deleted.error, null);

  const hiddenDeleted = await publicClient
    .from('pricing_rates')
    .select('id')
    .eq('id', created.data.id);
  assert.equal(hiddenDeleted.error, null);
  assert.deepEqual(hiddenDeleted.data, []);

  const retainedDeleted = await adminClient
    .from('pricing_rates')
    .select('id, is_active, deleted_at')
    .eq('id', created.data.id)
    .single();
  assert.equal(retainedDeleted.error, null);
  assert.equal(retainedDeleted.data.is_active, false);
  assert.ok(retainedDeleted.data.deleted_at);

  console.log(
    'PRICING_RATE_INTEGRATION_OK create, update, inactive/public visibility, coach-only commands, soft delete'
  );
} finally {
  for (const rateId of createdRateIds) {
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
        `delete from public.pricing_rates where id = '${rateId}'::uuid;`,
      ],
      { stdio: 'ignore' }
    );
  }

  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) throw error;
  }
}
