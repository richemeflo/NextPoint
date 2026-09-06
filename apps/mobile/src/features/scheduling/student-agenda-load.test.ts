import assert from 'node:assert/strict';
import test from 'node:test';

import { isStudentAgendaDependencyReady } from './student-agenda-load';

test('student agenda accepts a successfully loaded dependency', () => {
  assert.equal(isStudentAgendaDependencyReady({ ok: true }), true);
});

test('student agenda fails when a required dependency cannot be loaded', () => {
  assert.equal(isStudentAgendaDependencyReady({ ok: false }), false);
});
