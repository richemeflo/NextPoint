import { zodResolver } from '@hookform/resolvers/zod';
import {
  manualStudentProfileSchema,
  toManualStudentProfileInput,
  type ManualStudentProfileFormInput,
  type StudentSex,
} from '@nextpoint/shared';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  createManualStudent,
  type AssociatedStudent,
} from '@/features/students/student-coach-service';
import { useTranslation, type TranslationKey } from '@/i18n';

type ManualStudentFormProps = {
  onCancel: () => void;
  onCreated: (student: AssociatedStudent) => void;
};

const defaultValues: ManualStudentProfileFormInput = {
  fullName: '',
  phone: '',
  email: '',
  padelLevel: '1',
  age: '',
  sex: 'not_specified',
};

export function ManualStudentForm({
  onCancel,
  onCreated,
}: ManualStudentFormProps) {
  const { t } = useTranslation();
  const [saveState, setSaveState] = useState<
    'idle' | 'duplicate' | 'error'
  >('idle');
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ManualStudentProfileFormInput>({
    resolver: zodResolver(manualStudentProfileSchema),
    defaultValues,
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
  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;
  const sexOptions: { value: StudentSex; label: string }[] = [
    { value: 'female', label: t('profile.sex.female') },
    { value: 'male', label: t('profile.sex.male') },
    { value: 'other', label: t('profile.sex.other') },
    {
      value: 'not_specified',
      label: t('profile.sex.notSpecified'),
    },
  ];

  const onSubmit = handleSubmit(async (form) => {
    setSaveState('idle');
    const result = await createManualStudent(toManualStudentProfileInput(form));

    if (!result.ok) {
      setSaveState(result.code === 'duplicate_student' ? 'duplicate' : 'error');
      return;
    }

    onCreated(result.data);
  });

  return (
    <View style={styles.form}>
      <ThemedText type="subtitle">{t('students.createTitle')}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('students.createBody')}
      </ThemedText>
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
          name="padelLevel"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View style={[styles.column, styles.selectorWithError]}>
              <ProfileOptionSelector
                label={t('profile.levelLabel')}
                onChange={onChange}
                options={Array.from({ length: 10 }, (_, index) => ({
                  value: String(index + 1),
                  label: String(index + 1),
                }))}
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
      </View>
      <Controller
        control={control}
        name="sex"
        render={({ field: { onChange, value } }) => (
          <ProfileOptionSelector
            label={t('profile.sexLabel')}
            onChange={onChange}
            options={sexOptions}
            value={value}
          />
        )}
      />
      {saveState === 'error' ? (
        <Feedback
          message={t('students.createErrorBody')}
          title={t('students.createErrorTitle')}
          tone="error"
        />
      ) : null}
      {saveState === 'duplicate' ? (
        <Feedback
          message={t('students.createDuplicateBody')}
          title={t('students.createDuplicateTitle')}
          tone="error"
        />
      ) : null}
      <View style={styles.actions}>
        <Button
          disabled={isSubmitting}
          label={
            isSubmitting
              ? t('students.creating')
              : t('students.createSubmitAction')
          }
          onPress={() => void onSubmit()}
        />
        <Button
          disabled={isSubmitting}
          label={t('students.createCancelAction')}
          onPress={onCancel}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
