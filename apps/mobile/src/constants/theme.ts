import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  clay: {
    50: '#FFF4ED',
    100: '#FFE4D1',
    200: '#FFC6A0',
    300: '#F4A16B',
    400: '#E17A42',
    500: '#C65A2E',
    600: '#A94B24',
    700: '#873C1F',
    800: '#662D18',
    900: '#451F12',
  },
  rgGreen: {
    50: '#EEF6F3',
    100: '#D6E8E2',
    200: '#A9CEC1',
    300: '#7EB4A1',
    400: '#5F9B89',
    500: '#2F5D50',
    600: '#284D43',
    700: '#203E36',
    800: '#182E29',
    900: '#101F1C',
  },
} as const;

export const Colors = {
  light: {
    primary: '#C65A2E',
    primaryHover: '#A94B24',
    secondary: '#2F5D50',
    background: '#F5F0E8',
    surface: '#FCFAF7',
    surfaceElevated: '#FFF4ED',
    backgroundElement: '#FCFAF7',
    backgroundSelected: '#FFE4D1',
    border: '#DDD2C3',
    text: '#232323',
    textMuted: '#6E655E',
    textSecondary: '#6E655E',
    success: '#4C8B5F',
    warning: '#D89034',
    error: '#C7483D',
    successSurface: '#EEF6F3',
    warningSurface: '#FFF4ED',
    errorSurface: '#FFE4D1',
  },
  dark: {
    primary: '#E17A42',
    primaryHover: '#F08C56',
    secondary: '#5F9B89',
    background: '#141210',
    surface: '#1E1B18',
    surfaceElevated: '#27231F',
    backgroundElement: '#1E1B18',
    backgroundSelected: '#3A342E',
    border: '#3A342E',
    text: '#F4F0EA',
    textMuted: '#B6ACA2',
    textSecondary: '#B6ACA2',
    success: '#69B27C',
    warning: '#E6A64A',
    error: '#E06A5E',
    successSurface: '#182E29',
    warningSurface: '#451F12',
    errorSurface: '#662D18',
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type Theme = (typeof Colors)[ThemeName];
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radii = {
  small: 6,
  medium: 8,
  large: 12,
} as const;

const StyleSheetHairlineWidth = 1;

export const BorderWidth = {
  hairline: StyleSheetHairlineWidth,
  regular: 1,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 960;
