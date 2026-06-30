import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPlanningWindow,
  getAgendaSlotPosition,
  getSlotDateKey,
  movePlanningAnchor,
  planningViewModes,
} from './planning-window';

test('planning view modes stay limited to week and day', () => {
  assert.deepEqual(planningViewModes, ['week', 'day']);
});

test('getPlanningWindow defaults a week to Monday through Sunday', () => {
  const window = getPlanningWindow('2026-07-01', 'week');

  assert.equal(window.startDate, '2026-06-29');
  assert.equal(window.endDate, '2026-07-05');
  assert.equal(window.startsAt, '2026-06-29T00:00:00.000Z');
  assert.equal(window.endsAt, '2026-07-06T00:00:00.000Z');
  assert.deepEqual(
    window.days.map((day) => day.date),
    [
      '2026-06-29',
      '2026-06-30',
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',
      '2026-07-05',
    ]
  );
});

test('getPlanningWindow can target a single day', () => {
  const window = getPlanningWindow('2026-07-01', 'day');

  assert.equal(window.startDate, '2026-07-01');
  assert.equal(window.endDate, '2026-07-01');
  assert.deepEqual(window.days, [{ date: '2026-07-01' }]);
});

test('movePlanningAnchor moves by the active view span', () => {
  assert.equal(movePlanningAnchor('2026-07-01', 'week', 1), '2026-07-08');
  assert.equal(movePlanningAnchor('2026-07-01', 'week', -1), '2026-06-24');
  assert.equal(movePlanningAnchor('2026-07-01', 'day', 1), '2026-07-02');
});

test('getSlotDateKey groups ISO slots by UTC date', () => {
  assert.equal(getSlotDateKey('2026-07-01T16:00:00.000Z'), '2026-07-01');
});

test('getAgendaSlotPosition maps slots into the agenda hour rail', () => {
  const startsAt = new Date(2026, 6, 1, 10, 0).toISOString();
  const endsAt = new Date(2026, 6, 1, 11, 30).toISOString();

  assert.deepEqual(
    getAgendaSlotPosition(startsAt, endsAt, 8, 20),
    {
      top: '16.666666666666664%',
      height: '12.5%',
    }
  );
});
