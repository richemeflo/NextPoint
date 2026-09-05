import * as Linking from 'expo-linking';
import { Redirect, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  sanitizeGoogleOAuthUrl,
} from '@/features/auth/google-oauth';
import { exchangeGoogleOAuthCode } from '@/features/auth/auth-service';
import { useTranslation } from '@/i18n';

export default function GoogleAuthCallbackScreen() {
  const { status } = useAuth();
  const { locale } = useTranslation();
  const started = useRef(false);
  const [failed, setFailed] = useState(false);
  const labels = {
    fr: { loading: 'Connexion Google en cours...', error: 'Le retour Google est invalide ou a expiré.' },
    en: { loading: 'Completing Google sign-in...', error: 'The Google callback is invalid or has expired.' },
    es: { loading: 'Completando el acceso con Google...', error: 'El retorno de Google no es válido o ha caducado.' },
  }[locale];

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const callbackUrl =
      Platform.OS === 'web' && typeof globalThis.location !== 'undefined'
        ? globalThis.location.href
        : null;

    void (callbackUrl ? Promise.resolve(callbackUrl) : Linking.getInitialURL())
      .then(async (url) => {
        if (!url) return { ok: false as const };
        const result = await exchangeGoogleOAuthCode(url);
        sanitizeGoogleOAuthUrl();
        return result;
      })
      .then((result) => {
        if (!result.ok) setFailed(true);
      })
      .catch(() => setFailed(true));
  }, []);

  if (status === 'authenticated' || status === 'legal-acceptance-required') {
    return (
      <Redirect
        href={
          (status === 'legal-acceptance-required' ? '/complete-signup' : '/') as Href
        }
      />
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.content}>
        {failed ? (
          <Feedback title="Google" message={labels.error} tone="error" />
        ) : (
          <ThemedText type="small" themeColor="textMuted">
            {labels.loading}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  content: { maxWidth: 520, padding: Spacing.four, width: '100%' },
});
