import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getLessonPackConsumeDisabledReason,
  replaceConsumedLessonPack,
  type LessonPackStateItem,
} from './lesson-pack-state';

const activePack: LessonPackStateItem = {
  id: 'pack-active',
  includedSessions: 5,
  usedSessions: 2,
  remainingSessions: 3,
  status: 'active',
};

test('active packs with remaining sessions can be consumed', () => {
  assert.equal(getLessonPackConsumeDisabledReason(activePack), null);
});

test('exhausted or empty packs cannot be consumed', () => {
  assert.equal(
    getLessonPackConsumeDisabledReason({
      ...activePack,
      usedSessions: 5,
      remainingSessions: 0,
      status: 'exhausted',
    }),
    'no_remaining_session'
  );
  assert.equal(
    getLessonPackConsumeDisabledReason({
      ...activePack,
      remainingSessions: 0,
      status: 'active',
    }),
    'no_remaining_session'
  );
});

test('consumption replaces only the updated pack and preserves ordering', () => {
  const archivedPack: LessonPackStateItem = {
    ...activePack,
    id: 'pack-archived',
    status: 'exhausted',
    remainingSessions: 0,
  };
  const consumedPack: LessonPackStateItem = {
    ...activePack,
    usedSessions: 3,
    remainingSessions: 2,
  };

  assert.deepEqual(
    replaceConsumedLessonPack([activePack, archivedPack], consumedPack),
    [consumedPack, archivedPack]
  );
});
