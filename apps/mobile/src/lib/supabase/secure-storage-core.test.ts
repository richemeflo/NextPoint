import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSecureStorageAdapter,
  type AsyncStringStorage,
  type SecureStringStorage,
} from './secure-storage-core';

function createMemoryStores() {
  const legacyValues = new Map<string, string>();
  const secureValues = new Map<string, string>();
  const legacyStorage: AsyncStringStorage = {
    async getItem(key) {
      return legacyValues.get(key) ?? null;
    },
    async setItem(key, value) {
      legacyValues.set(key, value);
    },
    async removeItem(key) {
      legacyValues.delete(key);
    },
  };
  const secureStorage: SecureStringStorage = {
    async getItemAsync(key) {
      return secureValues.get(key) ?? null;
    },
    async setItemAsync(key, value) {
      secureValues.set(key, value);
    },
    async deleteItemAsync(key) {
      secureValues.delete(key);
    },
  };

  return { legacyStorage, legacyValues, secureStorage, secureValues };
}

test('secure storage chunks and reconstructs long sessions', async () => {
  const stores = createMemoryStores();
  const adapter = createSecureStorageAdapter(stores);
  const session = 'session-token-'.repeat(1_000);

  await adapter.setItem('sb-auth-token', session);

  assert.equal(await adapter.getItem('sb-auth-token'), session);
  assert.equal(stores.legacyValues.size, 0);
  assert.ok(stores.secureValues.size > 2);
});

test('secure storage migrates and removes an AsyncStorage session', async () => {
  const stores = createMemoryStores();
  stores.legacyValues.set('sb-auth-token', 'legacy-session');
  const adapter = createSecureStorageAdapter(stores);

  assert.equal(await adapter.getItem('sb-auth-token'), 'legacy-session');
  assert.equal(stores.legacyValues.has('sb-auth-token'), false);
  assert.equal(await adapter.getItem('sb-auth-token'), 'legacy-session');
});

test('secure storage removes native and legacy session material', async () => {
  const stores = createMemoryStores();
  const adapter = createSecureStorageAdapter(stores);
  await adapter.setItem('sb-auth-token', 'session');
  stores.legacyValues.set('sb-auth-token', 'stale-session');

  await adapter.removeItem('sb-auth-token');

  assert.equal(await adapter.getItem('sb-auth-token'), null);
  assert.equal(stores.legacyValues.size, 0);
  assert.equal(stores.secureValues.size, 0);
});
