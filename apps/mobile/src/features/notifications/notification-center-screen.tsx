import {
  resolveNotificationLink,
  schedulingTimeZone,
  type AppRole,
} from '@nextpoint/shared';
import { router, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import {
  MaxContentWidth,
  Radii,
  Spacing,
  type ThemeColor,
} from '@/constants/theme';
import {
  deleteNotification,
  getNotificationsPage,
  getPushPreference,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  updatePushPreference,
  type AppNotification,
  type PushPreference,
} from '@/features/notifications/notification-service';
import {
  decrementNotificationUnreadCount,
  setNotificationUnreadCount,
  useNotificationUnreadCount,
} from '@/features/notifications/notification-unread-count';
import {
  mergeNotificationPages,
  type NotificationCursor,
} from '@/features/notifications/notification-pagination';
import {
  buildPushRefusalPreference,
  requestClientPushPermission,
} from '@/features/notifications/push-permission';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

const notificationVisuals = {
  booking_requested: {
    icon: {
      ios: 'calendar.badge.clock',
      android: 'pending_actions',
      web: 'pending_actions',
    },
    color: 'warning',
    surface: 'warningSurface',
  },
  booking_approved: {
    icon: {
      ios: 'checkmark.circle',
      android: 'event_available',
      web: 'event_available',
    },
    color: 'success',
    surface: 'successSurface',
  },
  booking_refused: {
    icon: {
      ios: 'xmark.circle',
      android: 'event_busy',
      web: 'event_busy',
    },
    color: 'error',
    surface: 'errorSurface',
  },
  booking_cancelled: {
    icon: {
      ios: 'xmark.circle',
      android: 'event_busy',
      web: 'event_busy',
    },
    color: 'error',
    surface: 'errorSurface',
  },
  booking_modified: {
    icon: {
      ios: 'pencil',
      android: 'edit_calendar',
      web: 'edit_calendar',
    },
    color: 'primary',
    surface: 'backgroundSelected',
  },
} satisfies Record<
  AppNotification['type'],
  {
    icon: SymbolViewProps['name'];
    color: ThemeColor;
    surface: ThemeColor;
  }
>;

type NotificationListItemProps = {
  notification: AppNotification;
  deletePending: boolean;
  deleting: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onOpen: () => void;
  onRequestDelete: () => void;
};

function NotificationListItem({
  notification,
  deletePending,
  deleting,
  onCancelDelete,
  onConfirmDelete,
  onOpen,
  onRequestDelete,
}: NotificationListItemProps) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const unread = !notification.readAt;
  const visual = notificationVisuals[notification.type];
  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: schedulingTimeZone,
  }).format(new Date(notification.createdAt));

  return (
    <View
      style={[
        styles.notificationItem,
        {
          backgroundColor: unread ? theme.surfaceElevated : theme.surface,
          borderColor: theme.border,
          borderLeftColor: unread ? theme.primary : theme.border,
          borderLeftWidth: unread ? 4 : 1,
          opacity: deleting ? 0.55 : 1,
        },
      ]}>
      <View style={styles.notificationRow}>
        <Pressable
          accessibilityLabel={notification.title}
          accessibilityRole="button"
          disabled={deleting}
          onPress={onOpen}
          style={({ pressed }) => [
            styles.notificationOpenAction,
            { opacity: pressed ? 0.72 : 1 },
          ]}>
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: theme[visual.surface] },
            ]}>
            <SymbolView
              name={visual.icon}
              size={21}
              weight="semibold"
              tintColor={theme[visual.color]}
            />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <ThemedText numberOfLines={2} type="smallBold">
                {notification.title}
              </ThemedText>
              {unread ? (
                <View
                  accessibilityLabel={t('notifications.unread')}
                  accessible
                  style={[
                    styles.unreadDot,
                    { backgroundColor: theme.primary },
                  ]}
                />
              ) : null}
            </View>
            <ThemedText numberOfLines={2} type="small" themeColor="textMuted">
              {notification.body}
            </ThemedText>
            <ThemedText
              type="small"
              themeColor="textMuted"
              style={styles.notificationDate}>
              {formattedDate}
            </ThemedText>
          </View>
        </Pressable>
        <Pressable
          accessibilityLabel={t('notifications.deleteAction')}
          accessibilityRole="button"
          disabled={deleting}
          onPress={onRequestDelete}
          style={({ pressed }) => [
            styles.deleteAction,
            {
              borderColor: theme.border,
              backgroundColor: pressed ? theme.errorSurface : 'transparent',
            },
          ]}>
          <SymbolView
            name={{ ios: 'trash', android: 'delete', web: 'delete' }}
            size={19}
            weight="semibold"
            tintColor={theme.textMuted}
          />
        </Pressable>
      </View>
      {deletePending ? (
        <View
          style={[styles.deleteConfirmation, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={styles.deletePrompt}>
            {t('notifications.deleteConfirm')}
          </ThemedText>
          <View style={styles.deleteConfirmationActions}>
            <Pressable
              accessibilityLabel={t('notifications.cancelDeleteAction')}
              accessibilityRole="button"
              disabled={deleting}
              onPress={onCancelDelete}
              style={({ pressed }) => [
                styles.confirmationAction,
                {
                  borderColor: theme.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={18}
                weight="semibold"
                tintColor={theme.textMuted}
              />
            </Pressable>
            <Pressable
              accessibilityLabel={t('notifications.confirmDeleteAction')}
              accessibilityRole="button"
              disabled={deleting}
              onPress={onConfirmDelete}
              style={({ pressed }) => [
                styles.confirmationAction,
                {
                  backgroundColor: theme.errorSurface,
                  borderColor: theme.error,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <SymbolView
                name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                size={18}
                weight="semibold"
                tintColor={theme.error}
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function NotificationCenterScreen({ role }: { role: AppRole }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushPreference, setPushPreference] = useState<PushPreference | null>(null);
  const [pushPreferenceSaving, setPushPreferenceSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<NotificationCursor | null>(null);
  const unreadCount = useNotificationUnreadCount();
  const [notice, setNotice] = useState<
    'loadError' | 'saveError' | 'deleteError' | 'linkMissing' | null
  >(null);
  const [pendingDeleteNotificationId, setPendingDeleteNotificationId] =
    useState<string | null>(null);
  const [deletingNotificationId, setDeletingNotificationId] = useState<
    string | null
  >(null);
  const loadMoreLock = useRef(false);
  const markingNotificationIds = useRef(new Set<string>());
  const mounted = useRef(true);
  const markedAllReadAt = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;

    void Promise.all([
      getNotificationsPage(),
      getUnreadNotificationCount(),
      getPushPreference(),
    ])
      .then(([notificationsResult, unreadResult, preferenceResult]) => {
        if (!mounted.current) return;

        if (
          !notificationsResult.ok ||
          !unreadResult.ok ||
          !preferenceResult.ok
        ) {
          setNotice('loadError');
        } else {
          setNotifications(notificationsResult.data.data);
          setHasMore(notificationsResult.data.hasMore);
          setNextCursor(notificationsResult.data.nextCursor);
          setNotificationUnreadCount(unreadResult.count);
          setPushPreference(preferenceResult.data);
        }
      })
      .catch(() => {
        if (!mounted.current) return;
        setNotice('loadError');
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  const loadMoreNotifications = async () => {
    if (
      loadMoreLock.current ||
      loading ||
      !hasMore ||
      !nextCursor
    ) {
      return;
    }

    loadMoreLock.current = true;
    setLoadingMore(true);
    try {
      const result = await getNotificationsPage({ cursor: nextCursor });
      if (!mounted.current) return;

      if (!result.ok) {
        setNotice('loadError');
        return;
      }

      const nextNotifications = markedAllReadAt.current
        ? result.data.data.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? markedAllReadAt.current,
          }))
        : result.data.data;
      setNotifications((current) =>
        mergeNotificationPages(current, nextNotifications)
      );
      setHasMore(result.data.hasMore);
      setNextCursor(result.data.nextCursor);
    } catch {
      if (mounted.current) setNotice('loadError');
    } finally {
      loadMoreLock.current = false;
      if (mounted.current) setLoadingMore(false);
    }
  };

  const registerPushPreference = async (accept: boolean) => {
    if (pushPreferenceSaving) return;

    setPushPreferenceSaving(true);
    setNotice(null);
    try {
      const input = accept
        ? await requestClientPushPermission()
        : await buildPushRefusalPreference();
      const result = await updatePushPreference(input);

      if (!result.ok) {
        setNotice('saveError');
        return;
      }

      setPushPreference(result.data);
    } catch {
      setNotice('saveError');
    } finally {
      setPushPreferenceSaving(false);
    }
  };

  const markAllRead = async () => {
    try {
      const result = await markAllNotificationsRead();
      if (!result.ok) {
        setNotice('saveError');
        return;
      }

      const readAt = new Date().toISOString();
      markedAllReadAt.current = readAt;
      setNotificationUnreadCount(0);
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        }))
      );
    } catch {
      setNotice('saveError');
    }
  };

  const removeNotification = async (notificationId: string) => {
    if (deletingNotificationId) return;

    const deletedNotification = notifications.find(
      (notification) => notification.id === notificationId
    );
    setDeletingNotificationId(notificationId);
    setNotice(null);
    try {
      const result = await deleteNotification(notificationId);
      if (!result.ok) {
        setNotice('deleteError');
        return;
      }

      setNotifications((current) =>
        current.filter((notification) => notification.id !== result.id)
      );
      if (deletedNotification && !deletedNotification.readAt) {
        decrementNotificationUnreadCount();
      }
      setPendingDeleteNotificationId(null);
    } catch {
      setNotice('deleteError');
    } finally {
      setDeletingNotificationId(null);
    }
  };

  const openNotification = async (notification: AppNotification) => {
    const shouldMarkRead =
      !notification.readAt &&
      !markingNotificationIds.current.has(notification.id);
    if (shouldMarkRead) markingNotificationIds.current.add(notification.id);

    try {
      const markResult = shouldMarkRead
        ? await markNotificationRead(notification.id)
        : null;

      if (markResult?.ok) {
        setNotifications((current) =>
          current.map((currentNotification) =>
            currentNotification.id === notification.id
              ? markResult.data
              : currentNotification
          )
        );
        decrementNotificationUnreadCount();
      } else if (markResult && !markResult.ok) {
        setNotice('saveError');
      }

      const href = resolveNotificationLink(
        { linkType: notification.linkType, linkId: notification.linkId },
        role
      );

      if (!href) {
        setNotice('linkMissing');
        return;
      }

      router.push(href as Href);
    } catch {
      setNotice('saveError');
    } finally {
      if (shouldMarkRead) {
        markingNotificationIds.current.delete(notification.id);
      }
    }
  };

  const pushUnavailableOnWeb = Platform.OS === 'web';
  const permissionLabel = pushUnavailableOnWeb
    ? t('notifications.pushStatus.unavailableWeb')
    : pushPreference
      ? t(`notifications.pushStatus.${pushPreference.permissionStatus}`)
      : t('notifications.pushStatus.undetermined');
  const pushEnabled =
    !pushUnavailableOnWeb && pushPreference?.permissionStatus === 'granted';
  const pushUnavailable =
    pushUnavailableOnWeb ||
    pushPreference?.permissionStatus === 'unavailable';

  return (
    <ThemedView style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.scrollContent}
        data={notifications}
        initialNumToRender={12}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        keyExtractor={(notification) => notification.id}
        ListEmptyComponent={
          <View style={styles.emptyResult}>
            {loading ? (
              <ThemedText themeColor="textMuted">
                {t('notifications.loading')}
              </ThemedText>
            ) : (
              <Card style={styles.emptyCard}>
                <Feedback
                  message={t('notifications.emptyBody')}
                  title={t('notifications.emptyTitle')}
                />
              </Card>
            )}
          </View>
        }
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.heading}>
              <ThemedText type="smallBold" themeColor="primary">
                {t(role === 'coach' ? 'role.coachLabel' : 'role.eleveLabel')}
              </ThemedText>
              <ThemedText type="title">{t('notifications.title')}</ThemedText>
              <ThemedText themeColor="textMuted">
                {t('notifications.subtitle')}
              </ThemedText>
            </View>

            {notice ? (
              <Feedback
                message={t(`notifications.${notice}Body`)}
                title={t(`notifications.${notice}Title`)}
                tone={notice === 'linkMissing' ? 'warning' : 'error'}
              />
            ) : null}

            <View
              style={[
                styles.preferences,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  opacity: pushPreferenceSaving ? 0.65 : 1,
                },
              ]}>
              <View
                style={[
                  styles.preferenceIcon,
                  {
                    backgroundColor: pushEnabled
                      ? theme.successSurface
                      : theme.backgroundSelected,
                  },
                ]}>
                <SymbolView
                  name={
                    pushEnabled
                      ? {
                          ios: 'bell.badge.fill',
                          android: 'notifications_active',
                          web: 'notifications_active',
                        }
                      : {
                          ios: 'bell.slash',
                          android: 'notifications_off',
                          web: 'notifications_off',
                        }
                  }
                  size={20}
                  weight="semibold"
                  tintColor={pushEnabled ? theme.success : theme.textMuted}
                />
              </View>
              <View style={styles.preferenceText}>
                <ThemedText type="smallBold">
                  {t('notifications.pushTitle')}
                </ThemedText>
                <ThemedText
                  type="small"
                  themeColor={pushEnabled ? 'success' : 'textMuted'}>
                  {permissionLabel}
                </ThemedText>
              </View>
              <View style={styles.preferenceControl}>
                <Switch
                  accessibilityLabel={t('notifications.pushTitle')}
                  accessibilityState={{
                    checked: pushEnabled,
                    disabled: pushUnavailable,
                  }}
                  disabled={loading || pushPreferenceSaving || pushUnavailable}
                  onValueChange={(enabled) =>
                    void registerPushPreference(enabled)
                  }
                  trackColor={{ false: theme.border, true: theme.success }}
                  value={pushEnabled}
                />
              </View>
            </View>

            <View style={styles.listHeader}>
              <View>
                <ThemedText type="subtitle">
                  {t('notifications.listTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('notifications.unreadCount', { count: unreadCount })}
                </ThemedText>
              </View>
              <Button
                disabled={unreadCount === 0}
                label={t('notifications.markAllReadAction')}
                onPress={() => void markAllRead()}
                variant="secondary"
              />
            </View>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={theme.primary} />
              <ThemedText type="small" themeColor="textMuted">
                {t('notifications.loadingMore')}
              </ThemedText>
            </View>
          ) : null
        }
        maxToRenderPerBatch={12}
        onEndReached={() => void loadMoreNotifications()}
        onEndReachedThreshold={0.4}
        renderItem={({ item: notification }) => (
          <NotificationListItem
            deletePending={pendingDeleteNotificationId === notification.id}
            deleting={deletingNotificationId === notification.id}
            notification={notification}
            onCancelDelete={() => setPendingDeleteNotificationId(null)}
            onConfirmDelete={() => void removeNotification(notification.id)}
            onOpen={() => void openNotification(notification)}
            onRequestDelete={() =>
              setPendingDeleteNotificationId(notification.id)
            }
          />
        )}
        style={styles.listScroller}
        windowSize={7}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listScroller: {
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
    marginBottom: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
  preferences: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: Radii.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  preferenceIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceText: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.one,
  },
  preferenceControl: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    gap: Spacing.two,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  emptyCard: {
    padding: 0,
    borderWidth: 0,
  },
  emptyResult: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  listSeparator: {
    height: Spacing.two,
  },
  loadingMore: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    width: '100%',
  },
  notificationItem: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    borderRadius: Radii.medium,
    overflow: 'hidden',
  },
  notificationRow: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  notificationOpenAction: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.two,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  unreadDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 4,
    marginTop: 6,
  },
  notificationDate: {
    opacity: 0.78,
  },
  deleteAction: {
    width: 48,
    minHeight: 48,
    flexShrink: 0,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmation: {
    minHeight: 56,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  deletePrompt: {
    flex: 1,
  },
  deleteConfirmationActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  confirmationAction: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
