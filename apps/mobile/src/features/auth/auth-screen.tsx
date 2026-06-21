import { zodResolver } from '@hookform/resolvers/zod';
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from '@nextpoint/shared';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthFailureCode } from './auth-error';
import { useAuth } from './auth-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type AuthMode = 'sign-in' | 'sign-up';

const authErrorKeys: Record<AuthFailureCode, TranslationKey> = {
  configuration_error: 'auth.error.configuration',
  invalid_credentials: 'auth.error.invalidCredentials',
  email_in_use: 'auth.error.emailInUse',
  weak_password: 'auth.error.weakPassword',
  email_not_confirmed: 'auth.error.emailNotConfirmed',
  rate_limited: 'auth.error.rateLimited',
  network_error: 'auth.error.network',
  unknown: 'auth.error.generic',
};

const validationKeys: Record<string, TranslationKey> = {
  required: 'auth.validation.required',
  invalid_email: 'auth.validation.invalidEmail',
  password_too_short: 'auth.validation.passwordTooShort',
  password_mismatch: 'auth.validation.passwordMismatch',
};

function translateValidationError(
  message: string | undefined,
  t: (key: TranslationKey) => string
) {
  return message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;
}

function AuthFeedback({ code }: { code: AuthFailureCode | null }) {
  const { t } = useTranslation();

  if (!code) return null;

  return (
    <Feedback
      title={t('auth.error.title')}
      message={t(authErrorKeys[code])}
      tone="error"
    />
  );
}

function SignInForm() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<AuthFailureCode | null>(
    status === 'configuration-error' ? 'configuration_error' : null
  );
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setAuthError(null);
    const result = await signIn(email, password);

    if (!result.ok) setAuthError(result.code);
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            error={translateValidationError(error?.message, t)}
            inputMode="email"
            keyboardType="email-address"
            label={t('auth.emailLabel')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.emailPlaceholder')}
            textContentType="emailAddress"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="current-password"
            error={translateValidationError(error?.message, t)}
            label={t('auth.passwordLabel')}
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => void onSubmit()}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry
            textContentType="password"
            value={value}
          />
        )}
      />
      <AuthFeedback code={authError} />
      <Button
        disabled={isSubmitting || status === 'configuration-error'}
        label={isSubmitting ? t('auth.signingIn') : t('auth.signInAction')}
        onPress={() => void onSubmit()}
      />
      <Button
        label={t('auth.goToSignUp')}
        onPress={() => router.navigate('/sign-up')}
        variant="secondary"
      />
    </View>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { signUp, status } = useAuth();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<AuthFailureCode | null>(
    status === 'configuration-error' ? 'configuration_error' : null
  );
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setAuthError(null);
    setConfirmationRequired(false);
    const result = await signUp(email, password);

    if (!result.ok) {
      setAuthError(result.code);
      return;
    }

    if (!result.session) setConfirmationRequired(true);
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            error={translateValidationError(error?.message, t)}
            inputMode="email"
            keyboardType="email-address"
            label={t('auth.emailLabel')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.emailPlaceholder')}
            textContentType="emailAddress"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="new-password"
            error={translateValidationError(error?.message, t)}
            label={t('auth.passwordLabel')}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder={t('auth.passwordCreatePlaceholder')}
            secureTextEntry
            textContentType="newPassword"
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="new-password"
            error={translateValidationError(error?.message, t)}
            label={t('auth.confirmPasswordLabel')}
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
      <AuthFeedback code={authError} />
      {confirmationRequired ? (
        <Feedback
          title={t('auth.confirmationTitle')}
          message={t('auth.confirmationMessage')}
          tone="success"
        />
      ) : null}
      <Button
        disabled={isSubmitting || status === 'configuration-error'}
        label={isSubmitting ? t('auth.signingUp') : t('auth.signUpAction')}
        onPress={() => void onSubmit()}
      />
      <Button
        label={t('auth.goToSignIn')}
        onPress={() => router.navigate('/sign-in')}
        variant="secondary"
      />
    </View>
  );
}

export function AuthScreen({ mode }: { mode: AuthMode }) {
  const { t } = useTranslation();
  const isSignIn = mode === 'sign-in';

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.intro}>
              <AnimatedIcon />
              <View style={styles.introCopy}>
                <ThemedText type="smallBold" themeColor="primary">
                  {t('common.nextpoint')}
                </ThemedText>
                <ThemedText type="title">
                  {t(isSignIn ? 'auth.signInTitle' : 'auth.signUpTitle')}
                </ThemedText>
                <ThemedText type="default" themeColor="textMuted">
                  {t(isSignIn ? 'auth.signInSubtitle' : 'auth.signUpSubtitle')}
                </ThemedText>
              </View>
            </View>
            <Card elevated style={styles.card}>
              {isSignIn ? <SignInForm /> : <SignUpForm />}
            </Card>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  intro: {
    alignItems: Platform.select({ web: 'center', default: 'flex-start' }),
    gap: Spacing.three,
  },
  introCopy: {
    maxWidth: 560,
    alignItems: Platform.select({ web: 'center', default: 'flex-start' }),
    gap: Spacing.two,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  form: {
    gap: Spacing.three,
  },
});
