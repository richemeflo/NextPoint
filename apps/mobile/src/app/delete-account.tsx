import { Stack, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { deleteAccount } from '@/features/legal/account-data-service';
import { LegalFooter } from '@/features/legal/legal-footer';
import { productName } from '@/features/legal/legal-config';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

const copy = {
  fr: {
    title: 'Supprimer mon compte',
    subtitle: 'Page publique de demande et parcours de suppression définitive.',
    signedOutTitle: 'Connectez-vous pour supprimer directement le compte',
    signedOutBody:
      "La suppression nécessite une authentification. Vous pouvez aussi envoyer une demande depuis la page « Vos données » si vous ne pouvez plus vous connecter.",
    signIn: 'Se connecter et continuer',
    warningTitle: 'Cette action est irréversible',
    warningBody:
      'Le compte, le profil, les relations, réservations, messages, forfaits, préférences et autres données rattachées seront supprimés. Les données légalement nécessaires à la défense de droits peuvent uniquement subsister dans une archive séparée et à accès restreint.',
    coachWarning:
      'Pour un compte coach, cette suppression retire également les disponibilités, tarifs, réservations et espaces de messagerie gérés par ce compte.',
    password: 'Mot de passe actuel',
    passwordPlaceholder: 'Confirmez votre identité',
    confirmation: 'Saisissez SUPPRIMER',
    confirmationPlaceholder: 'SUPPRIMER',
    action: 'Supprimer définitivement mon compte',
    loading: 'Suppression…',
    authErrorTitle: 'Authentification refusée',
    authErrorBody: 'Le mot de passe est incorrect. Le compte n’a pas été supprimé.',
    errorTitle: 'Suppression impossible',
    errorBody: 'La suppression n’a pas pu être finalisée. Réessayez ou contactez le support.',
    successTitle: 'Compte supprimé',
    successBody: 'Votre compte et ses données actives ont été supprimés.',
    home: "Retour à l'accueil",
  },
  en: {
    title: 'Delete my account',
    subtitle: 'Public request page and permanent account deletion flow.',
    signedOutTitle: 'Sign in to delete the account directly',
    signedOutBody:
      'Deletion requires authentication. You can also send a request from the “Your data” page if you can no longer sign in.',
    signIn: 'Sign in and continue',
    warningTitle: 'This action cannot be undone',
    warningBody:
      'The account, profile, relationships, bookings, messages, lesson packs, preferences, and other linked data will be deleted. Data strictly required for legal claims may only remain in a separate, access-restricted archive.',
    coachWarning:
      'For a coach account, this also removes availability, pricing, bookings, and messaging spaces managed by the account.',
    password: 'Current password',
    passwordPlaceholder: 'Confirm your identity',
    confirmation: 'Type DELETE',
    confirmationPlaceholder: 'DELETE',
    action: 'Permanently delete my account',
    loading: 'Deleting…',
    authErrorTitle: 'Authentication failed',
    authErrorBody: 'The password is incorrect. The account was not deleted.',
    errorTitle: 'Deletion failed',
    errorBody: 'Deletion could not be completed. Try again or contact support.',
    successTitle: 'Account deleted',
    successBody: 'Your account and active data have been deleted.',
    home: 'Back to home',
  },
  es: {
    title: 'Eliminar mi cuenta',
    subtitle: 'Página pública de solicitud y proceso de eliminación definitiva.',
    signedOutTitle: 'Inicia sesión para eliminar la cuenta directamente',
    signedOutBody:
      'La eliminación requiere autenticación. También puedes enviar una solicitud desde «Tus datos» si ya no puedes acceder.',
    signIn: 'Iniciar sesión y continuar',
    warningTitle: 'Esta acción es irreversible',
    warningBody:
      'Se eliminarán la cuenta, el perfil, las relaciones, reservas, mensajes, bonos, preferencias y demás datos vinculados. Los datos estrictamente necesarios para reclamaciones legales solo podrán conservarse en un archivo separado y restringido.',
    coachWarning:
      'Para una cuenta de entrenador, también se eliminan disponibilidades, tarifas, reservas y espacios de mensajería gestionados por la cuenta.',
    password: 'Contraseña actual',
    passwordPlaceholder: 'Confirma tu identidad',
    confirmation: 'Escribe ELIMINAR',
    confirmationPlaceholder: 'ELIMINAR',
    action: 'Eliminar definitivamente mi cuenta',
    loading: 'Eliminando…',
    authErrorTitle: 'Autenticación rechazada',
    authErrorBody: 'La contraseña es incorrecta. La cuenta no se ha eliminado.',
    errorTitle: 'No se pudo eliminar',
    errorBody: 'No se pudo completar la eliminación. Inténtalo de nuevo o contacta con soporte.',
    successTitle: 'Cuenta eliminada',
    successBody: 'Tu cuenta y sus datos activos se han eliminado.',
    home: 'Volver al inicio',
  },
};

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { role, status, user } = useAuth();
  const { locale } = useTranslation();
  const theme = useTheme();
  const labels = copy[locale];
  const confirmationWord = locale === 'fr' ? 'SUPPRIMER' : locale === 'es' ? 'ELIMINAR' : 'DELETE';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [result, setResult] = useState<'idle' | 'loading' | 'auth-error' | 'error' | 'success'>('idle');

  const submit = async () => {
    if (!user?.email || confirmation !== confirmationWord || !password) return;
    setResult('loading');
    const deletion = await deleteAccount({ email: user.email, password });
    if (!deletion.ok) {
      setResult(deletion.code === 'authentication_failed' ? 'auth-error' : 'error');
      return;
    }
    setPassword('');
    setConfirmation('');
    setResult('success');
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: `${labels.title} · ${productName}` }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <SafeAreaView style={styles.content}>
          <View style={styles.heading}>
            <ThemedText themeColor="primary" type="smallBold">{productName}</ThemedText>
            <ThemedText type="title">{labels.title}</ThemedText>
            <ThemedText themeColor="textMuted">{labels.subtitle}</ThemedText>
          </View>

          {result === 'success' ? (
            <Card style={styles.card}>
              <Feedback message={labels.successBody} title={labels.successTitle} tone="success" />
              <Button label={labels.home} onPress={() => router.replace('/')} />
            </Card>
          ) : status === 'loading' && !user ? (
            <ActivityIndicator color={theme.primary} size="large" />
          ) : !user ? (
            <Card style={styles.card}>
              <ThemedText type="subtitle">{labels.signedOutTitle}</ThemedText>
              <ThemedText themeColor="textMuted">{labels.signedOutBody}</ThemedText>
              <Button
                label={labels.signIn}
                onPress={() =>
                  router.navigate('/sign-in?redirect=%2Fdelete-account' as Href)
                }
              />
              <Button
                label={locale === 'fr' ? 'Voir la procédure alternative' : locale === 'es' ? 'Ver el procedimiento alternativo' : 'View the alternative procedure'}
                onPress={() => router.navigate('/data-rights' as Href)}
                variant="secondary"
              />
            </Card>
          ) : (
            <Card style={styles.card}>
              <Feedback message={labels.warningBody} title={labels.warningTitle} tone="warning" />
              {role === 'coach' ? (
                <ThemedText themeColor="error" type="smallBold">{labels.coachWarning}</ThemedText>
              ) : null}
              <TextField
                autoCapitalize="none"
                autoComplete="current-password"
                label={labels.password}
                onChangeText={setPassword}
                placeholder={labels.passwordPlaceholder}
                secureTextEntry
                textContentType="password"
                value={password}
              />
              <TextField
                autoCapitalize="characters"
                label={labels.confirmation}
                onChangeText={setConfirmation}
                placeholder={labels.confirmationPlaceholder}
                value={confirmation}
              />
              {result === 'auth-error' ? (
                <Feedback message={labels.authErrorBody} title={labels.authErrorTitle} tone="error" />
              ) : null}
              {result === 'error' ? (
                <Feedback message={labels.errorBody} title={labels.errorTitle} tone="error" />
              ) : null}
              <Button
                disabled={result === 'loading' || !password || confirmation !== confirmationWord}
                label={result === 'loading' ? labels.loading : labels.action}
                onPress={() => void submit()}
              />
            </Card>
          )}

          <LegalFooter />
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: { gap: Spacing.four, maxWidth: MaxContentWidth, width: '100%' },
  heading: { gap: Spacing.two, maxWidth: 760 },
  card: { alignSelf: 'center', gap: Spacing.three, maxWidth: 640, width: '100%' },
});
