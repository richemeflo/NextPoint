import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { BottomTabInset, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

const metrics = [
  { value: '4', labelKey: 'home.metricRequests' },
  { value: '18', labelKey: 'home.metricStudents' },
  { value: '12', labelKey: 'home.metricSlots' },
] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.hero}>
            <AnimatedIcon />
            <View style={styles.heroCopy}>
              <ThemedText type="smallBold" themeColor="primary">
                {t('home.eyebrow')}
              </ThemedText>
              <ThemedText type="title" style={styles.title}>
                {t('home.title')}
              </ThemedText>
              <ThemedText type="default" themeColor="textMuted" style={styles.subtitle}>
                {t('home.subtitle')}
              </ThemedText>
            </View>
            <View style={styles.actions}>
              <Button label={t('home.primaryAction')} />
              <Button label={t('home.secondaryAction')} variant="secondary" />
            </View>
          </View>

          <View style={styles.metricGrid}>
            {metrics.map((metric) => (
              <Card key={metric.labelKey} style={styles.metricCard}>
                <ThemedText type="subtitle" themeColor="primary">
                  {metric.value}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t(metric.labelKey)}
                </ThemedText>
              </Card>
            ))}
          </View>

          <Card elevated style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewCopy}>
                <ThemedText type="smallBold" themeColor="secondary">
                  {t('home.previewTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('home.previewDescription')}
                </ThemedText>
              </View>
              <StatusBadge status="pending" />
            </View>
            <TextField label={t('home.formLabel')} placeholder={t('home.formPlaceholder')} />
            <Feedback
              title={t('home.feedbackTitle')}
              message={t('home.feedbackMessage')}
              tone="success"
            />
          </Card>

          <View style={[styles.clayLine, { backgroundColor: theme.primary }]} />
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.five,
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Platform.select({ web: Spacing.seven, default: Spacing.four }),
    gap: Spacing.five,
  },
  hero: {
    gap: Spacing.four,
  },
  heroCopy: {
    gap: Spacing.three,
  },
  title: {
    maxWidth: 760,
  },
  subtitle: {
    maxWidth: 640,
  },
  actions: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    gap: Spacing.three,
    alignItems: Platform.select({ web: 'flex-start', default: 'stretch' }),
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricCard: {
    minWidth: 160,
    flex: 1,
    gap: Spacing.one,
  },
  previewCard: {
    gap: Spacing.four,
  },
  previewHeader: {
    flexDirection: Platform.select({ web: 'row', default: 'column' }),
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  previewCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  clayLine: {
    height: Spacing.one,
    borderRadius: Radii.small,
    opacity: 0.86,
  },
});
