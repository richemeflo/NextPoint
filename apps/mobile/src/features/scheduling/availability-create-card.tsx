import { zodResolver } from '@hookform/resolvers/zod';
import {
  availabilityLocations,
  availabilityRangeSchema,
  availabilityRecurrenceTypes,
  defaultAvailabilityLocation,
  getDefaultAvailabilityRecurrenceEndsOn,
  getSchedulingToday,
  type AvailabilityRangeFormInput,
  type AvailabilityRecurrenceType,
} from '@nextpoint/shared';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AvailabilityFeedback } from '@/features/scheduling/availability-feedback';
import type { AvailabilityFeedback as AvailabilityFeedbackValue } from '@/features/scheduling/use-availability-management';
import { useTranslation, type TranslationKey } from '@/i18n';

const defaultValues: AvailabilityRangeFormInput = {
  date: getSchedulingToday(),
  startsAtLocalTime: '18:00',
  endsAtLocalTime: '19:30',
  slotDurationMinutes: '60',
  location: defaultAvailabilityLocation,
  recurrenceType: 'none',
  recurrenceEndsOn: '',
};

const validationKeys: Record<string, TranslationKey> = {
  invalid_date: 'availability.validation.invalidDate',
  invalid_time: 'availability.validation.invalidTime',
  end_before_start: 'availability.validation.endBeforeStart',
  range_too_short: 'availability.validation.rangeTooShort',
  recurrence_end_required: 'availability.validation.recurrenceEndRequired',
  recurrence_end_before_start: 'availability.validation.recurrenceEndBeforeStart',
};

export function AvailabilityCreateCard({
  feedback,
  loadError,
  mutationPending,
  onCreate,
}: {
  feedback: AvailabilityFeedbackValue;
  loadError: boolean;
  mutationPending: boolean;
  onCreate: (form: AvailabilityRangeFormInput) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<AvailabilityRangeFormInput>({
    resolver: zodResolver(availabilityRangeSchema),
    defaultValues,
  });
  const watchedValues = useWatch({ control });
  const selectedRecurrenceType = watchedValues.recurrenceType ?? 'none';

  useEffect(() => {
    const date = watchedValues.date ?? defaultValues.date;

    if (selectedRecurrenceType === 'none') {
      if (watchedValues.recurrenceEndsOn) {
        setValue('recurrenceEndsOn', '', { shouldValidate: true });
      }
      return;
    }

    if (!watchedValues.recurrenceEndsOn) {
      setValue(
        'recurrenceEndsOn',
        getDefaultAvailabilityRecurrenceEndsOn(date),
        { shouldValidate: true }
      );
    }
  }, [
    selectedRecurrenceType,
    setValue,
    watchedValues.date,
    watchedValues.recurrenceEndsOn,
  ]);

  const translateError = (message: string | undefined) =>
    message
      ? t(validationKeys[message] ?? 'auth.validation.invalid')
      : undefined;

  const submit = async (form: AvailabilityRangeFormInput) => {
    const saved = await onCreate(form);
    if (saved) reset({ ...defaultValues, date: form.date });
  };

  const recurrenceOptions = availabilityRecurrenceTypes.map((recurrence) => ({
    value: recurrence,
    label: t(`availability.recurrence.${recurrence}` as TranslationKey),
  }));

  return (
    <Card elevated style={styles.form}>
      <ThemedText type="subtitle">{t('availability.createTitle')}</ThemedText>
      <View style={styles.formGrid}>
        <Controller
          control={control}
          name="date"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              error={translateError(error?.message)}
              label={t('availability.dateLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('availability.datePlaceholder')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="startsAtLocalTime"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              error={translateError(error?.message)}
              label={t('availability.startsAtLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('availability.timePlaceholder')}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="endsAtLocalTime"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              error={translateError(error?.message)}
              label={t('availability.endsAtLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('availability.timePlaceholder')}
              value={value}
            />
          )}
        />
      </View>
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, value } }) => (
          <ProfileOptionSelector
            label={t('availability.locationLabel')}
            onChange={onChange}
            options={availabilityLocations.map((location) => ({
              value: location,
              label: location,
            }))}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="recurrenceType"
        render={({ field: { onChange, value } }) => (
          <ProfileOptionSelector<AvailabilityRecurrenceType>
            label={t('availability.recurrenceLabel')}
            onChange={onChange}
            options={recurrenceOptions}
            singleLine
            value={value}
          />
        )}
      />
      {selectedRecurrenceType !== 'none' ? (
        <Controller
          control={control}
          name="recurrenceEndsOn"
          render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
            <TextField
              error={translateError(error?.message)}
              label={t('availability.recurrenceEndsOnLabel')}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={t('availability.datePlaceholder')}
              value={value ?? ''}
            />
          )}
        />
      ) : null}

      <AvailabilityFeedback value={feedback} />

      <View style={styles.actions}>
        <Button
          disabled={isSubmitting || mutationPending || loadError}
          label={
            isSubmitting
              ? t('availability.saving')
              : t('availability.createAction')
          }
          onPress={() => void handleSubmit(submit)()}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
