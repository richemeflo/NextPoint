import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useRouter } from 'expo-router';
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
import { ResponsivePageTitle } from '@/components/ui/responsive-page-title';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import {
  MaxContentWidth,
  Radii,
  Spacing,
  type ThemeColor,
} from '@/constants/theme';
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
import {
  schedulingTimeZone,
  type CoachStatsPeriod,
  type CoachStatsReadModel,
} from '@nextpoint/shared';

function getErrorMessageKey(error: CoachStatsError): TranslationKey {
  if (error === 'unauthorized') return 'stats.accessDenied';
  if (error === 'invalid_period') return 'stats.invalidPeriod';
  return 'stats.loadErrorBody';
}

const metricIcons = {
  courses: {
    ios: 'calendar.badge.checkmark',
    android: 'event_available',
    web: 'event_available',
  },
  hours: { ios: 'clock', android: 'schedule', web: 'schedule' },
  duration: { ios: 'timer', android: 'timer', web: 'timer' },
  revenue: { ios: 'eurosign.circle', android: 'euro', web: 'euro' },
  average: { ios: 'chart.bar', android: 'analytics', web: 'analytics' },
} satisfies Record<string, SymbolViewProps['name']>;

function StatsMetric({
  icon,
  iconColor,
  iconSurface,
  label,
  value,
}: {
  icon: SymbolViewProps['name'];
  iconColor: ThemeColor;
  iconSurface: ThemeColor;
  label: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <Card elevated style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: theme[iconSurface] }]}>
        <SymbolView
          name={icon}
          size={22}
          weight="semibold"
          tintColor={theme[iconColor]}
        />
      </View>
      <View style={styles.metricCopy}>
        <ThemedText type="smallBold" themeColor="textMuted">
          {label}
        </ThemedText>
        <ThemedText style={styles.metricValue}>{value}</ThemedText>
      </View>
    </Card>
  );
}

export default function CoachStatsScreen() {
  const router = useRouter();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [stats, setStats] = useState<CoachStatsReadModel | null>(null);
  const [error, setError] = useState<CoachStatsError | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [period, setPeriod] = useState<CoachStatsPeriod>('month');

  useEffect(() => {
    let active = true;

    void getCoachStats(period)
      .then((result) => {
        if (!active) return;

        if (result.ok) {
          setStats(result.data);
          setError(null);
        } else {
          setStats(null);
          setError(result.error);
        }
      })
      .catch(() => {
        if (!active) return;
        setStats(null);
        setError('unknown');
      })
      .finally(() => {
        if (!active) return;
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
  const formatPeriodDate = (value: string | number) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: schedulingTimeZone,
    }).format(new Date(value));
  const formatGeneratedAt = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ResponsivePageTitle
              context={t('role.coachLabel')}
              title={t('stats.title')}
            />
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
              <View
                style={[
                  styles.periodSummary,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}>
                <View style={styles.periodSummaryCopy}>
                  <ThemedText type="smallBold">
                    {t('stats.periodRange', {
                      start: formatPeriodDate(stats.periodStart),
                      end: formatPeriodDate(
                        new Date(stats.periodEnd).getTime() - 1
                      ),
                    })}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('stats.lastUpdated', {
                      time: formatGeneratedAt(stats.generatedAt),
                    })}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.activityStatus,
                    {
                      backgroundColor: hasActivity
                        ? theme.successSurface
                        : theme.warningSurface,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    themeColor={hasActivity ? 'success' : 'warning'}>
                    {t(
                      hasActivity
                        ? 'stats.activityAvailable'
                        : 'stats.activityEmpty'
                    )}
                  </ThemedText>
                </View>
              </View>

              {!hasActivity ? (
                <Feedback
                  message={t('stats.emptyBody')}
                  title={t('stats.emptyTitle')}
                />
              ) : null}

              <View style={styles.metrics}>
                <StatsMetric
                  icon={metricIcons.courses}
                  iconColor="primary"
                  iconSurface="backgroundSelected"
                  label={t('stats.completedCourses')}
                  value={new Intl.NumberFormat(locale).format(
                    stats.completedCourses
                  )}
                />
                <StatsMetric
                  icon={metricIcons.hours}
                  iconColor="secondary"
                  iconSurface="successSurface"
                  label={t('stats.completedHours')}
                  value={formatCoachStatsHours(stats.completedMinutes, locale)}
                />
                <StatsMetric
                  icon={metricIcons.duration}
                  iconColor="secondary"
                  iconSurface="successSurface"
                  label={t('stats.averageDuration')}
                  value={formatCoachStatsHours(
                    stats.completedCourses > 0
                      ? stats.completedMinutes / stats.completedCourses
                      : 0,
                    locale
                  )}
                />
                <StatsMetric
                  icon={metricIcons.revenue}
                  iconColor="warning"
                  iconSurface="warningSurface"
                  label={t('stats.estimatedRevenue')}
                  value={formatCoachStatsRevenue(
                    stats.estimatedRevenueCents,
                    locale,
                    stats.currency
                  )}
                />
                <StatsMetric
                  icon={metricIcons.average}
                  iconColor="success"
                  iconSurface="successSurface"
                  label={t('stats.averageRevenue')}
                  value={formatCoachStatsRevenue(
                    stats.completedCourses > 0
                      ? stats.estimatedRevenueCents / stats.completedCourses
                      : 0,
                    locale,
                    stats.currency
                  )}
                />
              </View>
              <ThemedText type="small" themeColor="textMuted">
                {t('stats.estimatedRevenueHint')}
              </ThemedText>

              <Card style={styles.activeStudentsCard}>
                <View style={styles.sectionHeading}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <SymbolView
                      name={{ ios: 'person.2', android: 'groups', web: 'groups' }}
                      size={20}
                      weight="semibold"
                      tintColor={theme.primary}
                    />
                  </View>
                  <ThemedText type="smallBold">
                    {t('stats.activeStudentsTitle')}
                  </ThemedText>
                </View>
                {stats.activeStudents.length > 0 ? (
                  <View style={styles.activeStudentsList}>
                    {stats.activeStudents.map((student, index) => {
                      const maxCourses = stats.activeStudents[0]?.courseCount ?? 1;
                      const studentName = getCoachStatsStudentName(
                        student.fullName,
                        t('stats.unknownStudent')
                      );

                      return (
                        <Pressable
                          accessibilityLabel={t('stats.openStudentAction', {
                            name: studentName,
                          })}
                          accessibilityRole="button"
                          key={student.studentId}
                          onPress={() =>
                            router.push({
                              pathname: '/coach/students/[studentId]',
                              params: { studentId: student.studentId },
                            })
                          }
                          style={({ pressed }) => [
                            styles.activeStudentRow,
                            {
                              borderColor: theme.border,
                              opacity: pressed ? 0.72 : 1,
                            },
                          ]}>
                          <View
                            style={[
                              styles.studentRank,
                              { backgroundColor: theme.backgroundSelected },
                            ]}>
                            <ThemedText type="smallBold" themeColor="primary">
                              {index + 1}
                            </ThemedText>
                          </View>
                          <View style={styles.activeStudentMain}>
                            <View style={styles.activeStudentCopy}>
                              <ThemedText
                                numberOfLines={1}
                                style={styles.activeStudentName}>
                                {studentName}
                              </ThemedText>
                              <ThemedText type="smallBold" themeColor="primary">
                                {t('stats.activeStudentCourses', {
                                  count: student.courseCount,
                                })}
                              </ThemedText>
                            </View>
                            <View
                              style={[
                                styles.studentBarTrack,
                                { backgroundColor: theme.backgroundSelected },
                              ]}>
                              <View
                                style={[
                                  styles.studentBar,
                                  {
                                    backgroundColor: theme.secondary,
                                    width: `${Math.max(
                                      8,
                                      (student.courseCount / maxCourses) * 100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <SymbolView
                            name={{
                              ios: 'chevron.right',
                              android: 'chevron_right',
                              web: 'chevron_right',
                            }}
                            size={16}
                            weight="semibold"
                            tintColor={theme.textMuted}
                          />
                        </Pressable>
                      );
                    })}
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
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.one,
  },
  sections: {
    gap: Spacing.four,
  },
  periodSummary: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: Radii.medium,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  periodSummaryCopy: {
    gap: Spacing.half,
  },
  activityStatus: {
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
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
    flexBasis: 210,
    minWidth: 0,
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  metricIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCopy: {
    minWidth: 0,
    flex: 1,
    gap: Spacing.one,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
  },
  activeStudentsCard: {
    gap: Spacing.three,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStudentsList: {
    gap: 0,
  },
  activeStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    gap: Spacing.two,
    minHeight: 72,
    paddingVertical: Spacing.two,
  },
  studentRank: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStudentMain: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  activeStudentCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  activeStudentName: {
    flex: 1,
  },
  studentBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  studentBar: {
    height: '100%',
    borderRadius: 3,
  },
});
