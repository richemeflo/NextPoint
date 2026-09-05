import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDefaultBookingRequestDuration,
  getEarliestBookingRequestStartsAt,
  getBookingRequestProposal,
  toBookingRequestStartsAt,
} from './booking-request-time';

test('booking requests default to 90 minutes when the range allows it', () => {
  assert.equal(
    getDefaultBookingRequestDuration({
      startsAt: '2026-07-01T10:00:00.000Z',
      availableDurations: [60, 90],
    }),
    90
  );
  assert.equal(
    getDefaultBookingRequestDuration({
      startsAt: '2026-07-01T10:00:00.000Z',
      availableDurations: [60],
    }),
    60
  );
});

test('the earliest request start rounds up to the next quarter hour', () => {
  assert.equal(
    new Date(
      getEarliestBookingRequestStartsAt(
        new Date('2026-07-01T09:07:00.000Z').getTime()
      )
    ).toISOString(),
    '2026-07-01T09:15:00.000Z'
  );
  assert.equal(
    new Date(
      getEarliestBookingRequestStartsAt(
        new Date('2026-07-01T09:15:00.000Z').getTime()
      )
    ).toISOString(),
    '2026-07-01T09:30:00.000Z'
  );
});

test('booking request time accepts quarter-hour values', () => {
  assert.equal(
    toBookingRequestStartsAt('2026-07-01', '11:00'),
    '2026-07-01T09:00:00.000Z'
  );
  assert.equal(
    toBookingRequestStartsAt('2026-07-01', '11:15'),
    '2026-07-01T09:15:00.000Z'
  );
  assert.equal(
    toBookingRequestStartsAt('2026-07-01', ' 11:45 '),
    '2026-07-01T09:45:00.000Z'
  );
});

test('booking request time rejects malformed and off-quarter values', () => {
  assert.equal(toBookingRequestStartsAt('2026-07-01', '11:07'), null);
  assert.equal(toBookingRequestStartsAt('2026-07-01', '24:00'), null);
  assert.equal(toBookingRequestStartsAt('2026-07-01', ''), null);
});

test('a click overlapping a lesson proposes the free hour immediately before it', () => {
  const proposal = getBookingRequestProposal(
    {
      startsAt: '2026-07-01T08:00:00.000Z',
      endsAt: '2026-07-01T17:00:00.000Z',
      occupations: [
        {
          startsAt: '2026-07-01T10:00:00.000Z',
          endsAt: '2026-07-01T11:00:00.000Z',
        },
      ],
    },
    '2026-07-01T09:30:00.000Z'
  );

  assert.deepEqual(proposal, {
    startsAt: '2026-07-01T09:00:00.000Z',
    availableDurations: [60],
  });
});

test('a request keeps both durations when they fit at the proposed start', () => {
  const proposal = getBookingRequestProposal(
    {
      startsAt: '2026-07-01T08:00:00.000Z',
      endsAt: '2026-07-01T17:00:00.000Z',
      occupations: [],
    },
    '2026-07-01T12:15:00.000Z'
  );

  assert.deepEqual(proposal, {
    startsAt: '2026-07-01T12:15:00.000Z',
    availableDurations: [60, 90],
  });
});
