import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canMarkNotificationRead,
  getNotificationReadState,
  pushPreferenceSchema,
  resolveNotificationLink,
} from './notification';

test('notification read state is derived from persisted readAt', () => {
  assert.equal(getNotificationReadState(null), 'unread');
  assert.equal(
    getNotificationReadState('2026-06-30T10:00:00.000Z'),
    'read'
  );
});

test('only the recipient can mark a notification as read', () => {
  assert.equal(
    canMarkNotificationRead({
      recipientId: 'user-1',
      actorId: 'user-1',
      readAt: null,
    }),
    true
  );
  assert.equal(
    canMarkNotificationRead({
      recipientId: 'user-1',
      actorId: 'user-2',
      readAt: null,
    }),
    false
  );
});

test('notification booking links resolve to the role surface', () => {
  assert.equal(
    resolveNotificationLink(
      { linkType: 'booking', linkId: 'booking-1' },
      'coach'
    ),
    '/coach'
  );
  assert.equal(
    resolveNotificationLink(
      { linkType: 'booking', linkId: 'booking-1' },
      'eleve'
    ),
    '/eleve/planning'
  );
  assert.equal(resolveNotificationLink({ linkType: null, linkId: null }, 'coach'), null);
});

test('push preference accepts refusals without a token', () => {
  assert.deepEqual(
    pushPreferenceSchema.parse({
      permissionStatus: 'denied',
      provider: 'none',
      token: null,
    }),
    {
      permissionStatus: 'denied',
      provider: 'none',
      token: null,
    }
  );
});

test('push preference accepts a token when one is available', () => {
  assert.deepEqual(
    pushPreferenceSchema.parse({
      permissionStatus: 'granted',
      provider: 'expo',
      deviceId: 'ios-device',
      token: 'ExponentPushToken[fixture]',
    }),
    {
      permissionStatus: 'granted',
      provider: 'expo',
      deviceId: 'ios-device',
      token: 'ExponentPushToken[fixture]',
    }
  );
});
