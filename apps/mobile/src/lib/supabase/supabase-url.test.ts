import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveSupabaseUrl } from './supabase-url';

test('web uses its dedicated Supabase URL when configured', () => {
  assert.equal(
    resolveSupabaseUrl({
      defaultUrl: 'http://192.168.1.32:55421',
      platform: 'web',
      webUrl: 'http://127.0.0.1:55421',
    }),
    'http://127.0.0.1:55421'
  );
});

test('native platforms retain the device-accessible Supabase URL', () => {
  assert.equal(
    resolveSupabaseUrl({
      defaultUrl: 'http://192.168.1.32:55421',
      platform: 'android',
      webUrl: 'http://127.0.0.1:55421',
    }),
    'http://192.168.1.32:55421'
  );
});

test('web falls back when its dedicated URL is invalid', () => {
  assert.equal(
    resolveSupabaseUrl({
      defaultUrl: 'https://project.supabase.co',
      platform: 'web',
      webUrl: 'not-a-url',
    }),
    'https://project.supabase.co'
  );
});
