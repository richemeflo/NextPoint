import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  getPublishedPricingRates,
  getStudentMinimumPricingRates,
  type PricingRate,
} from './pricing-service';
import { selectStudentPricingCatalog } from './student-pricing-catalog';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

function PricingRow({ compact, rate }: { compact: boolean; rate: PricingRate }) {
  const { locale, t } = useTranslation();
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: rate.currency,
  }).format(rate.amountCents / 100);
  const contextLabels = rate.applicabilityContexts.map((context) =>
    t(`pricing.context.${context}` as TranslationKey)
  );

  if (compact) {
    return (
      <Card style={[styles.rate, styles.rateCompact]}>
        <View style={styles.rateHeader}>
          <View style={styles.compactRateInfo}>
            <ThemedText numberOfLines={1} type="smallBold">
              {rate.label}
            </ThemedText>
            <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
              {t(`pricing.type.${rate.lessonType}` as TranslationKey)} ·{' '}
              {t(`pricing.duration.${rate.durationMinutes}` as TranslationKey)}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" themeColor="primary">
            {price}
          </ThemedText>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.rate}>
      <View style={styles.rateHeader}>
        <ThemedText style={styles.rateLabel} type="smallBold">
          {rate.label}
        </ThemedText>
        <ThemedText type="default" themeColor="primary">
          {price}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textMuted">
        {t(`pricing.type.${rate.lessonType}` as TranslationKey)} ·{' '}
        {t(`pricing.duration.${rate.durationMinutes}` as TranslationKey)}
      </ThemedText>
      {contextLabels.length > 0 ? (
        <ThemedText type="small" themeColor="textMuted">
          {contextLabels.join(' · ')}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export function PublishedPricingList({
  audience = 'public',
}: {
  audience?: 'public' | 'student';
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [rates, setRates] = useState<PricingRate[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;

    void (audience === 'student'
      ? getStudentMinimumPricingRates()
      : getPublishedPricingRates())
      .then((result) => {
        if (!active) return;

        if (!result.ok) {
          setState('error');
          return;
        }

        setRates(
          audience === 'student'
            ? selectStudentPricingCatalog(result.data)
            : result.data
        );
        setState('ready');
      })
      .catch(() => {
        if (!active) return;
        setState('error');
      });

    return () => {
      active = false;
    };
  }, [audience]);

  if (state === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} />
        <ThemedText type="small" themeColor="textMuted">
          {t('pricing.loading')}
        </ThemedText>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <Feedback
        message={t('pricing.loadErrorBody')}
        title={t('pricing.loadErrorTitle')}
        tone="error"
      />
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <ThemedText
          style={compact ? styles.compactTitle : undefined}
          type="subtitle">
          {t('pricing.publishedTitle')}
        </ThemedText>
        {compact ? null : (
          <ThemedText type="small" themeColor="textMuted">
            {t('pricing.publishedBody')}
          </ThemedText>
        )}
      </View>
      {rates.length === 0 ? (
        <Feedback
          message={t('pricing.emptyPublishedBody')}
          title={t('pricing.emptyPublishedTitle')}
          tone="info"
        />
      ) : (
        <View style={[styles.grid, compact && styles.gridCompact]}>
          {rates.map((rate) => (
            <PricingRow compact={compact} key={rate.id} rate={rate} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    gap: Spacing.three,
  },
  heading: {
    gap: Spacing.one,
  },
  loading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridCompact: {
    flexDirection: 'column',
  },
  rate: {
    minWidth: 240,
    flexBasis: 280,
    flexGrow: 1,
    gap: Spacing.one,
  },
  rateCompact: {
    width: '100%',
    minWidth: 0,
    flexBasis: 'auto',
    flexGrow: 0,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  compactRateInfo: {
    minWidth: 0,
    flex: 1,
    gap: Spacing.half,
  },
  compactTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
  rateHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rateLabel: {
    minWidth: 140,
    flex: 1,
  },
});
