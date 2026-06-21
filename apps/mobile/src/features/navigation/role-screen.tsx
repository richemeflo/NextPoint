import type { AppRole } from '@nextpoint/shared';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export function RoleScreen({
  role,
  titleKey,
}: {
  role: AppRole;
  titleKey: TranslationKey;
}) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t(role === 'coach' ? 'role.coachLabel' : 'role.eleveLabel')}
            </ThemedText>
            <ThemedText type="title">{t(titleKey)}</ThemedText>
          </View>
          <Card elevated style={styles.card}>
            <Feedback
              message={t('role.screenProtectedBody')}
              title={t('role.screenProtectedTitle')}
              tone="success"
            />
            <ThemedText type="small" themeColor="textMuted">
              {t('role.screenPlaceholder')}
            </ThemedText>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.three,
  },
});
