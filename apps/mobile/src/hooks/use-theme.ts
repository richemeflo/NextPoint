/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useResolvedThemeName } from '@/features/theme/theme-preference-context';

export function useTheme() {
  return Colors[useResolvedThemeName()];
}
