import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSanitizedPasswordRecoveryPath,
  parsePasswordRecoveryUrl,
} from './password-recovery';

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

test('password recovery accepts a PKCE callback code', () => {
  assert.deepEqual(
    parsePasswordRecoveryUrl('mobile://reset-password?code=recovery-code'),
    { kind: 'code', code: 'recovery-code' }
  );
});

test('password recovery accepts implicit recovery tokens', () => {
  assert.deepEqual(
    parsePasswordRecoveryUrl(
      'mobile://reset-password#access_token=access&refresh_token=refresh&type=recovery'
    ),
    { kind: 'tokens', accessToken: 'access', refreshToken: 'refresh' }
  );
});

test('password recovery rejects unrelated and malformed links', () => {
  assert.equal(
    parsePasswordRecoveryUrl(
      'mobile://reset-password#access_token=access&refresh_token=refresh&type=signup'
    ),
    null
  );
  assert.equal(parsePasswordRecoveryUrl('not a url'), null);
});
