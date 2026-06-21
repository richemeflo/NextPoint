import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FeedbackTone = 'info' | 'success' | 'warning' | 'error';

const toneToken = {
  info: 'secondary',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

export function Feedback({
  title,
  message,
  tone = 'info',
}: {
  title: string;
  message: string;
  tone?: FeedbackTone;
}) {
  const theme = useTheme();
  const color = theme[toneToken[tone]];

  return (
    <View style={[styles.feedback, { borderColor: color, backgroundColor: theme.surface }]}>
      <View style={[styles.marker, { backgroundColor: color }]} />
      <View style={styles.content}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {message}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedback: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  marker: {
    width: Spacing.one,
    borderRadius: Radii.small,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
});
