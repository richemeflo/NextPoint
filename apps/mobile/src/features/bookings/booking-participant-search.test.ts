import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isPartnerSearchReady,
  normalizePartnerSearchQuery,
} from './booking-participant-search';

test('partner search normalizes accents, punctuation and whitespace', () => {
  assert.equal(normalizePartnerSearchQuery('  Élodie-Martin  '), 'elodie martin');
});

test('partner search requires at least two characters per entered name token', () => {
  assert.equal(isPartnerSearchReady(''), false);
  assert.equal(isPartnerSearchReady('e'), false);
  assert.equal(isPartnerSearchReady('El'), true);
  assert.equal(isPartnerSearchReady('Martin E'), false);
  assert.equal(isPartnerSearchReady('Martin El'), true);
});
