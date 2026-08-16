import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildNotificationCursorFilter,
  getNotificationCursor,
  mergeNotificationPages,
} from './notification-pagination';

test('notification pagination uses creation time and id as a stable cursor', () => {
  const cursor = {
    createdAt: '2026-08-16T10:00:00.000Z',
    id: '00000000-0000-0000-0000-000000000002',
  };

  assert.equal(
    buildNotificationCursorFilter(cursor),
    'created_at.lt.2026-08-16T10:00:00.000Z,and(created_at.eq.2026-08-16T10:00:00.000Z,id.lt.00000000-0000-0000-0000-000000000002)'
  );
});

test('notification pagination resumes after the last rendered item', () => {
  assert.deepEqual(
    getNotificationCursor([
      { createdAt: '2026-08-16T11:00:00.000Z', id: 'newer' },
      { createdAt: '2026-08-16T10:00:00.000Z', id: 'older' },
    ]),
    { createdAt: '2026-08-16T10:00:00.000Z', id: 'older' }
  );
  assert.equal(getNotificationCursor([]), null);
});

test('notification pages are appended without duplicating an existing item', () => {
  assert.deepEqual(
    mergeNotificationPages(
      [
        { id: 'first', value: 1 },
        { id: 'cursor', value: 2 },
      ],
      [
        { id: 'cursor', value: 20 },
        { id: 'older', value: 3 },
      ]
    ),
    [
      { id: 'first', value: 1 },
      { id: 'cursor', value: 2 },
      { id: 'older', value: 3 },
    ]
  );
});
