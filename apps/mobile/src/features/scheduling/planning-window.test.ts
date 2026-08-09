import assert from 'node:assert/strict';
import test from 'node:test';

import {
  agendaHourMarks,
  getAgendaTimePosition,
  getNonPastPlanningDays,
  getPlanningWindow,
  getAgendaSlotPosition,
  getSlotDateKey,
  movePlanningAnchor,
  planningViewModes,
} from './planning-window';

test('planning view modes stay limited to week and day', () => {
  assert.deepEqual(planningViewModes, ['week', 'day']);
});

test('agenda hour marks cover 08:00 through 23:00', () => {
  assert.equal(agendaHourMarks[0], 8);
  assert.equal(agendaHourMarks.at(-1), 23);
  assert.equal(agendaHourMarks.length, 16);
});

test('getPlanningWindow defaults a week to Monday through Sunday', () => {
  const window = getPlanningWindow('2026-07-01', 'week');

  assert.equal(window.startDate, '2026-06-29');
  assert.equal(window.endDate, '2026-07-05');
  assert.equal(window.startsAt, '2026-06-28T22:00:00.000Z');
  assert.equal(window.endsAt, '2026-07-05T22:00:00.000Z');
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

test('getNonPastPlanningDays keeps today and future days only', () => {
  const days = getPlanningWindow('2026-08-05', 'week').days;

  assert.deepEqual(getNonPastPlanningDays(days, '2026-08-05'), [
    { date: '2026-08-05' },
    { date: '2026-08-06' },
    { date: '2026-08-07' },
    { date: '2026-08-08' },
    { date: '2026-08-09' },
  ]);
});

test('movePlanningAnchor moves by the active view span', () => {
  assert.equal(movePlanningAnchor('2026-07-01', 'week', 1), '2026-07-08');
  assert.equal(movePlanningAnchor('2026-07-01', 'week', -1), '2026-06-24');
  assert.equal(movePlanningAnchor('2026-07-01', 'day', 1), '2026-07-02');
});

test('getSlotDateKey groups ISO slots by Europe/Paris date', () => {
  assert.equal(getSlotDateKey('2026-07-01T16:00:00.000Z'), '2026-07-01');
  assert.equal(getSlotDateKey('2026-07-01T22:30:00.000Z'), '2026-07-02');
});

test('getAgendaSlotPosition maps slots into the agenda hour rail', () => {
  const startsAt = '2026-07-01T08:00:00.000Z';
  const endsAt = '2026-07-01T09:30:00.000Z';

  assert.deepEqual(getAgendaSlotPosition(startsAt, endsAt, 8, 20), {
    top: '16.666666666666664%',
    height: '12.5%',
  });
});

test('getAgendaTimePosition maps Paris time and clamps outside the agenda', () => {
  assert.equal(
    getAgendaTimePosition('2026-07-01T10:30:00.000Z', 8, 20),
    '37.5%'
  );
  assert.equal(getAgendaTimePosition('2026-07-01T04:00:00.000Z', 8, 20), '0%');
  assert.equal(
    getAgendaTimePosition('2026-07-01T21:00:00.000Z', 8, 20),
    '100%'
  );
});
