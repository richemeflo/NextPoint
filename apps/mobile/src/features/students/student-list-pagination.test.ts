import assert from 'node:assert/strict';
import test from 'node:test';

import { getStudentListPage } from './student-list-pagination';

test('student list pagination limits each page and keeps the final partial page', () => {
  const students = Array.from({ length: 23 }, (_, index) => index + 1);

  assert.deepEqual(getStudentListPage(students, 1).items, students.slice(0, 10));
  assert.deepEqual(getStudentListPage(students, 2).items, students.slice(10, 20));
  assert.deepEqual(getStudentListPage(students, 3), {
    currentPage: 3,
    items: [21, 22, 23],
    totalPages: 3,
  });
});

test('student list pagination clamps an obsolete page after filtering', () => {
  const page = getStudentListPage(['Alice', 'Bob'], 4);

  assert.deepEqual(page, {
    currentPage: 1,
    items: ['Alice', 'Bob'],
    totalPages: 1,
  });
});

test('student list pagination returns an empty first page for no result', () => {
  assert.deepEqual(getStudentListPage([], Number.NaN), {
    currentPage: 1,
    items: [],
    totalPages: 1,
  });
});
