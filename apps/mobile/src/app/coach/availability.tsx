import { zodResolver } from '@hookform/resolvers/zod';
import {
  availabilityLocations,
  availabilityRangeSchema,
  availabilityRecurrenceTypes,
  availabilitySlotDurations,
  buildAvailabilityPreviewSlots,
  defaultAvailabilityLocation,
  getDefaultAvailabilityRecurrenceEndsOn,
  toAvailabilityRangeInput,
  type AvailabilityRangeFormInput,
  type AvailabilityRecurrenceType,
} from '@nextpoint/shared';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  createAvailabilityRange,
  getCoachAvailabilitySlots,
  getCoachAvailabilityRanges,
  type AvailabilityRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultValues: AvailabilityRangeFormInput = {
  date: formatLocalDate(new Date()),
  startsAtLocalTime: '18:00',
  endsAtLocalTime: '20:00',
  slotDurationMinutes: '90',
  location: defaultAvailabilityLocation,
  recurrenceType: 'none',
  recurrenceEndsOn: '',
};

export default function CoachAvailabilityScreen() {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [ranges, setRanges] = useState<AvailabilityRange[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [feedback, setFeedback] = useState<
    'none' | 'saved' | 'conflict' | 'forbidden' | 'error'
  >('none');
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

  const loadRanges = useCallback(async () => {
    if (!user) return;

    const [rangesResult, slotsResult] = await Promise.all([
      getCoachAvailabilityRanges(user.id),
      getCoachAvailabilitySlots(user.id),
    ]);
    if (!rangesResult.ok || !slotsResult.ok) {
      setLoadState('error');
      return;
    }

    setRanges(rangesResult.data);
    setSlots(slotsResult.data);
    setLoadState('ready');
  }, [user]);

  useEffect(() => {
    let active = true;

    if (!user) return undefined;

    void Promise.all([
      getCoachAvailabilityRanges(user.id),
      getCoachAvailabilitySlots(user.id),
    ]).then(([rangesResult, slotsResult]) => {
      if (!active) return;
      if (!rangesResult.ok || !slotsResult.ok) {
        setLoadState('error');
        return;
      }

      setRanges(rangesResult.data);
      setSlots(slotsResult.data);
      setLoadState('ready');
    });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    const date = watchedValues.date ?? defaultValues.date;

    if (selectedRecurrenceType === 'none') {
      if (watchedValues.recurrenceEndsOn) {
        setValue('recurrenceEndsOn', '', { shouldValidate: true });
      }
      return;
    }

    if (!watchedValues.recurrenceEndsOn) {
      setValue('recurrenceEndsOn', getDefaultAvailabilityRecurrenceEndsOn(date), {
        shouldValidate: true,
      });
    }
  }, [
    selectedRecurrenceType,
    setValue,
    watchedValues.date,
    watchedValues.recurrenceEndsOn,
  ]);

  const previewSlots = useMemo(() => {
    const parsed = availabilityRangeSchema.safeParse(watchedValues);
    if (!parsed.success) return [];

    return buildAvailabilityPreviewSlots(toAvailabilityRangeInput(parsed.data));
  }, [watchedValues]);

  const validationKeys: Record<string, TranslationKey> = {
    invalid_date: 'availability.validation.invalidDate',
    invalid_time: 'availability.validation.invalidTime',
    end_before_start: 'availability.validation.endBeforeStart',
    range_too_short: 'availability.validation.rangeTooShort',
    recurrence_end_required: 'availability.validation.recurrenceEndRequired',
    recurrence_end_before_start: 'availability.validation.recurrenceEndBeforeStart',
  };
  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));

  const slotsByRangeId = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const current = grouped.get(slot.rangeId) ?? [];
      current.push(slot);
      grouped.set(slot.rangeId, current);
    }

    return grouped;
  }, [slots]);

  const onSubmit = handleSubmit(async (form) => {
    setFeedback('none');
    const result = await createAvailabilityRange(toAvailabilityRangeInput(form));

    if (!result.ok) {
      setFeedback(
        result.code === 'conflict'
          ? 'conflict'
          : result.code === 'forbidden'
            ? 'forbidden'
            : 'error'
      );
      return;
    }

    reset({ ...defaultValues, date: form.date });
    setFeedback('saved');
    await loadRanges();
  });

  const durationOptions = availabilitySlotDurations.map((duration) => ({
    value: String(duration) as '60' | '90',
    label: t(`availability.duration.${duration}` as TranslationKey),
  }));
  const recurrenceOptions = availabilityRecurrenceTypes.map((recurrence) => ({
    value: recurrence,
    label: t(`availability.recurrence.${recurrence}` as TranslationKey),
  }));

  if (loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('availability.loading')}
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
            <ThemedText type="title">{t('availability.manageTitle')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('availability.manageBody')}
            </ThemedText>
          </View>

          {loadState === 'error' ? (
            <Feedback
              message={t('availability.loadErrorBody')}
              title={t('availability.loadErrorTitle')}
              tone="error"
            />
          ) : null}

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
              name="slotDurationMinutes"
              render={({ field: { onChange, value } }) => (
                <ProfileOptionSelector
                  label={t('availability.durationLabel')}
                  onChange={onChange}
                  options={durationOptions}
                  value={value}
                />
              )}
            />
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

            <View style={styles.preview}>
              <ThemedText type="smallBold">
                {t('availability.previewTitle')}
              </ThemedText>
              {previewSlots.length > 0 ? (
                <View style={styles.previewList}>
                  {previewSlots.map((slot) => (
                    <ThemedText
                      key={`${slot.startsAt}-${slot.endsAt}`}
                      type="small"
                      themeColor="textMuted">
                      {t('availability.previewSlot', {
                        start: formatTime(slot.startsAt),
                        end: formatTime(slot.endsAt),
                        location: slot.location,
                      })}
                    </ThemedText>
                  ))}
                </View>
              ) : (
                <ThemedText type="small" themeColor="textMuted">
                  {t('availability.previewEmpty')}
                </ThemedText>
              )}
            </View>

            {feedback === 'saved' ? (
              <Feedback
                message={t('availability.saveSuccessBody')}
                title={t('availability.saveSuccessTitle')}
                tone="success"
              />
            ) : null}
            {feedback === 'conflict' ? (
              <Feedback
                message={t('availability.conflictBody')}
                title={t('availability.conflictTitle')}
                tone="warning"
              />
            ) : null}
            {feedback === 'forbidden' ? (
              <Feedback
                message={t('availability.forbiddenBody')}
                title={t('availability.forbiddenTitle')}
                tone="error"
              />
            ) : null}
            {feedback === 'error' ? (
              <Feedback
                message={t('availability.saveErrorBody')}
                title={t('availability.saveErrorTitle')}
                tone="error"
              />
            ) : null}

            <View style={styles.actions}>
              <Button
                disabled={isSubmitting || loadState === 'error'}
                label={
                  isSubmitting
                    ? t('availability.saving')
                    : t('availability.createAction')
                }
                onPress={() => void onSubmit()}
              />
            </View>
          </Card>

          <View style={styles.list}>
            <ThemedText type="subtitle">{t('availability.listTitle')}</ThemedText>
            {ranges.length === 0 ? (
              <Feedback
                message={t('availability.emptyBody')}
                title={t('availability.emptyTitle')}
                tone="info"
              />
            ) : (
              <View style={styles.grid}>
                {ranges.map((range) => (
                  <Card key={range.id} style={styles.rangeCard}>
                    <ThemedText type="smallBold">
                      {formatDateTime(range.startsAt)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('availability.rangeTime', {
                        start: formatTime(range.startsAt),
                        end: formatTime(range.endsAt),
                      })}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('availability.rangeMeta', {
                        duration: t(
                          `availability.duration.${range.slotDurationMinutes}` as TranslationKey
                        ),
                        location: range.location,
                      })}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {t(
                        `availability.recurrence.${range.recurrenceType}` as TranslationKey
                      )}
                    </ThemedText>
                    {range.recurrenceEndsOn ? (
                      <ThemedText type="small" themeColor="textMuted">
                        {t('availability.recurrenceUntil', {
                          date: formatDate(range.recurrenceEndsOn),
                        })}
                      </ThemedText>
                    ) : null}
                    <View style={styles.slotList}>
                      <ThemedText type="smallBold">
                        {t('availability.generatedSlotsTitle')}
                      </ThemedText>
                      {(slotsByRangeId.get(range.id) ?? []).map((slot) => (
                        <View key={slot.id} style={styles.slotRow}>
                          <ThemedText type="small" themeColor="textMuted">
                            {t('availability.generatedSlot', {
                              date: formatDateTime(slot.startsAt),
                              start: formatTime(slot.startsAt),
                              end: formatTime(slot.endsAt),
                              duration: t(
                                `availability.duration.${slot.durationMinutes}` as TranslationKey
                              ),
                              location: slot.location,
                            })}
                          </ThemedText>
                          <ThemedText type="smallBold" themeColor="primary">
                            {t(
                              `availability.slotStatus.${slot.status}` as TranslationKey
                            )}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </Card>
                ))}
              </View>
            )}
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
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  preview: {
    gap: Spacing.two,
  },
  previewList: {
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  rangeCard: {
    minWidth: 280,
    flex: 1,
    gap: Spacing.two,
  },
  slotList: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  slotRow: {
    gap: Spacing.half,
  },
});
