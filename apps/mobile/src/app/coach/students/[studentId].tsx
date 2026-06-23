import type {
  StudentAccountStatus,
  StudentHistoryEventStatus,
  StudentHistoryEventType,
} from '@nextpoint/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  generateStudentActivationLink,
  type GeneratedStudentActivationLink,
} from '@/features/students/student-account-service';
import {
  getAssociatedStudentDetail,
  type AssociatedStudentDetail,
  type StudentHistoryEvent,
} from '@/features/students/student-coach-service';
import { StudentPrivateNoteCard } from '@/features/students/student-private-note-card';
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
};

function HistoryRow({ event }: { event: StudentHistoryEvent }) {
  const { locale, t } = useTranslation();
  const occurredAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(event.occurredAt));

  return (
    <Card style={styles.historyRow}>
      <View style={styles.historyHeading}>
        <View style={styles.historyTitle}>
          <ThemedText type="smallBold">
            {t(historyTypeKeys[event.eventType])}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {occurredAt}
          </ThemedText>
        </View>
        <StatusBadge status={historyStatusBadges[event.status]} />
      </View>
      <ThemedText type="default">{event.title}</ThemedText>
      {event.description ? (
        <ThemedText type="small" themeColor="textMuted">
          {event.description}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export default function CoachStudentDetailScreen() {
  const params = useLocalSearchParams<{ studentId?: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { locale, t } = useTranslation();
  const studentId =
    typeof params.studentId === 'string' ? params.studentId : '';
  const [detail, setDetail] = useState<AssociatedStudentDetail | null>(null);
  const [loadState, setLoadState] = useState<
    'loading' | 'ready' | 'not_found' | 'error'
  >('loading');
  const [activationLink, setActivationLink] =
    useState<GeneratedStudentActivationLink | null>(null);
  const [activationState, setActivationState] = useState<
    'idle' | 'generating' | 'ready' | 'copied' | 'error'
  >('idle');

  useEffect(() => {
    if (!studentId) return;

    let active = true;
    void getAssociatedStudentDetail(studentId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setLoadState(result.code === 'not_found' ? 'not_found' : 'error');
        return;
      }
      setDetail(result.data);
      setLoadState('ready');
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

  const { student, history } = detail;
  const expiresAt = activationLink
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(activationLink.expiresAt))
    : null;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              <ThemedText type="title">{student.fullName}</ThemedText>
              <StatusBadge
                status={accountBadgeStatuses[student.accountStatus]}
              />
            </View>
            {student.accountStatus === 'pending_activation' ? (
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

          {activationLink ? (
            <Card elevated style={styles.activationCard}>
              <ThemedText type="smallBold">
                {t('studentDetail.activationReadyTitle')}
              </ThemedText>
              <ThemedText selectable type="code">
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
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <ThemedText type="small" themeColor="textMuted">
                  {t('profile.levelLabel')}
                </ThemedText>
                <ThemedText type="default">
                  {t('students.levelValue', { level: student.padelLevel })}
                </ThemedText>
              </View>
              <View style={styles.profileItem}>
                <ThemedText type="small" themeColor="textMuted">
                  {t('profile.ageLabel')}
                </ThemedText>
                <ThemedText type="default">
                  {t('students.ageValue', { age: student.age })}
                </ThemedText>
              </View>
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
                    }`
                  )}
                </ThemedText>
              </View>
            </View>
            <View style={styles.contactList}>
              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL(`tel:${student.phone}`)}>
                <ThemedText type="linkPrimary">{student.phone}</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL(`mailto:${student.email}`)}>
                <ThemedText type="linkPrimary">{student.email}</ThemedText>
              </Pressable>
            </View>
          </Card>

          <StudentPrivateNoteCard studentId={student.userId} />

          <View style={styles.historySection}>
            <View style={styles.sectionHeading}>
              <ThemedText type="subtitle">
                {t('studentDetail.historyTitle')}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('studentDetail.historyCount', { count: history.length })}
              </ThemedText>
            </View>
            {history.length === 0 ? (
              <Feedback
                message={t('studentDetail.historyEmptyBody')}
                title={t('studentDetail.historyEmptyTitle')}
                tone="info"
              />
            ) : (
              <View style={styles.historyList}>
                {history.map((event) => (
                  <HistoryRow event={event} key={event.id} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
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
  backButton: {
    alignSelf: 'flex-start',
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.four,
  },
  headingCopy: {
    flex: 1,
    minWidth: 240,
    gap: Spacing.two,
  },
  activationButton: {
    alignSelf: 'flex-start',
  },
  activationCard: {
    gap: Spacing.three,
  },
  activationActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  profileCard: {
    gap: Spacing.four,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  profileItem: {
    minWidth: 160,
    flex: 1,
    gap: Spacing.one,
  },
  contactList: {
    gap: Spacing.one,
  },
  historySection: {
    gap: Spacing.three,
  },
  sectionHeading: {
    gap: Spacing.one,
  },
  historyList: {
    gap: Spacing.two,
  },
  historyRow: {
    gap: Spacing.two,
  },
  historyHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  historyTitle: {
    flex: 1,
    minWidth: 180,
    gap: Spacing.one,
  },
});
