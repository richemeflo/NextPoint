import { schedulingTimeZone } from '@nextpoint/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import {
  getStudentLessonPacks,
  type LessonPack,
} from '@/features/lesson-packs/lesson-pack-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export function StudentLessonPacksReadonlyCard({
  studentId,
}: {
  studentId: string;
}) {
  const theme = useTheme();
  const { locale, t } = useTranslation();
  const [packs, setPacks] = useState<LessonPack[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    let active = true;

    void getStudentLessonPacks(studentId)
      .then((result) => {
        if (!active) return;

        if (!result.ok) {
          setLoadState('error');
          return;
        }

        setPacks(result.data);
        setLoadState('ready');
      })
      .catch(() => {
        if (active) setLoadState('error');
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  if (loadState === 'loading') {
    return (
      <Card elevated style={styles.card}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textMuted">
            {t('lessonPack.loading')}
          </ThemedText>
        </View>
      </Card>
    );
  }

  if (loadState === 'error') {
    return (
      <Feedback
        message={t('lessonPack.loadErrorBody')}
        title={t('lessonPack.loadErrorTitle')}
        tone="error"
      />
    );
  }

  return (
    <Card elevated style={styles.card}>
      <View style={styles.heading}>
        <ThemedText type="subtitle">{t('lessonPack.studentTitle')}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {t('lessonPack.readonlyHint')}
        </ThemedText>
      </View>

      {packs.length === 0 ? (
        <ThemedText type="default" themeColor="textMuted">
          {t('lessonPack.studentEmptyBody')}
        </ThemedText>
      ) : (
        <View style={styles.packList}>
          {packs.map((pack) => (
            <View key={pack.id} style={styles.pack}>
              <View style={styles.packHeading}>
                <View style={styles.packTitle}>
                  <ThemedText type="smallBold">
                    {t('lessonPack.individualTitle')}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeZone: schedulingTimeZone,
                    }).format(new Date(pack.createdAt))}
                  </ThemedText>
                </View>
                <StatusBadge status={pack.status} />
              </View>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">
                    {pack.includedSessions}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.includedMetric')}
                  </ThemedText>
                </View>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">{pack.usedSessions}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.usedMetric')}
                  </ThemedText>
                </View>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">
                    {pack.remainingSessions}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.remainingMetric')}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    gap: Spacing.one,
  },
  packList: {
    gap: Spacing.three,
  },
  pack: {
    gap: Spacing.three,
  },
  packHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  packTitle: {
    flex: 1,
    minWidth: 180,
    gap: Spacing.one,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metric: {
    minWidth: 100,
    flex: 1,
    gap: Spacing.one,
  },
});
