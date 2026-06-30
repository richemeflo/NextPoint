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
    p_recurrence_ends_on: '2026-07-15',
  });
  assert.equal(created.error, null);
  assert.equal(created.data.coach_id, coach.userId);
  assert.equal(created.data.slot_duration_minutes, 90);
  assert.equal(created.data.location, 'Les Bruyères Centre Sportif');
  assert.equal(created.data.recurrence_type, 'weekly');
  assert.equal(created.data.recurrence_ends_on, '2026-07-15');
  createdRangeIds.push(created.data.id);

  const generatedSlots = await coach.client
    .from('availability_slots')
    .select('id, coach_id, availability_range_id, starts_at, ends_at, duration_minutes, location, status')
    .eq('availability_range_id', created.data.id)
    .order('starts_at', { ascending: true });
  assert.equal(generatedSlots.error, null);
  const firstGeneratedSlotId = generatedSlots.data[0].id;
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
      {
        coach_id: coach.userId,
        availability_range_id: created.data.id,
        starts_at: '2026-07-08T16:00:00+00:00',
        ends_at: '2026-07-08T17:30:00+00:00',
        duration_minutes: 90,
        location: 'Les Bruyères Centre Sportif',
        status: 'available',
      },
      {
        coach_id: coach.userId,
        availability_range_id: created.data.id,
        starts_at: '2026-07-15T16:00:00+00:00',
        ends_at: '2026-07-15T17:30:00+00:00',
        duration_minutes: 90,
        location: 'Les Bruyères Centre Sportif',
        status: 'available',
      },
    ]
  );

  const dailyCreated = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-08-03T16:00:00.000Z',
    p_ends_at: '2026-08-03T18:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'daily',
    p_recurrence_ends_on: '2026-08-05',
  });
  assert.equal(dailyCreated.error, null);
  createdRangeIds.push(dailyCreated.data.id);

  const dailySlots = await coach.client
    .from('availability_slots')
    .select('starts_at, ends_at, duration_minutes')
    .eq('availability_range_id', dailyCreated.data.id)
    .order('starts_at', { ascending: true });
  assert.equal(dailySlots.error, null);
  assert.deepEqual(dailySlots.data, [
    {
      starts_at: '2026-08-03T16:00:00+00:00',
      ends_at: '2026-08-03T17:00:00+00:00',
      duration_minutes: 60,
    },
    {
      starts_at: '2026-08-03T17:00:00+00:00',
      ends_at: '2026-08-03T18:00:00+00:00',
      duration_minutes: 60,
    },
    {
      starts_at: '2026-08-04T16:00:00+00:00',
      ends_at: '2026-08-04T17:00:00+00:00',
      duration_minutes: 60,
    },
    {
      starts_at: '2026-08-04T17:00:00+00:00',
      ends_at: '2026-08-04T18:00:00+00:00',
      duration_minutes: 60,
    },
    {
      starts_at: '2026-08-05T16:00:00+00:00',
      ends_at: '2026-08-05T17:00:00+00:00',
      duration_minutes: 60,
    },
    {
      starts_at: '2026-08-05T17:00:00+00:00',
      ends_at: '2026-08-05T18:00:00+00:00',
      duration_minutes: 60,
    },
  ]);

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
    .select('id, status')
    .eq('availability_range_id', created.data.id);
  assert.equal(studentSlotRead.error, null);
  assert.deepEqual(
    studentSlotRead.data.map((slot) => slot.status),
    ['available', 'available', 'available']
  );

  const overlapping = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-01T17:00:00.000Z',
    p_ends_at: '2026-07-01T19:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
    p_recurrence_ends_on: null,
  });
  assert.notEqual(overlapping.error, null);
  assert.equal(overlapping.error.code, '23P01');

  const invalidDuration = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-02T16:00:00.000Z',
    p_ends_at: '2026-07-02T18:00:00.000Z',
    p_slot_duration_minutes: 45,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
    p_recurrence_ends_on: null,
  });
  assert.notEqual(invalidDuration.error, null);

  const rangeCountAfterInvalid = await adminClient
    .from('availability_ranges')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', coach.userId)
    .eq('starts_at', '2026-07-02T16:00:00.000Z');
  assert.equal(rangeCountAfterInvalid.error, null);
  assert.equal(rangeCountAfterInvalid.count, 0);

  const invalidRecurrence = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-04T16:00:00.000Z',
    p_ends_at: '2026-07-04T18:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'weekly',
    p_recurrence_ends_on: '2026-07-03',
  });
  assert.notEqual(invalidRecurrence.error, null);

  const rangeCountAfterInvalidRecurrence = await adminClient
    .from('availability_ranges')
    .select('id', { count: 'exact', head: true })
    .eq('coach_id', coach.userId)
    .eq('starts_at', '2026-07-04T16:00:00.000Z');
  assert.equal(rangeCountAfterInvalidRecurrence.error, null);
  assert.equal(rangeCountAfterInvalidRecurrence.count, 0);

  const studentCreate = await student.client.rpc('create_availability_range', {
    p_starts_at: '2026-07-03T16:00:00.000Z',
    p_ends_at: '2026-07-03T18:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'none',
    p_recurrence_ends_on: null,
  });
  assert.notEqual(studentCreate.error, null);

  const directInsert = await coach.client.from('availability_ranges').insert({
    coach_id: coach.userId,
    starts_at: '2026-07-04T16:00:00.000Z',
    ends_at: '2026-07-04T18:00:00.000Z',
    slot_duration_minutes: 60,
    location: 'Les Bruyères Centre Sportif',
    recurrence_type: 'none',
    recurrence_ends_on: null,
  });
  assert.notEqual(directInsert.error, null);

  const directRangeUpdate = await coach.client
    .from('availability_ranges')
    .update({ location: 'Les Bruyères Centre Sportif' })
    .eq('id', created.data.id);
  assert.notEqual(directRangeUpdate.error, null);

  const directRangeDelete = await coach.client
    .from('availability_ranges')
    .delete()
    .eq('id', created.data.id);
  assert.notEqual(directRangeDelete.error, null);

  const directSlotMutation = await coach.client
    .from('availability_slots')
    .update({ status: 'booked' })
    .eq('availability_range_id', created.data.id);
  assert.notEqual(directSlotMutation.error, null);

  const booked = await adminClient
    .from('availability_slots')
    .update({ status: 'booked' })
    .eq('id', firstGeneratedSlotId)
    .select('status')
    .single();
  assert.equal(booked.error, null);
  assert.equal(booked.data.status, 'booked');

  const requestableAfterBooked = await adminClient
    .from('availability_slots')
    .select('id')
    .eq('id', firstGeneratedSlotId)
    .eq('status', 'available');
  assert.equal(requestableAfterBooked.error, null);
  assert.deepEqual(requestableAfterBooked.data, []);

  const studentRequestableAfterBooked = await student.client
    .from('availability_slots')
    .select('id')
    .eq('id', firstGeneratedSlotId);
  assert.equal(studentRequestableAfterBooked.error, null);
  assert.deepEqual(studentRequestableAfterBooked.data, []);

  const blockedUpdate = await coach.client.rpc('update_availability_slot', {
    p_slot_id: firstGeneratedSlotId,
    p_starts_at: '2026-07-01T18:00:00.000Z',
    p_ends_at: '2026-07-01T19:30:00.000Z',
    p_duration_minutes: 90,
    p_location: 'Les Bruyères Centre Sportif',
    p_apply_to_series: false,
  });
  assert.notEqual(blockedUpdate.error, null);
  assert.equal(blockedUpdate.error.code, '55000');

  const availableSlot = generatedSlots.data[1];
  const updatedOccurrence = await coach.client.rpc('update_availability_slot', {
    p_slot_id: availableSlot.id,
    p_starts_at: '2026-07-08T18:00:00.000Z',
    p_ends_at: '2026-07-08T19:30:00.000Z',
    p_duration_minutes: 90,
    p_location: 'Les Bruyères Centre Sportif',
    p_apply_to_series: false,
  });
  assert.equal(updatedOccurrence.error, null);
  assert.equal(updatedOccurrence.data[0].starts_at, '2026-07-08T18:00:00+00:00');

  const seriesCreated = await coach.client.rpc('create_availability_range', {
    p_starts_at: '2026-09-02T16:00:00.000Z',
    p_ends_at: '2026-09-02T17:00:00.000Z',
    p_slot_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_recurrence_type: 'weekly',
    p_recurrence_ends_on: '2026-09-16',
  });
  assert.equal(seriesCreated.error, null);
  createdRangeIds.push(seriesCreated.data.id);

  const seriesSlotsBefore = await coach.client
    .from('availability_slots')
    .select('id, starts_at')
    .eq('availability_range_id', seriesCreated.data.id)
    .order('starts_at', { ascending: true });
  assert.equal(seriesSlotsBefore.error, null);
  assert.equal(seriesSlotsBefore.data.length, 3);

  const seriesUpdate = await coach.client.rpc('update_availability_slot', {
    p_slot_id: seriesSlotsBefore.data[0].id,
    p_starts_at: '2026-09-02T17:00:00.000Z',
    p_ends_at: '2026-09-02T18:00:00.000Z',
    p_duration_minutes: 60,
    p_location: 'Les Bruyères Centre Sportif',
    p_apply_to_series: true,
  });
  assert.equal(seriesUpdate.error, null);

  const seriesSlotsAfter = await coach.client
    .from('availability_slots')
    .select('starts_at, ends_at')
    .eq('availability_range_id', seriesCreated.data.id)
    .order('starts_at', { ascending: true });
  assert.equal(seriesSlotsAfter.error, null);
  assert.deepEqual(seriesSlotsAfter.data, [
    {
      starts_at: '2026-09-02T17:00:00+00:00',
      ends_at: '2026-09-02T18:00:00+00:00',
    },
    {
      starts_at: '2026-09-09T17:00:00+00:00',
      ends_at: '2026-09-09T18:00:00+00:00',
    },
    {
      starts_at: '2026-09-16T17:00:00+00:00',
      ends_at: '2026-09-16T18:00:00+00:00',
    },
  ]);

  const deletedOccurrence = await coach.client.rpc('delete_availability_slot', {
    p_slot_id: seriesSlotsBefore.data[1].id,
    p_apply_to_series: false,
  });
  assert.equal(deletedOccurrence.error, null);
  assert.equal(deletedOccurrence.data, 1);

  const visibleAfterOccurrenceDelete = await coach.client
    .from('availability_slots')
    .select('id')
    .eq('availability_range_id', seriesCreated.data.id)
    .is('deleted_at', null);
  assert.equal(visibleAfterOccurrenceDelete.error, null);
  assert.equal(visibleAfterOccurrenceDelete.data.length, 2);

  const deletedSeries = await coach.client.rpc('delete_availability_slot', {
    p_slot_id: seriesSlotsBefore.data[0].id,
    p_apply_to_series: true,
  });
  assert.equal(deletedSeries.error, null);
  assert.equal(deletedSeries.data, 2);

  const visibleAfterSeriesDelete = await coach.client
    .from('availability_slots')
    .select('id')
    .eq('availability_range_id', seriesCreated.data.id)
    .is('deleted_at', null);
  assert.equal(visibleAfterSeriesDelete.error, null);
  assert.deepEqual(visibleAfterSeriesDelete.data, []);

  console.log(
    'AVAILABILITY_RANGES_INTEGRATION_OK atomic range and recurring slot generation, complete-slot truncation, coach read, associated student requestable read, direct mutation/update/delete refusal, safe occurrence and series updates/deletes, overlap guard, duration/location/recurrence constraints, booked slots hidden from requestable reads'
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
