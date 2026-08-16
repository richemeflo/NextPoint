import { zodResolver } from '@hookform/resolvers/zod';
import {
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
  type AppRole,
  type PasswordResetRequestInput,
  type PasswordUpdateInput,
  type SignInInput,
  type SignUpInput,
} from '@nextpoint/shared';
import * as Linking from 'expo-linking';
import { useRouter, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthFailureCode } from './auth-error';
import { useAuth } from './auth-context';
import { getSanitizedPasswordRecoveryPath } from './password-recovery';
import {
  establishPasswordRecoverySession,
  isCoachRegistrationOpen,
  requestPasswordReset,
  updatePassword,
} from './auth-service';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type AuthMode =
  | 'sign-in'
  | 'sign-up'
  | 'forgot-password'
  | 'reset-password';

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

function sanitizeWebPasswordRecoveryUrl(url: string) {
  if (Platform.OS !== 'web' || typeof globalThis.history === 'undefined') {
    return;
  }

  const sanitizedPath = getSanitizedPasswordRecoveryPath(url);
  if (!sanitizedPath) return;

  try {
    globalThis.history.replaceState(
      globalThis.history.state,
      '',
      sanitizedPath
    );
  } catch {
    // URL cleanup must never prevent recovery session establishment.
  }
}

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

function RoleSelector({
  value,
  onChange,
}: {
  value: AppRole;
  onChange: (role: AppRole) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const options: { role: AppRole; label: string }[] = [
    { role: 'eleve', label: t('auth.roleEleve') },
    { role: 'coach', label: t('auth.roleCoach') },
  ];

  return (
    <View style={styles.roleField}>
      <ThemedText type="smallBold">{t('auth.roleLabel')}</ThemedText>
      <View
        accessibilityRole="radiogroup"
        style={[styles.roleSelector, { borderColor: theme.border }]}>
        {options.map((option) => {
          const selected = value === option.role;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.role}
              onPress={() => onChange(option.role)}
              style={[
                styles.roleOption,
                { backgroundColor: selected ? theme.backgroundSelected : theme.surface },
              ]}>
              <ThemedText
                type="smallBold"
                themeColor={selected ? 'primary' : 'textMuted'}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
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
      <Pressable
        accessibilityRole="link"
        onPress={() => router.navigate('/forgot-password' as Href)}
        style={styles.forgotPasswordLink}>
        <ThemedText type="linkPrimary">
          {t('auth.forgotPasswordAction')}
        </ThemedText>
      </Pressable>
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

function ForgotPasswordForm() {
  const router = useRouter();
  const { status } = useAuth();
  const { t } = useTranslation();
  const [authError, setAuthError] = useState<AuthFailureCode | null>(
    status === 'configuration-error' ? 'configuration_error' : null
  );
  const [emailSent, setEmailSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setAuthError(null);
    setEmailSent(false);

    const result = await requestPasswordReset(
      email,
      Linking.createURL('/reset-password')
    );

    if (!result.ok) {
      setAuthError(result.code);
      return;
    }

    setEmailSent(true);
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
            onSubmitEditing={() => void onSubmit()}
            placeholder={t('auth.emailPlaceholder')}
            textContentType="emailAddress"
            value={value}
          />
        )}
      />
      <AuthFeedback code={authError} />
      {emailSent ? (
        <Feedback
          message={t('auth.passwordResetEmailSentBody')}
          title={t('auth.passwordResetEmailSentTitle')}
          tone="success"
        />
      ) : null}
      <Button
        disabled={isSubmitting || status === 'configuration-error'}
        label={
          isSubmitting
            ? t('auth.passwordResetSending')
            : t('auth.passwordResetSendAction')
        }
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

function ResetPasswordForm() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [recoveryStatus, setRecoveryStatus] = useState<
    'loading' | 'ready' | 'invalid' | 'complete'
  >('loading');
  const [authError, setAuthError] = useState<AuthFailureCode | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    let active = true;

    const openRecoveryLink = async (url: string | null) => {
      if (!url) {
        if (active) setRecoveryStatus('invalid');
        return;
      }

      sanitizeWebPasswordRecoveryUrl(url);
      const result = await establishPasswordRecoverySession(url);
      if (!active) return;

      if (!result.ok && result.code === 'configuration_error') {
        setAuthError(result.code);
      }
      setRecoveryStatus(result.ok ? 'ready' : 'invalid');
    };

    void Linking.getInitialURL().then(openRecoveryLink);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      setRecoveryStatus('loading');
      void openRecoveryLink(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const onSubmit = handleSubmit(async ({ password }) => {
    setAuthError(null);
    const result = await updatePassword(password);

    if (!result.ok) {
      setAuthError(result.code);
      return;
    }

    const signOutResult = await signOut('local');
    if (!signOutResult.ok) {
      setAuthError(signOutResult.code);
      return;
    }

    setRecoveryStatus('complete');
  });

  if (recoveryStatus === 'loading') {
    return (
      <Feedback
        message={t('auth.passwordResetLinkLoadingBody')}
        title={t('auth.passwordResetLinkLoadingTitle')}
        tone="info"
      />
    );
  }

  if (recoveryStatus === 'invalid') {
    return (
      <View style={styles.form}>
        <AuthFeedback code={authError} />
        <Feedback
          message={t('auth.passwordResetInvalidBody')}
          title={t('auth.passwordResetInvalidTitle')}
          tone="error"
        />
        <Button
          label={t('auth.passwordResetRequestAnotherAction')}
          onPress={() => router.replace('/forgot-password' as Href)}
        />
      </View>
    );
  }

  if (recoveryStatus === 'complete') {
    return (
      <View style={styles.form}>
        <Feedback
          message={t('auth.passwordResetCompleteBody')}
          title={t('auth.passwordResetCompleteTitle')}
          tone="success"
        />
        <Button
          label={t('auth.signInAction')}
          onPress={() => router.replace('/sign-in')}
        />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
          <TextField
            autoCapitalize="none"
            autoComplete="new-password"
            error={translateValidationError(error?.message, t)}
            label={t('auth.newPasswordLabel')}
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
            label={t('auth.confirmNewPasswordLabel')}
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
      <Button
        disabled={isSubmitting}
        label={
          isSubmitting
            ? t('auth.passwordResetUpdating')
            : t('auth.passwordResetUpdateAction')
        }
        onPress={() => void onSubmit()}
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
  const [coachRegistrationOpen, setCoachRegistrationOpen] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', role: 'eleve' },
  });

  useEffect(() => {
    let active = true;

    void isCoachRegistrationOpen()
      .then((isOpen) => {
        if (active) setCoachRegistrationOpen(isOpen);
      })
      .catch(() => {
        if (active) setCoachRegistrationOpen(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const onSubmit = handleSubmit(async ({ email, password, role }) => {
    setAuthError(null);
    setConfirmationRequired(false);
    const result = await signUp(email, password, role);

    if (!result.ok) {
      setAuthError(result.code);
      return;
    }

    if (!result.session) setConfirmationRequired(true);
  });

  return (
    <View style={styles.form}>
      {coachRegistrationOpen ? (
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <RoleSelector onChange={onChange} value={value} />
          )}
        />
      ) : null}
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
  const copy: Record<
    AuthMode,
    { title: TranslationKey; subtitle: TranslationKey }
  > = {
    'sign-in': {
      title: 'auth.signInTitle',
      subtitle: 'auth.signInSubtitle',
    },
    'sign-up': {
      title: 'auth.signUpTitle',
      subtitle: 'auth.signUpSubtitle',
    },
    'forgot-password': {
      title: 'auth.forgotPasswordTitle',
      subtitle: 'auth.forgotPasswordSubtitle',
    },
    'reset-password': {
      title: 'auth.resetPasswordTitle',
      subtitle: 'auth.resetPasswordSubtitle',
    },
  };

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
                  {t(copy[mode].title)}
                </ThemedText>
                <ThemedText type="default" themeColor="textMuted">
                  {t(copy[mode].subtitle)}
                </ThemedText>
              </View>
            </View>
            <Card elevated style={styles.card}>
              {mode === 'sign-in' ? <SignInForm /> : null}
              {mode === 'sign-up' ? <SignUpForm /> : null}
              {mode === 'forgot-password' ? <ForgotPasswordForm /> : null}
              {mode === 'reset-password' ? <ResetPasswordForm /> : null}
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
  roleField: {
    gap: Spacing.two,
  },
  roleSelector: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    flexDirection: 'row',
    padding: Spacing.one,
  },
  roleOption: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.small,
  },
});
