import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterAssociatedStudents,
  type StudentListFilters,
  type StudentListItem,
} from './student-list-filters';

type TestStudent = StudentListItem & {
  userId: string;
  phone: string | null;
};

const students: TestStudent[] = [
  {
    userId: '1',
    fullName: 'Élodie Martin',
    email: 'elodie@example.com',
    phone: '+33 6 00 00 00 01',
    padelLevel: 4,
    age: 17,
    sex: 'female',
  },
  {
    userId: '2',
    fullName: 'Marc Dupont',
    email: 'marc@example.com',
    phone: '+33 6 00 00 00 02',
    padelLevel: 7,
    age: 34,
    sex: 'male',
  },
  {
    userId: '3',
    fullName: 'Sofia Garcia',
    email: 'sofia@example.com',
    phone: '+33 6 00 00 00 03',
    padelLevel: 7,
    age: 42,
    sex: 'other',
  },
  {
    userId: '4',
    fullName: 'incomplete@example.com',
    email: 'incomplete@example.com',
    phone: null,
    padelLevel: null,
    age: null,
    sex: null,
  },
];

const emptyFilters: StudentListFilters = {
  query: '',
  level: null,
  minAge: 5,
  maxAge: 100,
  sex: null,
};

test('filterAssociatedStudents searches names without accent or case sensitivity', () => {
  const result = filterAssociatedStudents(students, {
    ...emptyFilters,
    query: 'elodie',
  });

  assert.deepEqual(result.map(({ userId }) => userId), ['1']);
});

test('filterAssociatedStudents combines level, age range and sex filters', () => {
  const result = filterAssociatedStudents(students, {
    query: '',
    level: 7,
    minAge: 30,
    maxAge: 39,
    sex: 'male',
  });

  assert.deepEqual(result.map(({ userId }) => userId), ['2']);
});

test('filterAssociatedStudents returns all students after reset', () => {
  assert.equal(filterAssociatedStudents(students, emptyFilters).length, 4);
});

test('filterAssociatedStudents includes both selected age boundaries', () => {
  const result = filterAssociatedStudents(students, {
    ...emptyFilters,
    minAge: 17,
    maxAge: 34,
  });

  assert.deepEqual(
    result.map(({ userId }) => userId),
    ['1', '2']
  );
});

test('filterAssociatedStudents keeps incomplete profiles visible and searchable', () => {
  assert.deepEqual(
    filterAssociatedStudents(students, emptyFilters).map(({ userId }) => userId),
    ['1', '2', '3', '4']
  );
  assert.deepEqual(
    filterAssociatedStudents(students, {
      ...emptyFilters,
      query: 'incomplete@',
    }).map(({ userId }) => userId),
    ['4']
  );
  assert.equal(
    filterAssociatedStudents(students, {
      ...emptyFilters,
      level: 1,
    }).some(({ userId }) => userId === '4'),
    false
  );
});
