import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type Status =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'pendingActivation'
  | 'confirmed'
  | 'refused'
  | 'expired'
  | 'cancelled'
  | 'modified'
  | 'exhausted'
  | 'suspended'
  | 'deleted';

const statusTokens: Record<Status, { surface: ThemeColor; text: ThemeColor }> = {
  active: { surface: 'successSurface', text: 'success' },
  inactive: { surface: 'warningSurface', text: 'warning' },
  pending: { surface: 'warningSurface', text: 'warning' },
  pendingActivation: { surface: 'warningSurface', text: 'warning' },
  confirmed: { surface: 'successSurface', text: 'success' },
  refused: { surface: 'errorSurface', text: 'error' },
  expired: { surface: 'warningSurface', text: 'warning' },
  cancelled: { surface: 'errorSurface', text: 'error' },
  modified: { surface: 'warningSurface', text: 'warning' },
  exhausted: { surface: 'warningSurface', text: 'warning' },
  suspended: { surface: 'warningSurface', text: 'warning' },
  deleted: { surface: 'errorSurface', text: 'error' },
};

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tokens = statusTokens[status];
  const labelKey = `status.${status}` as TranslationKey;

  return (
    <View style={[styles.badge, { backgroundColor: theme[tokens.surface] }]}>
      <ThemedText type="smallBold" themeColor={tokens.text} style={styles.text}>
        {t(labelKey)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  text: {
    textTransform: 'uppercase',
  },
});
