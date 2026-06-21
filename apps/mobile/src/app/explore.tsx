import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { BottomTabInset, Colors, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n';

const swatches = [
  { color: Colors.light.primary, labelKey: 'foundation.token.primary' },
  { color: Colors.light.secondary, labelKey: 'foundation.token.secondary' },
  { color: Colors.light.background, labelKey: 'foundation.token.background' },
  { color: Colors.light.surface, labelKey: 'foundation.token.surface' },
  { color: Colors.dark.background, labelKey: 'foundation.token.darkBackground' },
  { color: Colors.dark.surfaceElevated, labelKey: 'foundation.token.darkSurface' },
] as const;

export default function FoundationsScreen() {
  const { t, locale } = useTranslation();

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('foundation.eyebrow')}
            </ThemedText>
            <ThemedText type="title">{t('foundation.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('foundation.subtitle')}
            </ThemedText>
          </View>

          <Card style={styles.section}>
            <ThemedText type="subtitle">{t('foundation.tokensTitle')}</ThemedText>
            <View style={styles.swatchGrid}>
              {swatches.map((swatch) => (
                <View key={swatch.labelKey} style={styles.swatchItem}>
                  <View style={[styles.swatch, { backgroundColor: swatch.color }]} />
                  <ThemedText type="small" themeColor="textMuted">
                    {t(swatch.labelKey)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>

          <View style={styles.grid}>
            <Card elevated style={styles.gridCard}>
              <ThemedText type="smallBold" themeColor="secondary">
                {t('foundation.themeTitle')}
              </ThemedText>
              <View style={styles.statusRow}>
                <StatusBadge status="confirmed" />
                <StatusBadge status="pending" />
                <StatusBadge status="refused" />
              </View>
            </Card>

            <Card elevated style={styles.gridCard}>
              <ThemedText type="smallBold" themeColor="secondary">
                {t('foundation.i18nTitle')}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('foundation.i18nBody')}
              </ThemedText>
              <ThemedText type="code" themeColor="primary">
                {locale.toUpperCase()}
              </ThemedText>
            </Card>
          </View>

          <Card style={styles.section}>
            <ThemedText type="subtitle">{t('foundation.primitiveTitle')}</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {t('foundation.primitiveBody')}
            </ThemedText>
            <TextField label={t('home.formLabel')} placeholder={t('home.formPlaceholder')} />
            <View style={styles.actions}>
              <Button label={t('home.primaryAction')} />
              <Button label={t('home.secondaryAction')} variant="secondary" />
            </View>
            <Feedback
              title={t('home.feedbackTitle')}
              message={t('home.feedbackMessage')}
              tone="info"
            />
          </Card>
        </SafeAreaView>
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
    paddingBottom: BottomTabInset + Spacing.five,
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.seven,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.four,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  swatchItem: {
    minWidth: 116,
    gap: Spacing.two,
  },
  swatch: {
    height: 44,
    borderRadius: Radii.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridCard: {
    flex: 1,
    minWidth: 240,
    gap: Spacing.three,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    gap: Spacing.three,
  },
});
