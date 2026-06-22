import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import Stack from 'expo-router/stack';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { getAuthRouteAccess } from '@/features/auth/access-policy';
import { AuthProvider } from '@/features/auth/auth-provider';
import { useAuth } from '@/features/auth/auth-context';
import { ProfileLocaleSync } from '@/features/profiles/profile-locale-sync';
import { useTheme } from '@/hooks/use-theme';
import { I18nProvider, useTranslation } from '@/i18n';

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
  const access = getAuthRouteAccess(status, role);

  if (access.isLoading) {
    return <SessionLoadingScreen />;
  }

  if (access.hasAccessError) {
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
