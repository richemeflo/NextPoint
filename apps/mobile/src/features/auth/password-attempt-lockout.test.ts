import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPasswordAttemptBlockRemainingMs,
  getPasswordLockDurationMs,
  recordFailedPasswordAttempt,
  resetFailedPasswordAttempts,
  type PasswordAttemptStorage,
} from './password-attempt-lockout';

function createMemoryStorage(): PasswordAttemptStorage {
  const values = new Map<string, string>();

  return {
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      values.delete(key);
    },
  };
}

test('applies the progressive lock schedule with a 24 hour cap', () => {
  const minute = 60_000;

  assert.equal(getPasswordLockDurationMs(4), 0);
  assert.equal(getPasswordLockDurationMs(5), 5 * minute);
  assert.equal(getPasswordLockDurationMs(10), 15 * minute);
  assert.equal(getPasswordLockDurationMs(15), 30 * minute);
  assert.equal(getPasswordLockDurationMs(20), 60 * minute);
  assert.equal(getPasswordLockDurationMs(25), 120 * minute);
  assert.equal(getPasswordLockDurationMs(30), 240 * minute);
  assert.equal(getPasswordLockDurationMs(45), 24 * 60 * minute);
  assert.equal(getPasswordLockDurationMs(50), 24 * 60 * minute);
});

test('blocks after five failures and allows attempts after the delay', async () => {
  const storage = createMemoryStorage();
  const now = 1_800_000_000_000;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    assert.equal(await recordFailedPasswordAttempt(storage, now), 0);
  }

  assert.equal(await recordFailedPasswordAttempt(storage, now), 5 * 60_000);
  assert.equal(
    await getPasswordAttemptBlockRemainingMs(storage, now + 60_000),
    4 * 60_000
  );
  assert.equal(
    await getPasswordAttemptBlockRemainingMs(storage, now + 5 * 60_000),
    0
  );
});

test('successful authentication clears the failure history', async () => {
  const storage = createMemoryStorage();

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await recordFailedPasswordAttempt(storage, 1_800_000_000_000);
  }

  await resetFailedPasswordAttempts(storage);
  assert.equal(
    await getPasswordAttemptBlockRemainingMs(storage, 1_800_000_000_000),
    0
  );
  assert.equal(
    await recordFailedPasswordAttempt(storage, 1_800_000_000_000),
    0
  );
});

test('ignores corrupt persisted state', async () => {
  const storage = createMemoryStorage();
  await storage.setItem('nextpoint.password-attempt-lockout.v1', '{invalid');

  assert.equal(await getPasswordAttemptBlockRemainingMs(storage), 0);
  assert.equal(await recordFailedPasswordAttempt(storage), 0);
});
