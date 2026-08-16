import type { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type AppErrorScope = 'messaging' | 'planning' | 'root';

type AppErrorFallbackProps = Pick<ErrorBoundaryProps, 'error' | 'retry'> & {
  scope: AppErrorScope;
};

const copyByScope: Record<
  AppErrorScope,
  { body: TranslationKey; title: TranslationKey }
> = {
  root: {
    title: 'errorBoundary.rootTitle',
    body: 'errorBoundary.rootBody',
  },
  planning: {
    title: 'errorBoundary.planningTitle',
    body: 'errorBoundary.planningBody',
  },
  messaging: {
    title: 'errorBoundary.messagingTitle',
    body: 'errorBoundary.messagingBody',
  },
};

export function AppErrorFallback({ error, retry, scope }: AppErrorFallbackProps) {
  const { t } = useTranslation();
  const copy = copyByScope[scope];

  return (
    <ThemedView style={styles.screen}>
      <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.content}>
        <ThemedText type="subtitle">{t(copy.title)}</ThemedText>
        <ThemedText themeColor="textMuted">{t(copy.body)}</ThemedText>
        {__DEV__ ? (
          <ThemedText selectable type="code" themeColor="error">
            {error.message}
          </ThemedText>
        ) : null}
        <Button label={t('errorBoundary.retryAction')} onPress={() => void retry()} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
});
