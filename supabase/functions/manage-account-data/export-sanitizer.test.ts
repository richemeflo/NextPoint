import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isAccountExportKeyAllowed,
  sanitizeAccountExport,
} from './export-sanitizer.ts';

test('rejects snake_case and camelCase identifiers', () => {
  for (const key of [
    'id',
    'id_token',
    'user_id',
    'booking_ids',
    'userId',
    'participantIds',
    'created_by',
    'updatedBy',
  ]) {
    assert.equal(isAccountExportKeyAllowed(key), false, key);
  }

  assert.equal(isAccountExportKeyAllowed('email'), true);
  assert.equal(isAccountExportKeyAllowed('created_at'), true);
});

test('recursively removes identifiers and authentication secrets', () => {
  const sanitized = sanitizeAccountExport({
    id: 'f5fc418b-4aed-44fa-8516-3d863359da3c',
    email: 'student@example.com',
    bookingId: '9fbc55e4-12bd-47ef-a6f6-33f231f38a88',
    metadata: {
      participant_ids: ['e43141af-fca7-42e8-b632-8940f939eb45'],
      access_token: 'secret-token',
      refreshToken: 'secret-refresh-token',
      device_id: 'phone-1',
      title: 'Cours collectif',
      reference: 'f5fc418b-4aed-44fa-8516-3d863359da3c',
    },
  });

  assert.deepEqual(sanitized, {
    email: 'student@example.com',
    metadata: {
      title: 'Cours collectif',
      reference: '[redacted]',
    },
  });
});
