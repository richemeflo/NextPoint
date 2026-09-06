import assert from 'node:assert/strict';
import test from 'node:test';

import type { PricingRate } from './pricing-service';
import { selectStudentPricingCatalog } from './student-pricing-catalog';

function rate(
  id: string,
  amountCents: number,
  applicabilityContexts: PricingRate['applicabilityContexts'] = []
): PricingRate {
  return {
    id,
    coachId: '10000000-0000-4000-8000-000000000001',
    label: id,
    amountCents,
    currency: 'EUR',
    durationMinutes: 90,
    lessonType: 'duo',
    isActive: true,
    applicabilityContexts,
    targetStudentIds: [],
    updatedAt: '2026-09-06T00:00:00.000Z',
  };
}

test('keeps only the cheaper student rate for the same lesson scope', () => {
  const catalog = selectStudentPricingCatalog([
    rate('Cours Duo 1h30', 3000),
    rate('Cours Duo 1h30 étudiant', 2800, ['student']),
  ]);

  assert.deepEqual(catalog.map(({ id }) => id), [
    'Cours Duo 1h30 étudiant',
  ]);
});

test('keeps distinct weekday and weekend minimum rates', () => {
  const catalog = selectStudentPricingCatalog([
    rate('Cours Duo 1h30', 3000),
    rate('Cours Duo 1h30 week-end', 2800, ['weekend']),
  ]);

  assert.deepEqual(
    catalog.map(({ id }) => id),
    ['Cours Duo 1h30', 'Cours Duo 1h30 week-end']
  );
});

test('prefers the tagged rate when equal prices share a scope', () => {
  const catalog = selectStudentPricingCatalog([
    rate('Cours Duo 1h30', 2800),
    rate('Cours Duo 1h30 étudiant', 2800, ['student']),
  ]);

  assert.deepEqual(catalog.map(({ id }) => id), [
    'Cours Duo 1h30 étudiant',
  ]);
});
