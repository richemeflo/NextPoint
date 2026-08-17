import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterPricingStudentOptions,
  updateStudentSelection,
} from './pricing-student-search';

const students = [
  { value: '1', label: 'Élodie Martin' },
  { value: '2', label: 'Marc Durand' },
  { value: '3', label: 'Marie Dupont' },
];

test('pricing student search matches names without accent or case sensitivity', () => {
  assert.deepEqual(
    filterPricingStudentOptions(students, 'ELODIE').map(({ value }) => value),
    ['1']
  );
  assert.deepEqual(
    filterPricingStudentOptions(students, 'mar').map(({ value }) => value),
    ['1', '2', '3']
  );
});

test('pricing student search waits for a name and returns no false match', () => {
  assert.deepEqual(filterPricingStudentOptions(students, '   '), []);
  assert.deepEqual(filterPricingStudentOptions(students, 'Camille'), []);
});

test('student selection replaces the current student when only one is allowed', () => {
  assert.deepEqual(updateStudentSelection(['1'], '2', 1), ['2']);
  assert.deepEqual(updateStudentSelection(['1'], '1', 1), []);
});

test('student selection respects participant limits', () => {
  assert.deepEqual(updateStudentSelection(['1'], '2', 2), ['1', '2']);
  assert.deepEqual(updateStudentSelection(['1', '2'], '3', 2), ['1', '2']);
  assert.deepEqual(updateStudentSelection(['1', '2'], '2', 2), ['1']);
});
