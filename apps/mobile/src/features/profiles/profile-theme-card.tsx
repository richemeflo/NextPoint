import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  themePreferences,
  type ThemePreference,
} from '@/features/theme/theme-preference';
import { useThemePreference } from '@/features/theme/theme-preference-context';
import { useTranslation, type TranslationKey } from '@/i18n';

export function ProfileThemeCard() {
  const { preference, setPreference } = useThemePreference();
  const { t } = useTranslation();
  const options: { value: ThemePreference; label: string }[] =
    themePreferences.map((value) => ({
      value,
      label: t(`profile.theme.${value}` as TranslationKey),
    }));

  return (
    <Card elevated style={styles.card}>
      <ThemedText type="subtitle">{t('profile.themeTitle')}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('profile.themeBody')}
      </ThemedText>
      <ProfileOptionSelector
        label={t('profile.themeLabel')}
        onChange={setPreference}
        options={options}
        value={preference}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
});
