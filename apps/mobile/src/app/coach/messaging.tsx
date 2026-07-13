import {
  isCoachMessageThreadUnread,
  messageBodyMaxLength,
  type BookingStatus,
} from '@nextpoint/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  getCoachMessageThreads,
  markCoachMessageThreadRead,
  sendCoachMessage,
  type CoachMessageThread,
} from '@/features/messaging/coach-messaging-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export default function CoachMessagingScreen() {
  const { role } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [threads, setThreads] = useState<CoachMessageThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<
    'loadError' | 'saveError' | 'invalidMessage' | 'contextUnavailable' | null
  >(null);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [selectedThreadId, threads]
  );

  useEffect(() => {
    let mounted = true;

    if (role !== 'coach') {
      return () => {
        mounted = false;
      };
    }

    getCoachMessageThreads().then((result) => {
      if (!mounted) return;

      if (!result.ok) {
        setNotice('loadError');
      } else {
        setThreads(result.data);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [role]);

  const formatDate = (value: string, includeTime = true) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...(includeTime ? { timeStyle: 'short' as const } : {}),
    }).format(new Date(value));

  const openThread = async (thread: CoachMessageThread) => {
    setSelectedThreadId(thread.id);
    setDraft('');
    setNotice(null);

    if (!isCoachMessageThreadUnread(thread)) return;
    const result = await markCoachMessageThreadRead(thread);
    if (!result.ok) {
      setNotice('saveError');
      return;
    }

    setThreads((current) =>
      current.map((item) => (item.id === result.data.id ? result.data : item))
    );
  };

  const submitReply = async () => {
    if (!selectedThread || sending) return;

    setSending(true);
    setNotice(null);
    const result = await sendCoachMessage(selectedThread.id, draft);
    setSending(false);

    if (!result.ok) {
      setNotice(result.error === 'invalid_message' ? 'invalidMessage' : 'saveError');
      return;
    }

    setThreads((current) =>
      current.map((thread) =>
        thread.id === selectedThread.id
          ? {
              ...thread,
              coachReadAt: result.data.createdAt,
              lastMessageAt: result.data.createdAt,
              messages: [...thread.messages, result.data],
            }
          : thread
      )
    );
    setDraft('');
  };

  const openContext = () => {
    if (!selectedThread) {
      setNotice('contextUnavailable');
      return;
    }

    router.push({
      pathname: '/coach',
      params: {
        bookingId: selectedThread.context.bookingId,
        startsAt: selectedThread.context.startsAt,
      },
    });
  };

  const statusLabel = (status: BookingStatus) =>
    t(`status.${status}` as TranslationKey);

  if (role !== 'coach') {
    return (
      <ThemedView style={styles.centeredScreen}>
        <Feedback
          message={t('messaging.accessDeniedBody')}
          title={t('messaging.accessDeniedTitle')}
          tone="error"
        />
      </ThemedView>
    );
  }

  const showThreadList = !isMobile || !selectedThread;
  const showThreadDetail = !isMobile || !!selectedThread;

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.page}>
        <View style={styles.heading}>
          <ThemedText type="smallBold" themeColor="primary">
            {t('role.coachLabel')}
          </ThemedText>
          <ThemedText type="title">{t('messaging.title')}</ThemedText>
          <ThemedText themeColor="textMuted">{t('messaging.subtitle')}</ThemedText>
        </View>

        {notice ? (
          <Feedback
            message={t(`messaging.${notice}Body`)}
            title={t(`messaging.${notice}Title`)}
            tone={notice === 'contextUnavailable' ? 'warning' : 'error'}
          />
        ) : null}

        <View style={[styles.messagingLayout, isMobile ? styles.mobileLayout : null]}>
          {showThreadList ? (
            <Card style={[styles.threadListPanel, isMobile ? styles.mobilePanel : null]}>
              <ThemedText type="subtitle">{t('messaging.listTitle')}</ThemedText>
              {loading ? (
                <ThemedText themeColor="textMuted">
                  {t('messaging.loading')}
                </ThemedText>
              ) : threads.length === 0 ? (
                <Feedback
                  message={t('messaging.emptyBody')}
                  title={t('messaging.emptyTitle')}
                />
              ) : (
                <ScrollView
                  contentContainerStyle={styles.threadList}
                  style={styles.scrollArea}>
                  {threads.map((thread) => {
                    const unread = isCoachMessageThreadUnread(thread);
                    const active = thread.id === selectedThreadId;
                    const lastMessage = thread.messages.at(-1);

                    return (
                      <Pressable
                        accessibilityRole="button"
                        key={thread.id}
                        onPress={() => void openThread(thread)}
                        style={({ pressed }) => [
                          styles.threadRow,
                          {
                            backgroundColor: active
                              ? theme.backgroundSelected
                              : unread
                                ? theme.surfaceElevated
                                : theme.surface,
                            borderColor: active || unread ? theme.primary : theme.border,
                            opacity: pressed ? 0.82 : 1,
                          },
                        ]}>
                        <View style={styles.threadRowHeader}>
                          <ThemedText numberOfLines={1} type="smallBold">
                            {thread.context.studentName ??
                              t('messaging.unknownStudent')}
                          </ThemedText>
                          <ThemedText
                            type="smallBold"
                            themeColor={unread ? 'primary' : 'textMuted'}>
                            {t(unread ? 'messaging.unread' : 'messaging.read')}
                          </ThemedText>
                        </View>
                        <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
                          {formatDate(thread.context.startsAt)} · {thread.context.location}
                        </ThemedText>
                        <ThemedText numberOfLines={2} themeColor="textMuted">
                          {lastMessage?.body ?? t('messaging.noMessages')}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </Card>
          ) : null}

          {showThreadDetail ? (
            <Card elevated style={[styles.detailPanel, isMobile ? styles.mobilePanel : null]}>
              {selectedThread ? (
                <>
                  {isMobile ? (
                    <Button
                      label={t('messaging.backAction')}
                      onPress={() => setSelectedThreadId(null)}
                      variant="secondary"
                    />
                  ) : null}
                  <View style={styles.contextHeader}>
                    <View style={styles.contextText}>
                      <ThemedText type="subtitle">
                        {selectedThread.context.studentName ??
                          t('messaging.unknownStudent')}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textMuted">
                        {formatDate(selectedThread.context.startsAt)} ·{' '}
                        {selectedThread.context.location}
                      </ThemedText>
                      <ThemedText type="smallBold" themeColor="primary">
                        {statusLabel(selectedThread.context.status)}
                      </ThemedText>
                    </View>
                    <Button
                      label={t('messaging.openContextAction')}
                      onPress={openContext}
                      variant="secondary"
                    />
                  </View>

                  <ScrollView
                    contentContainerStyle={styles.messages}
                    style={styles.scrollArea}>
                    {selectedThread.messages.length === 0 ? (
                      <ThemedText themeColor="textMuted">
                        {t('messaging.noMessages')}
                      </ThemedText>
                    ) : (
                      selectedThread.messages.map((message) => {
                        const fromCoach = message.senderId === selectedThread.coachId;

                        return (
                          <View
                            key={message.id}
                            style={[
                              styles.messageBubble,
                              fromCoach ? styles.coachMessage : styles.studentMessage,
                              {
                                backgroundColor: fromCoach
                                  ? theme.backgroundSelected
                                  : theme.surface,
                                borderColor: fromCoach ? theme.primary : theme.border,
                              },
                            ]}>
                            <ThemedText type="smallBold" themeColor="primary">
                              {t(
                                fromCoach
                                  ? 'messaging.coachAuthor'
                                  : 'messaging.studentAuthor'
                              )}
                            </ThemedText>
                            <ThemedText>{message.body}</ThemedText>
                            <ThemedText type="small" themeColor="textMuted">
                              {formatDate(message.createdAt)}
                            </ThemedText>
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  <View style={styles.composer}>
                    <TextField
                      editable={!sending}
                      error={
                        notice === 'invalidMessage'
                          ? t('messaging.invalidMessageBody')
                          : undefined
                      }
                      label={t('messaging.responseLabel')}
                      maxLength={messageBodyMaxLength + 1}
                      multiline
                      onChangeText={setDraft}
                      placeholder={t('messaging.responsePlaceholder')}
                      style={styles.messageInput}
                      value={draft}
                    />
                    <Button
                      disabled={sending}
                      label={t(
                        sending ? 'messaging.sending' : 'messaging.sendAction'
                      )}
                      onPress={() => void submitReply()}
                    />
                  </View>
                </>
              ) : (
                <Feedback
                  message={t('messaging.selectThreadBody')}
                  title={t('messaging.selectThreadTitle')}
                />
              )}
            </Card>
          ) : null}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centeredScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  page: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flex: 1,
    alignSelf: 'center',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
  messagingLayout: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    gap: Spacing.three,
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  threadListPanel: {
    width: 320,
    minHeight: 0,
    gap: Spacing.three,
  },
  detailPanel: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    gap: Spacing.three,
  },
  mobilePanel: {
    width: '100%',
    flex: 1,
  },
  threadList: {
    gap: Spacing.two,
  },
  scrollArea: {
    flex: 1,
  },
  threadRow: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  threadRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  contextHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  contextText: {
    flex: 1,
    minWidth: 220,
    gap: Spacing.one,
  },
  messages: {
    gap: Spacing.two,
  },
  messageBubble: {
    maxWidth: '86%',
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  coachMessage: {
    alignSelf: 'flex-end',
  },
  studentMessage: {
    alignSelf: 'flex-start',
  },
  composer: {
    gap: Spacing.three,
  },
  messageInput: {
    minHeight: 96,
    paddingVertical: Spacing.three,
    textAlignVertical: 'top',
  },
});
