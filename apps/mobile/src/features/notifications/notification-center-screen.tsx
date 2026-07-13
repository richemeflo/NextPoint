import { resolveNotificationLink, type AppRole } from '@nextpoint/shared';
import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import {
  getNotifications,
  getPushPreference,
  markAllNotificationsRead,
  markNotificationRead,
  updatePushPreference,
  type AppNotification,
  type PushPreference,
} from '@/features/notifications/notification-service';
import {
  buildPushRefusalPreference,
  requestClientPushPermission,
} from '@/features/notifications/push-permission';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export function NotificationCenterScreen({ role }: { role: AppRole }) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pushPreference, setPushPreference] = useState<PushPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<'loadError' | 'saveError' | 'linkMissing' | null>(
    null
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;

    Promise.all([getNotifications(), getPushPreference()]).then(
      ([notificationsResult, preferenceResult]) => {
        if (!mounted) return;

        if (!notificationsResult.ok || !preferenceResult.ok) {
          setNotice('loadError');
        } else {
          setNotifications(notificationsResult.data);
          setPushPreference(preferenceResult.data);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
    };
  }, []);

  const registerPushPreference = async (accept: boolean) => {
    setNotice(null);
    const input = accept
      ? await requestClientPushPermission()
      : buildPushRefusalPreference();
    const result = await updatePushPreference(input);

    if (!result.ok) {
      setNotice('saveError');
      return;
    }

    setPushPreference(result.data);
  };

  const markAllRead = async () => {
    const result = await markAllNotificationsRead();
    if (!result.ok) {
      setNotice('saveError');
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        readAt: notification.readAt ?? new Date().toISOString(),
      }))
    );
  };

  const openNotification = async (notification: AppNotification) => {
    const markResult = notification.readAt
      ? null
      : await markNotificationRead(notification.id);

    if (markResult?.ok) {
      setNotifications((current) =>
        current.map((currentNotification) =>
          currentNotification.id === notification.id
            ? markResult.data
            : currentNotification
        )
      );
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
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  const permissionLabel = pushPreference
    ? t(`notifications.pushStatus.${pushPreference.permissionStatus}`)
    : t('notifications.pushStatus.undetermined');

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <Card elevated style={styles.preferences}>
            <View style={styles.preferenceText}>
              <ThemedText type="subtitle">{t('notifications.pushTitle')}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('notifications.pushBody', { status: permissionLabel })}
              </ThemedText>
            </View>
            <View style={styles.actions}>
              <Button
                label={t('notifications.pushAcceptAction')}
                onPress={() => void registerPushPreference(true)}
              />
              <Button
                label={t('notifications.pushRefuseAction')}
                onPress={() => void registerPushPreference(false)}
                variant="secondary"
              />
            </View>
          </Card>

          <View style={styles.listHeader}>
            <View>
              <ThemedText type="subtitle">{t('notifications.listTitle')}</ThemedText>
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

          {loading ? (
            <ThemedText themeColor="textMuted">{t('notifications.loading')}</ThemedText>
          ) : notifications.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Feedback
                message={t('notifications.emptyBody')}
                title={t('notifications.emptyTitle')}
              />
            </Card>
          ) : (
            <View style={styles.list}>
              {notifications.map((notification) => {
                const unread = !notification.readAt;

                return (
                  <Pressable
                    key={notification.id}
                    onPress={() => void openNotification(notification)}
                    style={({ pressed }) => [
                      styles.notificationCard,
                      {
                        backgroundColor: unread
                          ? theme.surfaceElevated
                          : theme.surface,
                        borderColor: unread ? theme.primary : theme.border,
                        opacity: pressed ? 0.82 : 1,
                      },
                    ]}>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationTitleRow}>
                        <ThemedText type="smallBold">{notification.title}</ThemedText>
                        <View
                          style={[
                            styles.readMarker,
                            {
                              backgroundColor: unread
                                ? theme.primary
                                : theme.border,
                            },
                          ]}>
                          <ThemedText
                            numberOfLines={1}
                            type="smallBold"
                            themeColor={unread ? 'surface' : 'textMuted'}>
                            {t(unread ? 'notifications.unread' : 'notifications.read')}
                          </ThemedText>
                        </View>
                      </View>
                      <ThemedText themeColor="textMuted">{notification.body}</ThemedText>
                      <ThemedText type="small" themeColor="textMuted">
                        {formatDate(notification.createdAt)}
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
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
  preferences: {
    gap: Spacing.three,
  },
  preferenceText: {
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  list: {
    gap: Spacing.three,
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.four,
  },
  notificationContent: {
    gap: Spacing.two,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  readMarker: {
    minHeight: 28,
    minWidth: 68,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});
