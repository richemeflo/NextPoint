import { zodResolver } from '@hookform/resolvers/zod';
import {
  studentProfileSchema,
  toStudentProfileInput,
  type AppLanguage,
  type StudentProfileFormInput,
} from '@nextpoint/shared';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  getStudentProfile,
  saveStudentProfile,
} from '@/features/students/student-profile-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export default function EleveAccountScreen() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useTranslation();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<StudentProfileFormInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: user?.email ?? '',
      padelLevel: '1',
      age: '',
      preferredLanguage: locale,
    },
  });

  const validationKeys: Record<string, TranslationKey> = {
    name_too_short: 'profile.validation.nameTooShort',
    name_too_long: 'profile.validation.nameTooLong',
    invalid_phone: 'profile.validation.invalidPhone',
    invalid_email: 'auth.validation.invalidEmail',
    invalid_number: 'profile.validation.invalidNumber',
    invalid_padel_level: 'profile.validation.invalidLevel',
    invalid_age: 'profile.validation.invalidAge',
  };

  const levelOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        value: String(index + 1),
        label: String(index + 1),
      })),
    []
  );
  const languageOptions: { value: AppLanguage; label: string }[] = [
    { value: 'fr', label: t('profile.language.fr') },
    { value: 'en', label: t('profile.language.en') },
    { value: 'es', label: t('profile.language.es') },
  ];

  useEffect(() => {
    if (!user) return;

    let active = true;

    void getStudentProfile(user.id).then((result) => {
      if (!active) return;

      if (!result.ok) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      if (result.data) {
        setLocale(result.data.preferredLanguage);
        reset({
          fullName: result.data.fullName,
          phone: result.data.phone,
          email: result.data.email,
          padelLevel: String(result.data.padelLevel),
          age: String(result.data.age),
          preferredLanguage: result.data.preferredLanguage,
        });
      }

      setLoadError(false);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [reset, setLocale, user]);

  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;

  const onSubmit = handleSubmit(async (form) => {
    if (!user) return;

    setSaveState('idle');
    const result = await saveStudentProfile(user.id, toStudentProfileInput(form));

    if (!result.ok || !result.data) {
      setSaveState('error');
      return;
    }

    reset({
      fullName: result.data.fullName,
      phone: result.data.phone,
      email: result.data.email,
      padelLevel: String(result.data.padelLevel),
      age: String(result.data.age),
      preferredLanguage: result.data.preferredLanguage,
    });
    setLocale(result.data.preferredLanguage);
    setSaveState('success');
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('profile.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.eleveLabel')}
            </ThemedText>
            <ThemedText type="title">{t('profile.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('profile.subtitle')}
            </ThemedText>
          </View>

          <Card elevated style={styles.form}>
            {loadError ? (
              <Feedback
                message={t('profile.loadErrorBody')}
                title={t('profile.loadErrorTitle')}
                tone="error"
              />
            ) : null}

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <TextField
                  autoComplete="name"
                  error={translateError(error?.message)}
                  label={t('profile.fullNameLabel')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('profile.fullNamePlaceholder')}
                  textContentType="name"
                  value={value}
                />
              )}
            />
            <View style={styles.twoColumns}>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                  <TextField
                    autoComplete="tel"
                    containerStyle={styles.column}
                    error={translateError(error?.message)}
                    keyboardType="phone-pad"
                    label={t('profile.phoneLabel')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('profile.phonePlaceholder')}
                    textContentType="telephoneNumber"
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                  <TextField
                    autoCapitalize="none"
                    autoComplete="email"
                    containerStyle={styles.column}
                    error={translateError(error?.message)}
                    inputMode="email"
                    keyboardType="email-address"
                    label={t('profile.emailLabel')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('auth.emailPlaceholder')}
                    textContentType="emailAddress"
                    value={value}
                  />
                )}
              />
            </View>
            <View style={styles.twoColumns}>
              <Controller
                control={control}
                name="age"
                render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                  <TextField
                    containerStyle={styles.column}
                    error={translateError(error?.message)}
                    inputMode="numeric"
                    keyboardType="number-pad"
                    label={t('profile.ageLabel')}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder={t('profile.agePlaceholder')}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="preferredLanguage"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.column}>
                    <ProfileOptionSelector
                      label={t('profile.languageLabel')}
                      onChange={onChange}
                      options={languageOptions}
                      value={value}
                    />
                  </View>
                )}
              />
            </View>
            <Controller
              control={control}
              name="padelLevel"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.selectorWithError}>
                  <ProfileOptionSelector
                    label={t('profile.levelLabel')}
                    onChange={onChange}
                    options={levelOptions}
                    value={value}
                  />
                  {error ? (
                    <ThemedText type="small" themeColor="error">
                      {translateError(error.message)}
                    </ThemedText>
                  ) : null}
                </View>
              )}
            />

            {saveState === 'success' ? (
              <Feedback
                message={t('profile.saveSuccessBody')}
                title={t('profile.saveSuccessTitle')}
                tone="success"
              />
            ) : null}
            {saveState === 'error' ? (
              <Feedback
                message={t('profile.saveErrorBody')}
                title={t('profile.saveErrorTitle')}
                tone="error"
              />
            ) : null}
            <Button
              disabled={isSubmitting || loadError}
              label={isSubmitting ? t('profile.saving') : t('profile.saveAction')}
              onPress={() => void onSubmit()}
            />
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    maxWidth: 720,
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.four,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  column: {
    minWidth: 240,
    flex: 1,
  },
  selectorWithError: {
    gap: Spacing.two,
  },
});
