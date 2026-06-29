import { zodResolver } from '@hookform/resolvers/zod';
import {
  coachProfileSchema,
  toCoachProfileInput,
  type AppLanguage,
  type CoachProfileFormInput,
} from '@nextpoint/shared';
import { useRouter, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
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
import {
  getCoachProfile,
  saveCoachProfile,
} from '@/features/coaches/coach-profile-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export default function CoachProfileScreen() {
  const router = useRouter();
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
  } = useForm<CoachProfileFormInput>({
    resolver: zodResolver(coachProfileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      phone: '',
      email: user?.email ?? '',
      preferredLanguage: locale,
    },
  });

  const validationKeys: Record<string, TranslationKey> = {
    name_too_short: 'profile.validation.nameTooShort',
    name_too_long: 'profile.validation.nameTooLong',
    bio_too_short: 'coachProfile.validation.bioTooShort',
    bio_too_long: 'coachProfile.validation.bioTooLong',
    invalid_phone: 'profile.validation.invalidPhone',
    invalid_email: 'auth.validation.invalidEmail',
  };
  const languageOptions: { value: AppLanguage; label: string }[] = [
    { value: 'fr', label: t('profile.language.fr') },
    { value: 'en', label: t('profile.language.en') },
    { value: 'es', label: t('profile.language.es') },
  ];

  useEffect(() => {
    if (!user) return;

    let active = true;

    void getCoachProfile(user.id).then((result) => {
      if (!active) return;

      if (!result.ok) {
        setLoadError(true);
        setIsLoading(false);
        return;
      }

      if (result.data) {
        setLocale(result.data.preferredLanguage);
        reset({
          displayName: result.data.displayName,
          bio: result.data.bio,
          phone: result.data.phone,
          email: result.data.email,
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
    const result = await saveCoachProfile(user.id, toCoachProfileInput(form));

    if (!result.ok || !result.data) {
      setSaveState('error');
      return;
    }

    reset({
      displayName: result.data.displayName,
      bio: result.data.bio,
      phone: result.data.phone,
      email: result.data.email,
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
          {t('coachProfile.loading')}
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
              {t('role.coachLabel')}
            </ThemedText>
            <ThemedText type="title">{t('coachProfile.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('coachProfile.subtitle')}
            </ThemedText>
          </View>

          <Card elevated style={styles.form}>
            {loadError ? (
              <Feedback
                message={t('coachProfile.loadErrorBody')}
                title={t('coachProfile.loadErrorTitle')}
                tone="error"
              />
            ) : null}

            <Controller
              control={control}
              name="displayName"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <TextField
                  autoComplete="name"
                  error={translateError(error?.message)}
                  label={t('coachProfile.displayNameLabel')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('coachProfile.displayNamePlaceholder')}
                  textContentType="name"
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="bio"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <TextField
                  error={translateError(error?.message)}
                  label={t('coachProfile.bioLabel')}
                  multiline
                  numberOfLines={5}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('coachProfile.bioPlaceholder')}
                  style={styles.bioInput}
                  textAlignVertical="top"
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
            <Controller
              control={control}
              name="preferredLanguage"
              render={({ field: { onChange, value } }) => (
                <ProfileOptionSelector
                  label={t('profile.languageLabel')}
                  onChange={onChange}
                  options={languageOptions}
                  value={value}
                />
              )}
            />

            {saveState === 'success' ? (
              <Feedback
                message={t('coachProfile.saveSuccessBody')}
                title={t('coachProfile.saveSuccessTitle')}
                tone="success"
              />
            ) : null}
            {saveState === 'error' ? (
              <Feedback
                message={t('coachProfile.saveErrorBody')}
                title={t('coachProfile.saveErrorTitle')}
                tone="error"
              />
            ) : null}
            <Button
              disabled={isSubmitting || loadError}
              label={isSubmitting ? t('profile.saving') : t('coachProfile.saveAction')}
              onPress={() => void onSubmit()}
            />
          </Card>

          <View style={styles.settingsGrid}>
            <Card style={styles.settingCard}>
              <ThemedText type="subtitle">
                {t('coachProfile.availabilityTitle')}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('coachProfile.availabilityBody')}
              </ThemedText>
              <Button
                label={t('coachProfile.openAvailability')}
                onPress={() => router.navigate('/coach/availability')}
                variant="secondary"
              />
            </Card>
            <Card style={styles.settingCard}>
              <ThemedText type="subtitle">{t('coachProfile.pricingTitle')}</ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('coachProfile.pricingBody')}
              </ThemedText>
              <Button
                label={t('coachProfile.openPricing')}
                onPress={() => router.navigate('/coach/pricing' as Href)}
                variant="secondary"
              />
            </Card>
            <Card style={styles.settingCard}>
              <ThemedText type="subtitle">
                {t('coachProfile.notificationsTitle')}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t('coachProfile.notificationsBody')}
              </ThemedText>
              <Button
                disabled
                label={t('coachProfile.comingSoon')}
                variant="secondary"
              />
            </Card>
          </View>
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
  bioInput: {
    minHeight: 132,
    paddingTop: Spacing.three,
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
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  settingCard: {
    minWidth: 240,
    flex: 1,
    gap: Spacing.three,
  },
});
