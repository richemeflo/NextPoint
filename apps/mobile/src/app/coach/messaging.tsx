import {
  isCoachMessageThreadUnread,
  messageBodyMaxLength,
  schedulingTimeZone,
  type BookingStatus,
} from '@nextpoint/shared';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  getCoachThreadMessages,
  markCoachMessageThreadRead,
  sendCoachMessage,
  type CoachMessageThread,
} from '@/features/messaging/coach-messaging-service';
import {
  acquireMutationLock,
  releaseMutationLock,
} from '@/features/mutations/mutation-lock';
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
  const [hasMoreThreads, setHasMoreThreads] = useState(false);
  const [loadingMoreThreads, setLoadingMoreThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const sendLock = useRef(false);
  const threadPageLock = useRef(false);
  const messagePageLock = useRef(false);
  const messageRequestVersion = useRef(0);
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

    void getCoachMessageThreads()
      .then((result) => {
        if (!mounted) return;

        if (!result.ok) {
          setNotice('loadError');
        } else {
          setThreads(result.data);
          setHasMoreThreads(result.hasMore);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setNotice('loadError');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role]);

  const formatDate = (value: string, includeTime = true) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...(includeTime ? { timeStyle: 'short' as const } : {}),
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  const loadMoreThreads = async () => {
    if (!hasMoreThreads || !acquireMutationLock(threadPageLock)) return;

    setLoadingMoreThreads(true);
    try {
      const result = await getCoachMessageThreads(threads.length);
      if (!result.ok) {
        setNotice('loadError');
        return;
      }

      setThreads((current) => {
        const knownIds = new Set(current.map((thread) => thread.id));
        return [
          ...current,
          ...result.data.filter((thread) => !knownIds.has(thread.id)),
        ];
      });
      setHasMoreThreads(result.hasMore);
    } catch {
      setNotice('loadError');
    } finally {
      setLoadingMoreThreads(false);
      releaseMutationLock(threadPageLock);
    }
  };

  const openThread = async (thread: CoachMessageThread) => {
    const requestVersion = ++messageRequestVersion.current;
    setSelectedThreadId(thread.id);
    setDraft('');
    setNotice(null);
    setLoadingMessages(true);
    setHasOlderMessages(false);

    try {
      const [messagesResult, readResult] = await Promise.all([
        getCoachThreadMessages(thread.id),
        isCoachMessageThreadUnread(thread)
          ? markCoachMessageThreadRead(thread)
          : Promise.resolve(null),
      ]);
      if (messageRequestVersion.current !== requestVersion) return;

      if (!messagesResult.ok) {
        setNotice('loadError');
      } else {
        setThreads((current) =>
          current.map((item) =>
            item.id === thread.id
              ? { ...item, messages: messagesResult.data }
              : item
          )
        );
        setHasOlderMessages(messagesResult.hasMore);
      }

      if (readResult && !readResult.ok) {
        setNotice('saveError');
      } else if (readResult) {
        setThreads((current) =>
          current.map((item) =>
            item.id === readResult.data.id
              ? {
                  ...item,
                  coachReadAt: readResult.data.coachReadAt,
                  lastMessageAt: readResult.data.lastMessageAt,
                }
              : item
          )
        );
      }
    } catch {
      if (messageRequestVersion.current !== requestVersion) return;
      setNotice('loadError');
    } finally {
      if (messageRequestVersion.current === requestVersion) {
        setLoadingMessages(false);
      }
    }
  };

  const loadOlderMessages = async () => {
    const oldestMessage = selectedThread?.messages[0];
    if (
      !selectedThread ||
      !oldestMessage ||
      !hasOlderMessages ||
      !acquireMutationLock(messagePageLock)
    ) {
      return;
    }

    const threadId = selectedThread.id;
    const requestVersion = messageRequestVersion.current;
    setLoadingOlderMessages(true);
    try {
      const result = await getCoachThreadMessages(
        threadId,
        oldestMessage.createdAt
      );
      if (messageRequestVersion.current !== requestVersion) return;
      if (!result.ok) {
        setNotice('loadError');
        return;
      }

      setThreads((current) =>
        current.map((thread) => {
          if (thread.id !== threadId) return thread;
          const knownIds = new Set(thread.messages.map((message) => message.id));
          return {
            ...thread,
            messages: [
              ...result.data.filter((message) => !knownIds.has(message.id)),
              ...thread.messages,
            ],
          };
        })
      );
      setHasOlderMessages(result.hasMore);
    } catch {
      setNotice('loadError');
    } finally {
      setLoadingOlderMessages(false);
      releaseMutationLock(messagePageLock);
    }
  };

  const closeThread = () => {
    messageRequestVersion.current += 1;
    setSelectedThreadId(null);
    setHasOlderMessages(false);
  };

  const submitReply = async () => {
    if (!selectedThread || !acquireMutationLock(sendLock)) return;

    setSending(true);
    setNotice(null);
    try {
      const result = await sendCoachMessage(selectedThread.id, draft);
      if (!result.ok) {
        setNotice(
          result.error === 'invalid_message' ? 'invalidMessage' : 'saveError'
        );
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
    } catch {
      setNotice('saveError');
    } finally {
      setSending(false);
      releaseMutationLock(sendLock);
    }
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
                  {hasMoreThreads ? (
                    <Button
                      disabled={loadingMoreThreads}
                      label={t(
                        loadingMoreThreads
                          ? 'messaging.loadingMore'
                          : 'messaging.loadMoreThreads'
                      )}
                      onPress={() => void loadMoreThreads()}
                      variant="secondary"
                    />
                  ) : null}
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
                      onPress={closeThread}
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
                    {loadingMessages ? (
                      <ThemedText themeColor="textMuted">
                        {t('messaging.loadingMessages')}
                      </ThemedText>
                    ) : null}
                    {hasOlderMessages ? (
                      <Button
                        disabled={loadingMessages || loadingOlderMessages}
                        label={t(
                          loadingOlderMessages
                            ? 'messaging.loadingMore'
                            : 'messaging.loadOlderMessages'
                        )}
                        onPress={() => void loadOlderMessages()}
                        variant="secondary"
                      />
                    ) : null}
                    {!loadingMessages && selectedThread.messages.length === 0 ? (
                      <ThemedText themeColor="textMuted">
                        {t('messaging.noMessages')}
                      </ThemedText>
                    ) : null}
                    {selectedThread.messages.length > 0
                      ? (
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
                        )
                      : null}
                  </ScrollView>

                  <View style={styles.composer}>
                    <TextField
                      editable={!sending && !loadingMessages}
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
                      disabled={sending || loadingMessages}
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
