import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canAccessCoachMessageThread,
  coachMessageReplySchema,
  isCoachMessageThreadUnread,
  messageBodyMaxLength,
} from './messaging';

const coachId = '11111111-1111-4111-8111-111111111111';
const threadId = '22222222-2222-4222-8222-222222222222';

test('coachMessageReplySchema trims a valid contextual reply', () => {
  const result = coachMessageReplySchema.parse({
    threadId,
    body: '  Rendez-vous confirmé sur ce créneau.  ',
  });

  assert.equal(result.body, 'Rendez-vous confirmé sur ce créneau.');
  assert.equal(result.threadId, threadId);
});

test('coachMessageReplySchema refuses empty and oversized replies', () => {
  assert.equal(
    coachMessageReplySchema.safeParse({ threadId, body: '   ' }).success,
    false
  );
  assert.equal(
    coachMessageReplySchema.safeParse({
      threadId,
      body: 'a'.repeat(messageBodyMaxLength + 1),
    }).success,
    false
  );
});

test('coach message access requires the owner coach and an accessible context', () => {
  assert.equal(
    canAccessCoachMessageThread({
      actorId: coachId,
      actorRole: 'coach',
      coachId,
      contextAccessible: true,
    }),
    true
  );
  assert.equal(
    canAccessCoachMessageThread({
      actorId: coachId,
      actorRole: 'eleve',
      coachId,
      contextAccessible: true,
    }),
    false
  );
  assert.equal(
    canAccessCoachMessageThread({
      actorId: '33333333-3333-4333-8333-333333333333',
      actorRole: 'coach',
      coachId,
      contextAccessible: true,
    }),
    false
  );
  assert.equal(
    canAccessCoachMessageThread({
      actorId: coachId,
      actorRole: 'coach',
      coachId,
      contextAccessible: false,
    }),
    false
  );
});

test('thread is unread only when its latest message is newer than the read state', () => {
  assert.equal(
    isCoachMessageThreadUnread({
      coachReadAt: null,
      lastMessageAt: '2026-07-13T12:00:00.000Z',
    }),
    true
  );
  assert.equal(
    isCoachMessageThreadUnread({
      coachReadAt: '2026-07-13T12:01:00.000Z',
      lastMessageAt: '2026-07-13T12:00:00.000Z',
    }),
    false
  );
});
