import { schedulingTimeZone } from '@nextpoint/shared';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import type { CoachMessageThread } from '@/features/messaging/coach-messaging-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

type CoachMessage = CoachMessageThread['messages'][number];

export const CoachMessageRow = memo(function CoachMessageRow({
  coachId,
  message,
}: {
  coachId: string;
  message: CoachMessage;
}) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const fromCoach = message.senderId === coachId;
  const createdAt = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: schedulingTimeZone,
  }).format(new Date(message.createdAt));

  return (
    <View
      style={[
        styles.bubble,
        fromCoach ? styles.coachMessage : styles.studentMessage,
        {
          backgroundColor: fromCoach
            ? theme.backgroundSelected
            : theme.surface,
          borderColor: fromCoach ? theme.primary : theme.border,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="primary">
        {t(fromCoach ? 'messaging.coachAuthor' : 'messaging.studentAuthor')}
      </ThemedText>
      <ThemedText>{message.body}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {createdAt}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
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
});
