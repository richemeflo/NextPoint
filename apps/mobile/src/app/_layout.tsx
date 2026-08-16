import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type ErrorBoundaryProps,
  usePathname,
} from 'expo-router';
import Stack from 'expo-router/stack';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AppErrorFallback } from '@/components/app-error-fallback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { getAuthRouteAccess } from '@/features/auth/access-policy';
import { AuthProvider } from '@/features/auth/auth-provider';
import { useAuth } from '@/features/auth/auth-context';
import '@/features/notifications/push-notification-handler';
import { ProfileLocaleSync } from '@/features/profiles/profile-locale-sync';
import { useTheme } from '@/hooks/use-theme';
import { I18nProvider, useTranslation } from '@/i18n';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <I18nProvider>
      <AppErrorFallback error={error} retry={retry} scope="root" />
    </I18nProvider>
  );
}

function SessionLoadingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.loadingScreen}>
      <View style={styles.loadingContent}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('auth.sessionLoading')}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

function RootNavigator() {
  const { role, signOut, status } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const access = getAuthRouteAccess(status, role);
  const isAlwaysPublicRoute = [
    '/activate-student',
    '/data-rights',
    '/delete-account',
    '/legal',
    '/privacy',
    '/reset-password',
    '/support',
    '/terms',
  ].includes(pathname);

  if (access.isLoading && !isAlwaysPublicRoute) {
    return <SessionLoadingScreen />;
  }

  if (access.hasAccessError && !isAlwaysPublicRoute) {
    return (
      <ThemedView style={styles.loadingScreen}>
        <View style={styles.accessError}>
          <ThemedText type="subtitle">{t('access.errorTitle')}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t('access.errorBody')}
          </ThemedText>
          <Button label={t('auth.signOutAction')} onPress={() => void signOut()} />
        </View>
      </ThemedView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="activate-student" />
      <Stack.Screen name="data-rights" />
      <Stack.Screen name="delete-account" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="support" />
      <Stack.Screen name="terms" />
      <Stack.Protected guard={access.allowAuthRoutes}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={access.allowCoachRoutes}>
        <Stack.Screen name="coach" />
      </Stack.Protected>
      <Stack.Protected guard={access.allowEleveRoutes}>
        <Stack.Screen name="eleve" />
      </Stack.Protected>
    </Stack>
  );
}

function ThemedRoot() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <I18nProvider>
        <ProfileLocaleSync />
        <ThemedRoot />
      </I18nProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  accessError: {
    width: '100%',
    maxWidth: 520,
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
