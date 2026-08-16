import assert from 'node:assert/strict';
import test from 'node:test';

import { getOptionGroupKeyboardTarget } from './option-group-navigation';

test('option group arrows wrap and skip disabled options', () => {
  const enabled = [true, false, true];

  assert.equal(getOptionGroupKeyboardTarget(enabled, 0, 'ArrowRight'), 2);
  assert.equal(getOptionGroupKeyboardTarget(enabled, 2, 'ArrowRight'), 0);
  assert.equal(getOptionGroupKeyboardTarget(enabled, 0, 'ArrowLeft'), 2);
});

test('option group Home and End target the first and last enabled options', () => {
  const enabled = [false, true, true, false];

  assert.equal(getOptionGroupKeyboardTarget(enabled, 2, 'Home'), 1);
  assert.equal(getOptionGroupKeyboardTarget(enabled, 1, 'End'), 2);
});

test('option group ignores unrelated keys and empty groups', () => {
  assert.equal(getOptionGroupKeyboardTarget([true], 0, 'Enter'), null);
  assert.equal(getOptionGroupKeyboardTarget([false], 0, 'ArrowRight'), null);
});
