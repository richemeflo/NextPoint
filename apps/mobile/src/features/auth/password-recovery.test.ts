import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getPasswordRecoveryAllowedHttpsOrigins,
  getPasswordRecoveryRedirectUrl,
  getSanitizedPasswordRecoveryPath,
  parsePasswordRecoveryUrl,
  passwordRecoveryScheme,
} from './password-recovery';

const productionPolicy = {
  allowedHttpsOrigins: ['https://app.nextpoint.example'],
};

test('password recovery removes a PKCE code and preserves safe parameters', () => {
  assert.equal(
    getSanitizedPasswordRecoveryPath(
      'https://app.example/reset-password?code=recovery-code&locale=fr'
    ),
    '/reset-password?locale=fr'
  );
});

test('password recovery removes implicit tokens from the URL fragment', () => {
  assert.equal(
    getSanitizedPasswordRecoveryPath(
      'https://app.example/reset-password#access_token=access&refresh_token=refresh&type=recovery'
    ),
    '/reset-password'
  );
});

test('password recovery preserves an unrelated URL fragment', () => {
  assert.equal(
    getSanitizedPasswordRecoveryPath(
      'https://app.example/reset-password?locale=fr#help'
    ),
    '/reset-password?locale=fr#help'
  );
  assert.equal(getSanitizedPasswordRecoveryPath('not a url'), null);
});

test('password recovery prefers the configured HTTPS callback', () => {
  assert.equal(
    getPasswordRecoveryRedirectUrl({
      fallbackUrl: `${passwordRecoveryScheme}://reset-password`,
      publicAppUrl: 'https://app.nextpoint.example',
    }),
    'https://app.nextpoint.example/reset-password'
  );
  assert.equal(
    getPasswordRecoveryRedirectUrl({
      fallbackUrl: `${passwordRecoveryScheme}://reset-password`,
      publicAppUrl: 'http://insecure.example',
    }),
    `${passwordRecoveryScheme}://reset-password`
  );
});

test('password recovery normalizes only secure application origins', () => {
  assert.deepEqual(
    getPasswordRecoveryAllowedHttpsOrigins(
      'https://app.nextpoint.example/reset-password',
      'https://app.nextpoint.example',
      'http://localhost:8081',
      'not-a-url'
    ),
    ['https://app.nextpoint.example']
  );
});

test('password recovery accepts PKCE codes from verified callbacks', () => {
  assert.equal(
    parsePasswordRecoveryUrl(
      'https://app.nextpoint.example/reset-password?code=recovery-code',
      productionPolicy
    ),
    'recovery-code'
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      `${passwordRecoveryScheme}://reset-password?code=fallback-code`,
      productionPolicy
    ),
    'fallback-code'
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      `${passwordRecoveryScheme}:///reset-password?code=triple-slash-code`,
      productionPolicy
    ),
    'triple-slash-code'
  );
});

test('password recovery accepts explicit development callbacks only in development', () => {
  const developmentPolicy = {
    allowedHttpsOrigins: [],
    allowDevelopmentUrls: true,
  };

  assert.equal(
    parsePasswordRecoveryUrl(
      'exp://192.168.1.10:8081/--/reset-password?code=expo-code',
      developmentPolicy
    ),
    'expo-code'
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      'http://localhost:8081/reset-password?code=web-code',
      developmentPolicy
    ),
    'web-code'
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      'http://localhost:8081/reset-password?code=web-code',
      productionPolicy
    ),
    null
  );
});

test('password recovery rejects implicit tokens and untrusted callbacks', () => {
  assert.equal(
    parsePasswordRecoveryUrl(
      `${passwordRecoveryScheme}://reset-password#access_token=access&refresh_token=refresh&type=recovery`,
      productionPolicy
    ),
    null
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      'mobile://reset-password?code=legacy-code',
      productionPolicy
    ),
    null
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      'https://attacker.example/reset-password?code=stolen-code',
      productionPolicy
    ),
    null
  );
  assert.equal(
    parsePasswordRecoveryUrl(
      'https://app.nextpoint.example/other-path?code=recovery-code',
      productionPolicy
    ),
    null
  );
});

test('password recovery rejects unrelated and malformed links', () => {
  assert.equal(
    parsePasswordRecoveryUrl(
      `${passwordRecoveryScheme}://reset-password`,
      productionPolicy
    ),
    null
  );
  assert.equal(parsePasswordRecoveryUrl('not a url', productionPolicy), null);
});
