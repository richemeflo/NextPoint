import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import type { CoachStatsError } from '@/features/stats/coach-stats-error';
import {
  formatCoachStatsHours,
  formatCoachStatsRevenue,
} from '@/features/stats/coach-stats-format';
import { getCoachStats } from '@/features/stats/coach-stats-service';
import {
  coachStatsPeriodOptions,
  getCoachStatsStudentName,
} from '@/features/stats/coach-stats-view';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';
import type { CoachStatsPeriod, CoachStatsReadModel } from '@nextpoint/shared';

function getErrorMessageKey(error: CoachStatsError): TranslationKey {
  if (error === 'unauthorized') return 'stats.accessDenied';
  if (error === 'invalid_period') return 'stats.invalidPeriod';
  return 'stats.loadErrorBody';
}

export default function CoachStatsScreen() {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [stats, setStats] = useState<CoachStatsReadModel | null>(null);
  const [error, setError] = useState<CoachStatsError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [period, setPeriod] = useState<CoachStatsPeriod>('month');

  useEffect(() => {
    let active = true;

    void getCoachStats(period).then((result) => {
      if (!active) return;

      if (result.ok) {
        setStats(result.data);
        setError(null);
      } else {
        setStats(null);
        setError(result.error);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [period, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setStats(null);
    setReloadKey((current) => current + 1);
  };

  const selectPeriod = (nextPeriod: CoachStatsPeriod) => {
    if (nextPeriod === period) return;

    setLoading(true);
    setError(null);
    setStats(null);
    setPeriod(nextPeriod);
  };

  const hasActivity = (stats?.completedCourses ?? 0) > 0;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.coachLabel')}
            </ThemedText>
            <ThemedText type="title">{t('stats.title')}</ThemedText>
            <ThemedText themeColor="textMuted">{t('stats.subtitle')}</ThemedText>
          </View>

          <View accessibilityRole="tablist" style={styles.periodSelector}>
            {coachStatsPeriodOptions.map((option) => {
              const selected = option.period === period;

              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  key={option.period}
                  onPress={() => selectPeriod(option.period)}
                  style={({ pressed }) => [
                    styles.periodOption,
                    {
                      backgroundColor: selected
                        ? theme.backgroundSelected
                        : theme.surface,
                      borderColor: selected ? theme.primary : theme.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    themeColor={selected ? 'primary' : 'textMuted'}>
                    {t(option.labelKey)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {loading ? (
            <Card elevated style={styles.loadingCard}>
              <ActivityIndicator color={theme.primary} />
              <ThemedText themeColor="textMuted">{t('stats.loading')}</ThemedText>
            </Card>
          ) : error ? (
            <Card elevated style={styles.stateCard}>
              <Feedback
                message={t(getErrorMessageKey(error))}
                title={t('stats.loadErrorTitle')}
                tone="error"
              />
              <Button
                label={t('stats.retryAction')}
                onPress={retry}
                variant="secondary"
              />
            </Card>
          ) : stats ? (
            <View style={styles.sections}>
              {!hasActivity ? (
                <Feedback
                  message={t('stats.emptyBody')}
                  title={t('stats.emptyTitle')}
                />
              ) : null}

              <View style={styles.metrics}>
                <Card elevated style={styles.metricCard}>
                  <ThemedText type="smallBold" themeColor="textMuted">
                    {t('stats.completedCourses')}
                  </ThemedText>
                  <ThemedText type="subtitle">{stats.completedCourses}</ThemedText>
                </Card>
                <Card elevated style={styles.metricCard}>
                  <ThemedText type="smallBold" themeColor="textMuted">
                    {t('stats.completedHours')}
                  </ThemedText>
                  <ThemedText type="subtitle">
                    {formatCoachStatsHours(stats.completedMinutes, locale)}
                  </ThemedText>
                </Card>
                <Card elevated style={styles.metricCard}>
                  <ThemedText type="smallBold" themeColor="textMuted">
                    {t('stats.estimatedRevenue')}
                  </ThemedText>
                  <ThemedText type="subtitle">
                    {formatCoachStatsRevenue(
                      stats.estimatedRevenueCents,
                      locale,
                      stats.currency
                    )}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('stats.estimatedRevenueHint')}
                  </ThemedText>
                </Card>
              </View>

              <Card style={styles.activeStudentsCard}>
                <ThemedText type="smallBold">
                  {t('stats.activeStudentsTitle')}
                </ThemedText>
                {stats.activeStudents.length > 0 ? (
                  <View style={styles.activeStudentsList}>
                    {stats.activeStudents.map((student) => (
                      <View key={student.studentId} style={styles.activeStudentRow}>
                        <ThemedText style={styles.activeStudentName}>
                          {getCoachStatsStudentName(
                            student.fullName,
                            t('stats.unknownStudent')
                          )}
                        </ThemedText>
                        <ThemedText type="smallBold" themeColor="primary">
                          {t('stats.activeStudentCourses', {
                            count: student.courseCount,
                          })}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : (
                  <ThemedText type="small" themeColor="textMuted">
                    {t('stats.activeStudentsEmpty')}
                  </ThemedText>
                )}
              </Card>
            </View>
          ) : null}
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
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  periodOption: {
    minHeight: 44,
    minWidth: 96,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
  },
  sections: {
    gap: Spacing.four,
  },
  loadingCard: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  stateCard: {
    gap: Spacing.three,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 0,
    gap: Spacing.two,
  },
  activeStudentsCard: {
    gap: Spacing.three,
  },
  activeStudentsList: {
    gap: Spacing.two,
  },
  activeStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  activeStudentName: {
    flex: 1,
  },
});
