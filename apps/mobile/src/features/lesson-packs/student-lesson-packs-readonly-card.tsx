import { schedulingTimeZone } from '@nextpoint/shared';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import { useStudentLessonPacks } from '@/features/lesson-packs/use-student-lesson-packs';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export function StudentLessonPacksReadonlyCard({
  studentId,
}: {
  studentId: string;
}) {
  return (
    <StudentLessonPacksReadonlyCardContent
      key={studentId}
      studentId={studentId}
    />
  );
}

function StudentLessonPacksReadonlyCardContent({
  studentId,
}: {
  studentId: string;
}) {
  const theme = useTheme();
  const { locale, t } = useTranslation();
  const { width } = useWindowDimensions();
  const { loadMore, loadMoreState, loadState, packs } =
    useStudentLessonPacks(studentId);
  const packWidth = Math.max(240, Math.min(width - 96, 640));

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
        <FlatList
          contentContainerStyle={styles.packListContent}
          data={packs}
          horizontal
          ItemSeparatorComponent={() => <View style={styles.packSeparator} />}
          keyExtractor={(pack) => pack.id}
          ListFooterComponent={
            loadMoreState === 'idle' ? null : (
              <View style={styles.loadMore}>
                {loadMoreState === 'loading' ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <Button
                    label={t('lessonPack.loadMoreAction')}
                    onPress={() => void loadMore()}
                    variant="secondary"
                  />
                )}
              </View>
            )
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          renderItem={({ item: pack }) => (
            <Card style={[styles.pack, { width: packWidth }]}>
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
            </Card>
          )}
          showsHorizontalScrollIndicator
          style={styles.packList}
          windowSize={5}
        />
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
    width: '100%',
  },
  packListContent: {
    paddingRight: Spacing.one,
  },
  packSeparator: {
    width: Spacing.three,
  },
  pack: {
    gap: Spacing.three,
  },
  loadMore: {
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
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
