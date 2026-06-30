import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { PublicCoachCard } from '@/features/coaches/public-coach-card';
import { PublishedPricingList } from '@/features/pricing/published-pricing-list';
import { StudentAgenda } from '@/features/scheduling/student-agenda';
import { useTranslation } from '@/i18n';

export default function EleveHomeScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.eleveLabel')}
            </ThemedText>
            <ThemedText type="title">{t('studentHome.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('studentHome.subtitle')}
            </ThemedText>
          </View>
          <PublishedPricingList />
          <StudentAgenda />
          <PublicCoachCard />
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    maxWidth: 720,
    gap: Spacing.two,
  },
});
