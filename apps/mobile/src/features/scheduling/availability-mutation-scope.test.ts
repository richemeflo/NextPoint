import assert from 'node:assert/strict';
import test from 'node:test';

import { canOfferAvailabilitySeriesScope } from './availability-mutation-scope';

test('offers a scope choice for a fully available recurring series', () => {
  assert.equal(
    canOfferAvailabilitySeriesScope(
      { recurrenceType: 'weekly' },
      [{ status: 'available' }, { status: 'available' }]
    ),
    true
  );
});

test('applies a one-off availability directly to its occurrence', () => {
  assert.equal(
    canOfferAvailabilitySeriesScope(
      { recurrenceType: 'none' },
      [{ status: 'available' }]
    ),
    false
  );
});

test('does not offer the full series when one occurrence is blocked', () => {
  assert.equal(
    canOfferAvailabilitySeriesScope(
      { recurrenceType: 'daily' },
      [{ status: 'available' }, { status: 'booked' }]
    ),
    false
  );
});

test('does not infer a series when its range or occurrences are missing', () => {
  assert.equal(
    canOfferAvailabilitySeriesScope(null, [{ status: 'available' }]),
    false
  );
  assert.equal(
    canOfferAvailabilitySeriesScope({ recurrenceType: 'weekly' }, []),
    false
  );
});
