import assert from 'node:assert/strict';
import test from 'node:test';

import { isValidReminderTime } from './email-notification-preferences';

test('weekly reminder time accepts only a strict 24-hour HH:MM value', () => {
  assert.equal(isValidReminderTime('00:00'), true);
  assert.equal(isValidReminderTime('09:05'), true);
  assert.equal(isValidReminderTime('23:59'), true);
  assert.equal(isValidReminderTime('24:00'), false);
  assert.equal(isValidReminderTime('9:05'), false);
  assert.equal(isValidReminderTime('12:60'), false);
  assert.equal(isValidReminderTime('12:30:00'), false);
});
