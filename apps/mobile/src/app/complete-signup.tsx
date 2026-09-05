import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { acceptCurrentLegalTerms } from '@/features/auth/auth-service';
import { LegalAcceptance } from '@/features/legal/legal-acceptance';
import { useTranslation } from '@/i18n';

export default function CompleteSignupScreen() {
  const { locale } = useTranslation();
  const { refreshAccess, signOut } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const labels = {
    fr: { title: 'Finalisez votre inscription', subtitle: 'Validez les documents applicables avant d’accéder à votre espace élève.', action: 'Continuer', loading: 'Validation...', error: 'La validation a échoué. Réessayez.', signOut: 'Se déconnecter' },
    en: { title: 'Complete your registration', subtitle: 'Accept the applicable documents before accessing your student space.', action: 'Continue', loading: 'Saving...', error: 'Approval failed. Please try again.', signOut: 'Sign out' },
    es: { title: 'Completa tu registro', subtitle: 'Acepta los documentos aplicables antes de acceder a tu espacio de alumno.', action: 'Continuar', loading: 'Guardando...', error: 'La validación ha fallado. Inténtalo de nuevo.', signOut: 'Cerrar sesión' },
  }[locale];

  const submit = async () => {
    if (!accepted) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    const result = await acceptCurrentLegalTerms();
    if (result.ok) await refreshAccess();
    else setFailed(true);
    setSubmitting(false);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="title">{labels.title}</ThemedText>
            <ThemedText themeColor="textMuted">{labels.subtitle}</ThemedText>
          </View>
          <Card elevated style={styles.card}>
            <LegalAcceptance accepted={accepted} onChange={(value) => { setAccepted(value); if (value) setShowError(false); }} showError={showError} />
            {failed ? <Feedback title={labels.title} message={labels.error} tone="error" /> : null}
            <Button disabled={submitting} label={submitting ? labels.loading : labels.action} onPress={() => void submit()} />
            <Button disabled={submitting} label={labels.signOut} onPress={() => void signOut()} variant="secondary" />
          </Card>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  content: { gap: Spacing.four, maxWidth: MaxContentWidth, padding: Spacing.four, width: '100%' },
  heading: { alignSelf: 'center', gap: Spacing.two, maxWidth: 520, width: '100%' },
  card: { alignSelf: 'center', gap: Spacing.three, maxWidth: 520, width: '100%' },
});
