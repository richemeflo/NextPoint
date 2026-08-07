import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getLessonPackAdjustmentDisabledReason,
  getLessonPackConsumptionDisabledReason,
  replaceAdjustedLessonPack,
  type LessonPackStateItem,
} from './lesson-pack-state';

const activePack: LessonPackStateItem = {
  id: 'pack-active',
  includedSessions: 5,
  usedSessions: 2,
  remainingSessions: 3,
  status: 'active',
};

test('exhausted or empty packs cannot be decreased', () => {
  assert.equal(
    getLessonPackAdjustmentDisabledReason(
      {
        ...activePack,
        usedSessions: 5,
        remainingSessions: 0,
        status: 'exhausted',
      },
      -1
    ),
    'no_remaining_session'
  );
  assert.equal(
    getLessonPackAdjustmentDisabledReason(
      {
        ...activePack,
        remainingSessions: 0,
        status: 'active',
      },
      -1
    ),
    'no_remaining_session'
  );
});

test('a lesson pack can gain one credit until its maximum', () => {
  assert.equal(getLessonPackAdjustmentDisabledReason(activePack, 1), null);
  assert.equal(
    getLessonPackAdjustmentDisabledReason(
      {
        ...activePack,
        includedSessions: 100,
        remainingSessions: 98,
      },
      1
    ),
    'maximum_included_sessions'
  );
});

test('decreasing a pack follows the remaining-session guard', () => {
  assert.equal(getLessonPackAdjustmentDisabledReason(activePack, -1), null);
});

test('a pack cannot be adjusted below one included lesson', () => {
  assert.equal(
    getLessonPackAdjustmentDisabledReason(
      {
        ...activePack,
        includedSessions: 1,
        usedSessions: 0,
        remainingSessions: 1,
      },
      -1
    ),
    'minimum_included_sessions'
  );
});

test('a pack at the maximum can still be decreased', () => {
  assert.equal(
    getLessonPackAdjustmentDisabledReason(
      {
        ...activePack,
        includedSessions: 100,
        remainingSessions: 98,
      },
      -1
    ),
    null
  );
});

test('consumption is allowed only while a lesson remains', () => {
  assert.equal(getLessonPackConsumptionDisabledReason(activePack), null);
  assert.equal(
    getLessonPackConsumptionDisabledReason({
      ...activePack,
      usedSessions: 5,
      remainingSessions: 0,
      status: 'exhausted',
    }),
    'no_remaining_session'
  );
});

test('an adjustment replaces only the updated pack and preserves ordering', () => {
  const archivedPack: LessonPackStateItem = {
    ...activePack,
    id: 'pack-archived',
    status: 'exhausted',
    remainingSessions: 0,
  };
  const adjustedPack: LessonPackStateItem = {
    ...activePack,
    includedSessions: 4,
    remainingSessions: 2,
  };

  assert.deepEqual(
    replaceAdjustedLessonPack([activePack, archivedPack], adjustedPack),
    [adjustedPack, archivedPack]
  );
});
