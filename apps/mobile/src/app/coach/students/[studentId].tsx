import {
  schedulingTimeZone,
  type StudentAccountStatus,
  type StudentHistoryEventStatus,
  type StudentHistoryEventType,
} from '@nextpoint/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  deletePendingStudent,
  generateStudentActivationLink,
  type GeneratedStudentActivationLink,
} from '@/features/students/student-account-service';
import { StudentLessonPackCard } from '@/features/lesson-packs/student-lesson-pack-card';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  getAssociatedStudentDetail,
  type AssociatedStudentDetail,
  type StudentHistoryEvent,
} from '@/features/students/student-coach-service';
import { StudentPrivateNoteCard } from '@/features/students/student-private-note-card';
import { useStudentHistory } from '@/features/students/use-student-history';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

const accountBadgeStatuses: Record<
  StudentAccountStatus,
  'pendingActivation' | 'active' | 'suspended' | 'deleted'
> = {
  pending_activation: 'pendingActivation',
  active: 'active',
  suspended: 'suspended',
  deleted: 'deleted',
};

const historyStatusBadges: Record<
  StudentHistoryEventStatus,
  | 'pending'
  | 'confirmed'
  | 'refused'
  | 'expired'
  | 'cancelled'
  | 'modified'
  | 'active'
  | 'exhausted'
> = {
  pending: 'pending',
  confirmed: 'confirmed',
  refused: 'refused',
  expired: 'expired',
  cancelled: 'cancelled',
  modified: 'modified',
  active: 'active',
  exhausted: 'exhausted',
};

const historyTypeKeys: Record<StudentHistoryEventType, TranslationKey> = {
  booking_requested: 'studentDetail.historyType.bookingRequested',
  lesson_confirmed: 'studentDetail.historyType.lessonConfirmed',
  booking_cancelled: 'studentDetail.historyType.bookingCancelled',
  booking_modified: 'studentDetail.historyType.bookingModified',
  lesson_pack_assigned: 'studentDetail.historyType.lessonPackAssigned',
  lesson_pack_consumed: 'studentDetail.historyType.lessonPackConsumed',
  lesson_pack_adjusted: 'studentDetail.historyType.lessonPackAdjusted',
};

type HistoryStatusFilter =
  | 'all'
  | Extract<StudentHistoryEventStatus, 'cancelled' | 'confirmed' | 'refused'>;

const webScrollStyle =
  Platform.OS === 'web'
    ? ({
        overflowX: 'hidden',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      } as unknown as ViewStyle)
    : undefined;

const webWrappingTextStyle =
  Platform.OS === 'web'
    ? ({ overflowWrap: 'anywhere', wordBreak: 'break-word' } as unknown as TextStyle)
    : undefined;

function HistoryRow({ event }: { event: StudentHistoryEvent }) {
  const { locale, t } = useTranslation();
  const occurredAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: schedulingTimeZone,
  }).format(new Date(event.occurredAt));

  return (
    <Card style={styles.historyRow}>
      <View style={styles.historyHeading}>
        <View style={styles.historyTitle}>
          <ThemedText numberOfLines={1} type="smallBold">
            {t(historyTypeKeys[event.eventType])}
          </ThemedText>
          <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
            {occurredAt}
          </ThemedText>
        </View>
        <StatusBadge status={historyStatusBadges[event.status]} />
      </View>
      <ThemedText numberOfLines={1} type="default">
        {event.title}
      </ThemedText>
      <View style={styles.historyDescription}>
        {event.description ? (
          <ThemedText numberOfLines={2} type="small" themeColor="textMuted">
            {event.description}
          </ThemedText>
        ) : null}
      </View>
    </Card>
  );
}

export default function CoachStudentDetailScreen() {
  const params = useLocalSearchParams<{ studentId?: string }>();
  const studentId =
    typeof params.studentId === 'string' ? params.studentId : '';

  return (
    <CoachStudentDetailContent
      key={studentId || 'missing-student'}
      studentId={studentId}
    />
  );
}

function CoachStudentDetailContent({ studentId }: { studentId: string }) {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { locale, t } = useTranslation();
  const isCompact = width < 480;
  const [detail, setDetail] = useState<AssociatedStudentDetail | null>(null);
  const [loadState, setLoadState] = useState<
    'loading' | 'ready' | 'not_found' | 'error'
  >('loading');
  const [activationLink, setActivationLink] =
    useState<GeneratedStudentActivationLink | null>(null);
  const [activationState, setActivationState] = useState<
    'idle' | 'generating' | 'ready' | 'copied' | 'error'
  >('idle');
  const [deletionState, setDeletionState] = useState<
    'idle' | 'confirming' | 'deleting' | 'error'
  >('idle');
  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<HistoryStatusFilter>('all');
  const historyStatus =
    historyStatusFilter === 'all' ? undefined : historyStatusFilter;
  const {
    events: history,
    loadMore: loadMoreHistory,
    loadMoreState: historyLoadMoreState,
    loadState: historyLoadState,
  } = useStudentHistory(loadState === 'ready' ? studentId : '', historyStatus);

  useEffect(() => {
    if (!studentId) return undefined;

    let active = true;
    void getAssociatedStudentDetail(studentId)
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setLoadState(result.code === 'not_found' ? 'not_found' : 'error');
          return;
        }
        setDetail(result.data);
        setLoadState('ready');
      })
      .catch(() => {
        if (!active) return;
        setLoadState('error');
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  const generateLink = async () => {
    setActivationState('generating');
    const result = await generateStudentActivationLink(studentId);
    if (!result.ok) {
      setActivationState('error');
      return;
    }
    setActivationLink(result.data);
    setActivationState('ready');
  };

  const copyLink = async () => {
    if (!activationLink || Platform.OS !== 'web') return;
    try {
      await navigator.clipboard.writeText(activationLink.activationLink);
      setActivationState('copied');
    } catch {
      setActivationState('error');
    }
  };

  const shareLink = async () => {
    if (!activationLink) return;
    try {
      await Share.share({
        message: t('studentDetail.activationShareMessage', {
          link: activationLink.activationLink,
        }),
        url: activationLink.activationLink,
      });
    } catch {
      setActivationState('error');
    }
  };

  const confirmStudentDeletion = async () => {
    setDeletionState('deleting');
    const result = await deletePendingStudent(studentId);
    if (!result.ok) {
      setDeletionState('error');
      return;
    }

    router.replace('/coach/students');
  };

  if (studentId && loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('studentDetail.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  if (
    !studentId ||
    !detail ||
    loadState === 'not_found' ||
    loadState === 'error'
  ) {
    return (
      <ThemedView style={styles.centered}>
        <Feedback
          message={
            !studentId || loadState === 'not_found'
              ? t('studentDetail.notFoundBody')
              : t('studentDetail.loadErrorBody')
          }
          title={
            !studentId || loadState === 'not_found'
              ? t('studentDetail.notFoundTitle')
              : t('studentDetail.loadErrorTitle')
          }
          tone="error"
        />
        <Button
          label={t('studentDetail.backAction')}
          onPress={() => router.back()}
          variant="secondary"
        />
      </ThemedView>
    );
  }

  const { student } = detail;
  const historyStatusOptions: {
    value: HistoryStatusFilter;
    label: string;
  }[] = [
    { value: 'all', label: t('studentDetail.historyFilter.all') },
    {
      value: 'cancelled',
      label: t('studentDetail.historyFilter.cancelled'),
    },
    {
      value: 'confirmed',
      label: t('studentDetail.historyFilter.confirmed'),
    },
    { value: 'refused', label: t('studentDetail.historyFilter.refused') },
  ];
  const expiresAt = activationLink
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: schedulingTimeZone,
      }).format(new Date(activationLink.expiresAt))
    : null;

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
        ]}
        data={history}
        ItemSeparatorComponent={() => <View style={styles.historySeparator} />}
        keyExtractor={(event) => event.id}
        ListHeaderComponent={
          <View style={styles.content}>
            <Button
              label={t('studentDetail.backAction')}
              onPress={() => router.back()}
              style={styles.backButton}
              variant="secondary"
            />

            <View style={styles.heading}>
              <View style={styles.headingCopy}>
                <ThemedText type="smallBold" themeColor="primary">
                  {t('studentDetail.eyebrow')}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.wrappingText,
                    webWrappingTextStyle,
                    isCompact && styles.titleCompact,
                  ]}
                  type="title">
                  {student.fullName}
                </ThemedText>
                {student.profileComplete ? (
                  <StatusBadge
                    status={accountBadgeStatuses[student.accountStatus]}
                  />
                ) : (
                  <ThemedText type="smallBold" themeColor="warning">
                    {t('students.incompleteProfile')}
                  </ThemedText>
                )}
              </View>
              {student.profileComplete &&
              student.accountStatus === 'pending_activation' ? (
                <Button
                  disabled={activationState === 'generating'}
                  label={
                    activationState === 'generating'
                      ? t('studentDetail.activationGenerating')
                      : activationLink
                        ? t('studentDetail.activationRegenerateAction')
                        : t('studentDetail.activationGenerateAction')
                  }
                  onPress={() => void generateLink()}
                  style={styles.activationButton}
                />
              ) : null}
            </View>

            {student.profileComplete &&
            student.accountStatus === 'pending_activation' &&
            !student.email ? (
              <Feedback
                message={t('studentDetail.activationNoEmailBody')}
                title={t('studentDetail.activationNoEmailTitle')}
                tone="info"
              />
            ) : null}

            {activationLink ? (
              <Card elevated style={styles.activationCard}>
                <ThemedText type="smallBold">
                  {t('studentDetail.activationReadyTitle')}
                </ThemedText>
                <ThemedText
                  selectable
                  style={[styles.wrappingText, webWrappingTextStyle]}
                  type="code">
                  {activationLink.activationLink}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('studentDetail.activationExpiresAt', {
                    date: expiresAt ?? '',
                  })}
                </ThemedText>
                <View style={styles.activationActions}>
                  {Platform.OS === 'web' ? (
                    <Button
                      label={t('studentDetail.activationCopyAction')}
                      onPress={() => void copyLink()}
                      variant="secondary"
                    />
                  ) : null}
                  <Button
                    label={t('studentDetail.activationShareAction')}
                    onPress={() => void shareLink()}
                    variant="secondary"
                  />
                </View>
                {activationState === 'copied' ? (
                  <Feedback
                    message={t('studentDetail.activationCopiedBody')}
                    title={t('studentDetail.activationCopiedTitle')}
                    tone="success"
                  />
                ) : null}
              </Card>
            ) : null}

            {activationState === 'error' ? (
              <Feedback
                message={t('studentDetail.activationErrorBody')}
                title={t('studentDetail.activationErrorTitle')}
                tone="error"
              />
            ) : null}

            <Card elevated style={styles.profileCard}>
              <ThemedText type="subtitle">
                {t('studentDetail.profileTitle')}
              </ThemedText>
              {student.profileComplete ? (
                <View style={styles.profileGrid}>
                  <View style={styles.profileItem}>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('profile.levelLabel')}
                    </ThemedText>
                    <ThemedText type="default">
                      {t('students.levelValue', { level: student.padelLevel })}
                    </ThemedText>
                  </View>
                  {student.age === null ? null : (
                    <View style={styles.profileItem}>
                      <ThemedText type="small" themeColor="textMuted">
                        {t('profile.ageLabel')}
                      </ThemedText>
                      <ThemedText type="default">
                        {t('students.ageValue', { age: student.age })}
                      </ThemedText>
                    </View>
                  )}
                  <View style={styles.profileItem}>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('profile.sexLabel')}
                    </ThemedText>
                    <ThemedText type="default">
                      {t(
                        `profile.sex.${
                          student.sex === 'not_specified'
                            ? 'notSpecified'
                            : student.sex
                        }`,
                      )}
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <Feedback
                  message={t('studentDetail.incompleteProfileBody')}
                  title={t('students.incompleteProfile')}
                  tone="info"
                />
              )}
              <View style={styles.contactList}>
                {student.phone ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(`tel:${student.phone}`)}
                  >
                    <ThemedText
                      style={[styles.wrappingText, webWrappingTextStyle]}
                      type="linkPrimary">
                      {student.phone}
                    </ThemedText>
                  </Pressable>
                ) : null}
                {student.email ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      void Linking.openURL(`mailto:${student.email}`)
                    }
                  >
                    <ThemedText
                      style={[styles.wrappingText, webWrappingTextStyle]}
                      type="linkPrimary">
                      {student.email}
                    </ThemedText>
                  </Pressable>
                ) : null}
              </View>
            </Card>

            <StudentPrivateNoteCard studentId={student.userId} />
            <StudentLessonPackCard studentId={student.userId} />

            {student.profileComplete &&
            student.accountStatus === 'pending_activation' ? (
              <Card
                elevated
                style={[styles.deleteCard, { borderColor: theme.error }]}>
                <ThemedText type="subtitle">
                  {t('studentDetail.deleteTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('studentDetail.deleteBody')}
                </ThemedText>
                {deletionState === 'confirming' ||
                deletionState === 'deleting' ? (
                  <>
                    <Feedback
                      message={t('studentDetail.deleteConfirmBody', {
                        name: student.fullName,
                      })}
                      title={t('studentDetail.deleteConfirmTitle')}
                      tone="warning"
                    />
                    <View style={styles.deleteActions}>
                      <Button
                        disabled={deletionState === 'deleting'}
                        label={t('studentDetail.deleteCancelAction')}
                        onPress={() => setDeletionState('idle')}
                        style={styles.deleteAction}
                        variant="secondary"
                      />
                      <Button
                        disabled={deletionState === 'deleting'}
                        label={
                          deletionState === 'deleting'
                            ? t('studentDetail.deleting')
                            : t('studentDetail.deleteConfirmAction')
                        }
                        onPress={() => void confirmStudentDeletion()}
                        style={styles.deleteAction}
                        variant="danger"
                      />
                    </View>
                  </>
                ) : (
                  <Button
                    label={t('studentDetail.deleteAction')}
                    onPress={() => setDeletionState('confirming')}
                    style={styles.deleteButton}
                    variant="danger"
                  />
                )}
                {deletionState === 'error' ? (
                  <Feedback
                    message={t('studentDetail.deleteErrorBody')}
                    title={t('studentDetail.deleteErrorTitle')}
                    tone="error"
                  />
                ) : null}
              </Card>
            ) : null}

            <View style={styles.historySection}>
              <View style={styles.sectionHeading}>
                <ThemedText type="subtitle">
                  {t('studentDetail.historyTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('studentDetail.historyCount', {
                    count: history.length,
                  })}
                </ThemedText>
              </View>
              <ProfileOptionSelector
                label={t('studentDetail.historyFilter.label')}
                onChange={setHistoryStatusFilter}
                options={historyStatusOptions}
                value={historyStatusFilter}
              />
              {historyLoadState === 'loading' ? (
                <View style={styles.historyLoading}>
                  <ActivityIndicator color={theme.primary} />
                  <ThemedText type="small" themeColor="textMuted">
                    {t('studentDetail.historyLoading')}
                  </ThemedText>
                </View>
              ) : historyLoadState === 'error' ? (
                <Feedback
                  message={t('studentDetail.historyLoadErrorBody')}
                  title={t('studentDetail.historyLoadErrorTitle')}
                  tone="error"
                />
              ) : history.length === 0 ? (
                <Feedback
                  message={
                    historyStatusFilter === 'all'
                      ? t('studentDetail.historyEmptyBody')
                      : t('studentDetail.historyFilterEmptyBody')
                  }
                  title={
                    historyStatusFilter === 'all'
                      ? t('studentDetail.historyEmptyTitle')
                      : t('studentDetail.historyFilterEmptyTitle')
                  }
                  tone="info"
                />
              ) : null}
            </View>
          </View>
        }
        ListFooterComponent={
          historyLoadMoreState === 'idle' ? null : (
            <View style={styles.historyFooter}>
              {historyLoadMoreState === 'loading' ? (
                <>
                  <ActivityIndicator color={theme.primary} />
                  <ThemedText type="small" themeColor="textMuted">
                    {t('studentDetail.historyLoadingMore')}
                  </ThemedText>
                </>
              ) : (
                <Button
                  label={t('studentDetail.historyLoadMoreAction')}
                  onPress={() => void loadMoreHistory()}
                  variant="secondary"
                />
              )}
            </View>
          )
        }
        maxToRenderPerBatch={10}
        onEndReached={() => void loadMoreHistory()}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <HistoryRow event={item} />
          </View>
        )}
        windowSize={7}
        style={[styles.listScroller, webScrollStyle]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  listScroller: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  scrollContent: {
    alignItems: 'stretch',
    minWidth: 0,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  scrollContentCompact: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.three,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    minWidth: 0,
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  heading: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 42,
  },
  wrappingText: {
    flexShrink: 1,
    maxWidth: '100%',
  },
  activationButton: {
    alignSelf: 'flex-start',
  },
  activationCard: {
    width: '100%',
    minWidth: 0,
    gap: Spacing.three,
    overflow: 'hidden',
  },
  activationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  profileCard: {
    width: '100%',
    minWidth: 0,
    gap: Spacing.four,
    overflow: 'hidden',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  profileItem: {
    minWidth: 0,
    flexBasis: 160,
    flex: 1,
    gap: Spacing.one,
  },
  contactList: {
    minWidth: 0,
    gap: Spacing.one,
  },
  deleteCard: {
    gap: Spacing.three,
  },
  deleteButton: {
    alignSelf: 'flex-start',
  },
  deleteActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  deleteAction: {
    flexGrow: 1,
  },
  historySection: {
    minWidth: 0,
    gap: Spacing.three,
  },
  sectionHeading: {
    gap: Spacing.one,
  },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyItem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minWidth: 0,
  },
  historySeparator: {
    height: Spacing.two,
  },
  historyFooter: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  historyRow: {
    width: '100%',
    minWidth: 0,
    minHeight: 176,
    gap: Spacing.two,
    overflow: 'hidden',
  },
  historyHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  historyTitle: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  historyDescription: {
    minHeight: 40,
  },
});
