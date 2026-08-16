import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSanitizedStudentActivationPath,
  getStudentActivationAllowedHttpsOrigins,
  parseStudentActivationUrl,
  studentActivationScheme,
} from './student-activation-link';

const productionPolicy = {
  allowedHttpsOrigins: ['https://app.nextpoint.example'],
};

test('student activation reads a token only from a typed URL fragment', () => {
  assert.equal(
    parseStudentActivationUrl(
      'https://app.nextpoint.example/activate-student#token=secret&type=student_activation',
      productionPolicy
    ),
    'secret'
  );
  assert.equal(
    parseStudentActivationUrl(
      'https://app.nextpoint.example/activate-student?token=legacy',
      productionPolicy
    ),
    null
  );
});

test('student activation supports only the unique fallback scheme', () => {
  assert.equal(
    parseStudentActivationUrl(
      `${studentActivationScheme}://activate-student#token=secret&type=student_activation`,
      productionPolicy
    ),
    'secret'
  );
  assert.equal(
    parseStudentActivationUrl(
      'mobile://activate-student#token=secret&type=student_activation',
      productionPolicy
    ),
    null
  );
});

test('student activation rejects untrusted origins and paths', () => {
  assert.equal(
    parseStudentActivationUrl(
      'https://attacker.example/activate-student#token=secret&type=student_activation',
      productionPolicy
    ),
    null
  );
  assert.equal(
    parseStudentActivationUrl(
      'https://app.nextpoint.example/other#token=secret&type=student_activation',
      productionPolicy
    ),
    null
  );
});

test('student activation allows local callbacks only in development', () => {
  const url =
    'http://localhost:8081/activate-student#token=secret&type=student_activation';
  assert.equal(parseStudentActivationUrl(url, productionPolicy), null);
  assert.equal(
    parseStudentActivationUrl(url, {
      allowedHttpsOrigins: [],
      allowDevelopmentUrls: true,
    }),
    'secret'
  );
});

test('student activation sanitizes secrets from browser history', () => {
  assert.equal(
    getSanitizedStudentActivationPath(
      'https://app.nextpoint.example/activate-student#token=secret&type=student_activation'
    ),
    '/activate-student'
  );
  assert.equal(
    getSanitizedStudentActivationPath(
      'https://app.nextpoint.example/activate-student?token=legacy&locale=fr'
    ),
    '/activate-student?locale=fr'
  );
  assert.equal(getSanitizedStudentActivationPath('not-a-url'), null);
});

test('student activation normalizes configured HTTPS origins', () => {
  assert.deepEqual(
    getStudentActivationAllowedHttpsOrigins(
      'https://app.nextpoint.example/activate-student',
      'https://app.nextpoint.example',
      'http://localhost:8081'
    ),
    ['https://app.nextpoint.example']
  );
});
