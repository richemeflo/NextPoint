import assert from 'node:assert/strict';
import test from 'node:test';

import { getAgendaGridSelection } from './agenda-grid-selection';

const slot = {
  startsAt: '2026-07-01T08:00:00.000Z',
  endsAt: '2026-07-01T09:30:00.000Z',
};

test('agenda selection maps the vertical press position into the slot', () => {
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 100, locationY: 50 }),
    '2026-07-01T08:45:00.000Z'
  );
});

test('a press at 11:00 in an 08:00-19:00 availability selects 11:00', () => {
  assert.equal(
    getAgendaGridSelection({
      startsAt: '2026-07-01T06:00:00.000Z',
      endsAt: '2026-07-01T17:00:00.000Z',
      height: 1_100,
      locationY: 300,
    }),
    '2026-07-01T09:00:00.000Z'
  );
});

test('agenda selection rounds down to the previous quarter hour', () => {
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 90, locationY: 7 }),
    '2026-07-01T08:00:00.000Z'
  );
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 90, locationY: 8 }),
    '2026-07-01T08:00:00.000Z'
  );
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 90, locationY: 23 }),
    '2026-07-01T08:15:00.000Z'
  );
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 90, locationY: 52 }),
    '2026-07-01T08:45:00.000Z'
  );
});

test('agenda selection stays on quarter hours at availability boundaries', () => {
  assert.equal(
    getAgendaGridSelection({
      startsAt: '2026-07-01T08:05:00.000Z',
      endsAt: '2026-07-01T09:25:00.000Z',
      height: 80,
      locationY: undefined,
    }),
    '2026-07-01T08:15:00.000Z'
  );
});

test('agenda selection falls back to the visible start without coordinates', () => {
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 100, locationY: undefined }),
    slot.startsAt
  );
  assert.equal(
    getAgendaGridSelection({ ...slot, height: Number.NaN, locationY: 50 }),
    slot.startsAt
  );
});

test('agenda selection clamps presses to the slot boundaries', () => {
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 100, locationY: -20 }),
    slot.startsAt
  );
  assert.equal(
    getAgendaGridSelection({ ...slot, height: 100, locationY: 120 }),
    slot.endsAt
  );
});

test('agenda selection rejects invalid or reversed slot dates', () => {
  assert.equal(
    getAgendaGridSelection({
      startsAt: 'invalid',
      endsAt: slot.endsAt,
      height: 100,
      locationY: 50,
    }),
    null
  );
  assert.equal(
    getAgendaGridSelection({
      startsAt: slot.endsAt,
      endsAt: slot.startsAt,
      height: 100,
      locationY: 50,
    }),
    null
  );
});
