import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isThemePreference,
  resolveThemeName,
} from './theme-preference';

test('the default preference follows the browser or system theme', () => {
  assert.equal(resolveThemeName('system', 'light'), 'light');
  assert.equal(resolveThemeName('system', 'dark'), 'dark');
});

test('an unavailable system preference safely falls back to light', () => {
  assert.equal(resolveThemeName('system', null), 'light');
  assert.equal(resolveThemeName('system', 'unspecified'), 'light');
});

test('an explicit preference overrides the browser or system theme', () => {
  assert.equal(resolveThemeName('light', 'dark'), 'light');
  assert.equal(resolveThemeName('dark', 'light'), 'dark');
});

test('only supported preferences can be restored from storage', () => {
  assert.equal(isThemePreference('system'), true);
  assert.equal(isThemePreference('light'), true);
  assert.equal(isThemePreference('dark'), true);
  assert.equal(isThemePreference('browser'), false);
  assert.equal(isThemePreference(null), false);
});
