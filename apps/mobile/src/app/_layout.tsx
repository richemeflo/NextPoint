import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import Stack from 'expo-router/stack';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getAuthRouteAccess } from '@/features/auth/access-policy';
import { AuthProvider } from '@/features/auth/auth-provider';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

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
  const { status } = useAuth();
  const access = getAuthRouteAccess(status);

  if (access.isLoading) {
    return <SessionLoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={access.allowAuthRoutes}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={access.allowAppRoutes}>
        <Stack.Screen name="(app)" />
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
      <ThemedRoot />
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
});
