import {
  isCoachMessageThreadUnread,
  schedulingTimeZone,
} from '@nextpoint/shared';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { CoachMessageThread } from '@/features/messaging/coach-messaging-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

type CoachMessageThreadRowProps = {
  active: boolean;
  onOpen: (thread: CoachMessageThread) => void;
  thread: CoachMessageThread;
};

export const CoachMessageThreadRow = memo(function CoachMessageThreadRow({
  active,
  onOpen,
  thread,
}: CoachMessageThreadRowProps) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const unread = isCoachMessageThreadUnread(thread);
  const lastMessage = thread.messages.at(-1);
  const startsAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: schedulingTimeZone,
  }).format(new Date(thread.context.startsAt));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(thread)}
      style={({ pressed }) => [
        styles.row,
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
      <View style={styles.header}>
        <ThemedText numberOfLines={1} type="smallBold">
          {thread.context.studentName ?? t('messaging.unknownStudent')}
        </ThemedText>
        <ThemedText
          type="smallBold"
          themeColor={unread ? 'primary' : 'textMuted'}>
          {t(unread ? 'messaging.unread' : 'messaging.read')}
        </ThemedText>
      </View>
      <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
        {startsAt} · {thread.context.location}
      </ThemedText>
      <ThemedText numberOfLines={2} themeColor="textMuted">
        {lastMessage?.body ?? t('messaging.noMessages')}
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
