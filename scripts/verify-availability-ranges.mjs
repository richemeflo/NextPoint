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
const createdRangeIds = [];
const password = 'NextPoint-test-2026';

async function createUser(role, suffix) {
  const client = createClient(
    environment.API_URL,
    environment.PUBLISHABLE_KEY,
    options
  );
  const email = `story-3-1-${suffix}-${Date.now()}@nextpoint.local`;
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
    options
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
    .limit(1)
    .maybeSingle();
  assert.equal(existingCoach.error, null);

  const coach = existingCoach.data
    ? await authenticateExistingCoach(existingCoach.data.user_id)
    : await createUser('coach', 'coach');
  const student = await createUser('eleve', 'student');

  const created = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-01T16:00:00.000Z',
    p_ends_at: '2026-07-01T18:15:00.000Z',
    p_slot_duration_minutes: 90,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'weekly',
  });
  assert.equal(created.error, null);
  assert.equal(created.data.coach_id, coach.userId);
  assert.equal(created.data.slot_duration_minutes, 90);
  assert.equal(created.data.location, 'Les Bruyères Centre Sportif');
  assert.equal(created.data.recurrence_type, 'weekly');
  createdRangeIds.push(created.data.id);

  const generatedSlots = await coach.client
    .from('availability_slots')
    .select('id, coach_id, availability_range_id, starts_at, ends_at, duration_minutes, location, status')
    .eq('availability_range_id', created.data.id)
    .order('starts_at', { ascending: true });
  assert.equal(generatedSlots.error, null);
  assert.deepEqual(
    generatedSlots.data.map((slot) => ({
      coach_id: slot.coach_id,
      availability_range_id: slot.availability_range_id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      duration_minutes: slot.duration_minutes,
      location: slot.location,
      status: slot.status,
    })),
    [
      {
        coach_id: coach.userId,
        availability_range_id: created.data.id,
        starts_at: '2026-07-01T16:00:00+00:00',
        ends_at: '2026-07-01T17:30:00+00:00',
        duration_minutes: 90,
        location: 'Les Bruyères Centre Sportif',
        status: 'available',
      },
    ]
  );

  const coachRead = await coach.client
    .from('availability_ranges')
    .select('id, starts_at, ends_at, slot_duration_minutes, location')
    .eq('id', created.data.id)
    .single();
  assert.equal(coachRead.error, null);
  assert.equal(coachRead.data.location, 'Les Bruyères Centre Sportif');

  const studentRead = await student.client
    .from('availability_ranges')
    .select('id')
    .eq('id', created.data.id);
  assert.equal(studentRead.error, null);
  assert.deepEqual(studentRead.data, []);

  const studentSlotRead = await student.client
    .from('availability_slots')
    .select('id')
    .eq('availability_range_id', created.data.id);
  assert.equal(studentSlotRead.error, null);
  assert.deepEqual(studentSlotRead.data, []);

  const overlapping = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-01T17:00:00.000Z',
    p_ends_at: '2026-07-01T19:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
  });
  assert.notEqual(overlapping.error, null);
  assert.equal(overlapping.error.code, '23P01');

  const invalidDuration = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-02T16:00:00.000Z',
    p_ends_at: '2026-07-02T18:00:00.000Z',
    p_slot_duration_minutes: 45,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
  });
  assert.notEqual(invalidDuration.error, null);

  const rangeCountAfterInvalid = await adminClient
    .from('availability_ranges')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', coach.userId)
    .eq('starts_at', '2026-07-02T16:00:00.000Z');
  assert.equal(rangeCountAfterInvalid.error, null);
  assert.equal(rangeCountAfterInvalid.count, 0);

  const studentCreate = await student.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-03T16:00:00.000Z',
    p_ends_at: '2026-07-03T18:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
  });
  assert.notEqual(studentCreate.error, null);

  const directInsert = await coach.client.from('availability_ranges').insert({
    coach_id: coach.userId,
    starts_at: '2026-07-04T16:00:00.000Z',
    ends_at: '2026-07-04T18:00:00.000Z',
    slot_duration_minutes: 60,
    location: 'Les Bruyères Centre Sportif',
    recurrence_type: 'none',
  });
  assert.notEqual(directInsert.error, null);

  const directSlotMutation = await coach.client
    .from('availability_slots')
    .update({ status: 'booked' })
    .eq('availability_range_id', created.data.id);
  assert.notEqual(directSlotMutation.error, null);

  const booked = await adminClient
    .from('availability_slots')
    .update({ status: 'booked' })
    .eq('availability_range_id', created.data.id)
    .select('status')
    .single();
  assert.equal(booked.error, null);
  assert.equal(booked.data.status, 'booked');

  const requestableAfterBooked = await adminClient
    .from('availability_slots')
    .select('id')
    .eq('availability_range_id', created.data.id)
    .eq('status', 'available');
  assert.equal(requestableAfterBooked.error, null);
  assert.deepEqual(requestableAfterBooked.data, []);

  console.log(
    'AVAILABILITY_RANGES_INTEGRATION_OK atomic range and slot generation, complete-slot truncation, coach read, non-coach refusal, direct mutation refusal, overlap guard, duration/location/recurrence constraints, booked slots hidden from requestable reads'
  );
} finally {
  for (const rangeId of createdRangeIds) {
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
        `delete from public.availability_ranges where id = '${rangeId}'::uuid;`,
      ],
      { stdio: 'ignore' }
    );
  }

  for (const userId of createdUserIds) {
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error && error.code !== 'user_not_found') throw error;
  }
}
