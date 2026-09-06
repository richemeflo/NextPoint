import { useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ResponsivePageTitle } from '@/components/ui/responsive-page-title';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { PublicCoachCard } from '@/features/coaches/public-coach-card';
import { PublishedPricingList } from '@/features/pricing/published-pricing-list';
import { StudentAgenda } from '@/features/scheduling/student-agenda';
import { useTranslation } from '@/i18n';

export default function EleveHomeScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const availabilityAgendaRef = useRef<View>(null);

  const scrollToAvailabilityAgenda = () => {
    const scrollView = scrollRef.current;
    const content = contentRef.current;
    const target = availabilityAgendaRef.current;
    if (!scrollView || !content || !target) return;

    target.measureLayout(
      content,
      (_x, y) => {
        scrollView.scrollTo({
          animated: true,
          y: Math.max(0, y - Spacing.two),
        });
      },
      () => undefined
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent}>
        <View ref={contentRef} style={styles.content}>
          <View style={styles.heading}>
            <ResponsivePageTitle
              context={t('role.eleveLabel')}
              title={t('studentHome.title')}
            />
            {isMobile ? null : (
              <ThemedText type="default" themeColor="textMuted">
                {t('studentHome.subtitle')}
              </ThemedText>
            )}
          </View>
          <PublishedPricingList audience="student" />
          <StudentAgenda
            availabilityAgendaRef={availabilityAgendaRef}
            onAvailabilityDateSelected={
              isMobile ? scrollToAvailabilityAgenda : undefined
            }
          />
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
