import assert from 'node:assert/strict';
import test from 'node:test';

import { translate } from './translate';
import type { TranslationKey } from './translations';

test('translate returns an unknown runtime key instead of throwing', () => {
  const unknownRuntimeKey = 'status.unexpected' as TranslationKey;

  assert.equal(translate(unknownRuntimeKey, 'fr'), unknownRuntimeKey);
});
