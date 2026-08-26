import type { ThemeName } from '@/constants/theme';

export const themePreferences = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof themePreferences)[number];

export function isThemePreference(value: unknown): value is ThemePreference {
  return themePreferences.includes(value as ThemePreference);
}

export function resolveThemeName(
  preference: ThemePreference,
  systemColorScheme: string | null | undefined
): ThemeName {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}
