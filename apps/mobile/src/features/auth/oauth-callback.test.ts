import assert from 'node:assert/strict';
import test from 'node:test';

import { getOAuthCode } from './oauth-callback';

test('accepts a code only from the expected OAuth callback', () => {
  const expected = 'com.nextpoint.app://google-auth-callback';
  assert.equal(
    getOAuthCode(`${expected}?code=valid-code`, expected),
    'valid-code'
  );
  assert.equal(
    getOAuthCode('https://attacker.test/google-auth-callback?code=stolen', expected),
    null
  );
  assert.equal(getOAuthCode(`${expected}?error=access_denied`, expected), null);
});
