import { zodResolver } from '@hookform/resolvers/zod';
import {
  activateStudentAccountSchema,
  type ActivateStudentAccountInput,
} from '@nextpoint/shared';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { LegalAcceptance } from '@/features/legal/legal-acceptance';
import { LegalFooter } from '@/features/legal/legal-footer';
import { activateStudentAccount } from '@/features/students/student-account-service';
import {
  getSanitizedStudentActivationPath,
  getStudentActivationAllowedHttpsOrigins,
  parseStudentActivationUrl,
} from '@/features/students/student-activation-link';
import { useTranslation, type TranslationKey } from '@/i18n';

function sanitizeWebActivationUrl(url: string) {
  if (Platform.OS !== 'web' || typeof globalThis.history === 'undefined') {
    return;
  }

  const sanitizedPath = getSanitizedStudentActivationPath(url);
  if (!sanitizedPath) return;

  try {
    globalThis.history.replaceState(globalThis.history.state, '', sanitizedPath);
  } catch {
    // URL cleanup must never prevent account activation.
  }
}

export default function ActivateStudentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut, status } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm<ActivateStudentAccountInput>({
    resolver: zodResolver(activateStudentAccountSchema),
    defaultValues: {
      token: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [result, setResult] = useState<
    'idle' | 'success' | 'invalid' | 'error'
  >('idle');
  const [isRedirectingToSignIn, setIsRedirectingToSignIn] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [showLegalError, setShowLegalError] = useState(false);

  useEffect(() => {
    let active = true;

    const openActivationLink = (url: string | null) => {
      if (!url || !active) {
        if (active) setResult('invalid');
        return;
      }

      const token = parseStudentActivationUrl(url, {
        allowedHttpsOrigins: getStudentActivationAllowedHttpsOrigins(
          process.env.EXPO_PUBLIC_APP_URL,
          Platform.OS === 'web' && typeof globalThis.location !== 'undefined'
            ? globalThis.location.origin
            : undefined
        ),
        allowDevelopmentUrls: __DEV__,
      });
      sanitizeWebActivationUrl(url);

      if (!token) {
        setResult('invalid');
        return;
      }

      setValue('token', token, { shouldValidate: true });
      setResult('idle');
    };

    void Linking.getInitialURL().then(openActivationLink);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      openActivationLink(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [setValue]);

  const validationKeys: Record<string, TranslationKey> = {
    required: 'auth.validation.required',
    password_too_short: 'auth.validation.passwordTooShort',
    password_too_weak: 'auth.validation.passwordTooWeak',
    password_mismatch: 'auth.validation.passwordMismatch',
  };
  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;

  const onSubmit = handleSubmit(async ({ token, password }) => {
    if (!acceptedLegal) {
      setShowLegalError(true);
      return;
    }

    setResult('idle');
    const activation = await activateStudentAccount({ token, password });
    if (!activation.ok) {
      setResult(
        activation.code === 'invalid_activation' ? 'invalid' : 'error'
      );
      return;
    }
    setResult('success');
  });

  const goToSignIn = async () => {
    setIsRedirectingToSignIn(true);
    if (status !== 'unauthenticated' && status !== 'configuration-error') {
      await signOut('local');
    }
    router.replace('/(auth)/sign-in');
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('common.nextpoint')}
            </ThemedText>
            <ThemedText type="title">{t('activation.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('activation.subtitle')}
            </ThemedText>
          </View>
          <Card elevated style={styles.form}>
            {result === 'success' ? (
              <>
                <Feedback
                  message={t('activation.successBody')}
                  title={t('activation.successTitle')}
                  tone="success"
                />
                <Button
                  disabled={isRedirectingToSignIn}
                  label={t('activation.signInAction')}
                  onPress={() => void goToSignIn()}
                />
              </>
            ) : (
              <>
                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { onBlur, onChange, value },
                    fieldState: { error },
                  }) => (
                    <TextField
                      autoCapitalize="none"
                      autoComplete="new-password"
                      error={translateError(error?.message)}
                      label={t('activation.passwordLabel')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder={t('auth.passwordCreatePlaceholder')}
                      secureTextEntry
                      textContentType="newPassword"
                      value={value}
                    />
                  )}
                />
                <LegalAcceptance
                  accepted={acceptedLegal}
                  onChange={(accepted) => {
                    setAcceptedLegal(accepted);
                    if (accepted) setShowLegalError(false);
                  }}
                  showError={showLegalError}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({
                    field: { onBlur, onChange, value },
                    fieldState: { error },
                  }) => (
                    <TextField
                      autoCapitalize="none"
                      autoComplete="new-password"
                      error={translateError(error?.message)}
                      label={t('activation.confirmPasswordLabel')}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      onSubmitEditing={() => void onSubmit()}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      secureTextEntry
                      textContentType="newPassword"
                      value={value}
                    />
                  )}
                />
                {result === 'invalid' ? (
                  <Feedback
                    message={t('activation.invalidBody')}
                    title={t('activation.invalidTitle')}
                    tone="error"
                  />
                ) : null}
                {result === 'error' ? (
                  <Feedback
                    message={t('activation.errorBody')}
                    title={t('activation.errorTitle')}
                    tone="error"
                  />
                ) : null}
                <Button
                  disabled={isSubmitting}
                  label={
                    isSubmitting
                      ? t('activation.activating')
                      : t('activation.submitAction')
                  }
                  onPress={() => void onSubmit()}
                />
              </>
            )}
          </Card>
          <LegalFooter />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    maxWidth: 640,
    gap: Spacing.two,
  },
  form: {
    width: '100%',
    maxWidth: 520,
    gap: Spacing.four,
  },
});
