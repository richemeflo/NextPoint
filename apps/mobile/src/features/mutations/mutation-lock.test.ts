import assert from 'node:assert/strict';
import test from 'node:test';

import {
  acquireMutationLock,
  releaseMutationLock,
  type MutationLock,
} from './mutation-lock';

test('a mutation lock rejects a second synchronous acquisition', () => {
  const lock: MutationLock = { current: false };

  assert.equal(acquireMutationLock(lock), true);
  assert.equal(acquireMutationLock(lock), false);

  releaseMutationLock(lock);
  assert.equal(acquireMutationLock(lock), true);
});
