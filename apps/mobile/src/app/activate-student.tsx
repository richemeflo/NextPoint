import { zodResolver } from '@hookform/resolvers/zod';
import {
  activateStudentAccountSchema,
  type ActivateStudentAccountInput,
} from '@nextpoint/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { activateStudentAccount } from '@/features/students/student-account-service';
import { useTranslation, type TranslationKey } from '@/i18n';

export default function ActivateStudentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ActivateStudentAccountInput>({
    resolver: zodResolver(activateStudentAccountSchema),
    defaultValues: {
      token: typeof params.token === 'string' ? params.token : '',
      password: '',
      confirmPassword: '',
    },
  });
  const [result, setResult] = useState<
    'idle' | 'success' | 'invalid' | 'error'
  >('idle');

  const validationKeys: Record<string, TranslationKey> = {
    required: 'auth.validation.required',
    password_too_short: 'auth.validation.passwordTooShort',
    password_mismatch: 'auth.validation.passwordMismatch',
  };
  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;

  const onSubmit = handleSubmit(async ({ token, password }) => {
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
                  label={t('activation.signInAction')}
                  onPress={() => router.replace('/sign-in')}
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
