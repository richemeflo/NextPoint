import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildStudentHistoryCursorFilter,
  getStudentHistoryCursor,
  mergeStudentHistoryPages,
} from './student-history-pagination';

test('student history pagination uses occurrence time and id as a stable cursor', () => {
  const cursor = {
    occurredAt: '2026-08-16T10:00:00.000Z',
    id: '00000000-0000-0000-0000-000000000002',
  };

  assert.equal(
    buildStudentHistoryCursorFilter(cursor),
    'occurred_at.lt.2026-08-16T10:00:00.000Z,and(occurred_at.eq.2026-08-16T10:00:00.000Z,id.lt.00000000-0000-0000-0000-000000000002)',
  );
});

test('student history pagination resumes after the last raw event', () => {
  assert.deepEqual(
    getStudentHistoryCursor([
      { occurredAt: '2026-08-16T11:00:00.000Z', id: 'newer' },
      { occurredAt: '2026-08-16T10:00:00.000Z', id: 'older' },
    ]),
    { occurredAt: '2026-08-16T10:00:00.000Z', id: 'older' },
  );
  assert.equal(getStudentHistoryCursor([]), null);
});

test('student history pages are appended without duplicates', () => {
  assert.deepEqual(
    mergeStudentHistoryPages(
      [
        { id: 'first', value: 1 },
        { id: 'cursor', value: 2 },
      ],
      [
        { id: 'cursor', value: 20 },
        { id: 'older', value: 3 },
      ],
    ),
    [
      { id: 'first', value: 1 },
      { id: 'cursor', value: 2 },
      { id: 'older', value: 3 },
    ],
  );
});
