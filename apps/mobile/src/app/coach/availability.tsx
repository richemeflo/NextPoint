import { zodResolver } from '@hookform/resolvers/zod';
import {
  availabilityLocations,
  availabilityRangeSchema,
  availabilityRecurrenceTypes,
  defaultAvailabilityLocation,
  getDefaultAvailabilityRecurrenceEndsOn,
  getSchedulingDateKey,
  getSchedulingDateLabelInstant,
  getSchedulingTime,
  getSchedulingToday,
  schedulingTimeZone,
  toAvailabilityRangeInput,
  type AvailabilityRangeFormInput,
  type AvailabilityRecurrenceType,
} from '@nextpoint/shared';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
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
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  acquireMutationLock,
  releaseMutationLock,
} from '@/features/mutations/mutation-lock';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  createAvailabilityRange,
  deleteAvailabilitySlot,
  getCoachAvailabilitySlots,
  getCoachAvailabilityRanges,
  updateAvailabilitySlot,
  type AvailabilityRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import { isCoachPlanningSlotVisible } from '@/features/scheduling/coach-planning-visibility';
import { planningControlIcons } from '@/features/scheduling/planning-control-icons';
import {
  getPlanningWindow,
  movePlanningAnchor,
  type PlanningViewMode,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

function slotToFormInput(slot: AvailabilitySlot): AvailabilityRangeFormInput {
  const startsAt = new Date(slot.startsAt);
  const endsAt = new Date(slot.endsAt);
  const location =
    availabilityLocations.find((candidate) => candidate === slot.location) ??
    defaultAvailabilityLocation;

  return {
    date: getSchedulingDateKey(startsAt),
    startsAtLocalTime: getSchedulingTime(startsAt),
    endsAtLocalTime: getSchedulingTime(endsAt),
    slotDurationMinutes: '60',
    location,
    recurrenceType: 'none',
    recurrenceEndsOn: '',
  };
}

const defaultValues: AvailabilityRangeFormInput = {
  date: getSchedulingToday(),
  startsAtLocalTime: '18:00',
  endsAtLocalTime: '19:30',
  slotDurationMinutes: '60',
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
    | 'none'
    | 'saved'
    | 'updated'
    | 'deleted'
    | 'conflict'
    | 'blocked'
    | 'forbidden'
    | 'error'
  >('none');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingSlotValues, setEditingSlotValues] =
    useState<AvailabilityRangeFormInput | null>(null);
  const [agendaMode, setAgendaMode] = useState<PlanningViewMode>('week');
  const [agendaAnchorDate, setAgendaAnchorDate] = useState(getSchedulingToday);
  const availabilityMutationLock = useRef(false);
  const [mutationPending, setMutationPending] = useState(false);
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
  const agendaWindow = useMemo(
    () => getPlanningWindow(agendaAnchorDate, agendaMode),
    [agendaAnchorDate, agendaMode]
  );

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
    ])
      .then(([rangesResult, slotsResult]) => {
        if (!active) return;
        if (!rangesResult.ok || !slotsResult.ok) {
          setLoadState('error');
          return;
        }

        setRanges(rangesResult.data);
        setSlots(slotsResult.data);
        setLoadState('ready');
      })
      .catch(() => {
        if (!active) return;
        setLoadState('error');
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
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: schedulingTimeZone,
    }).format(getSchedulingDateLabelInstant(value) ?? new Date(value));

  const formatAgendaDay = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: schedulingTimeZone,
    }).format(getSchedulingDateLabelInstant(value) ?? new Date(value));

  const slotsByRangeId = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const current = grouped.get(slot.rangeId) ?? [];
      current.push(slot);
      grouped.set(slot.rangeId, current);
    }

    return grouped;
  }, [slots]);

  const visibleSlots = useMemo(
    () => slots.filter((slot) => isCoachPlanningSlotVisible(slot.status)),
    [slots]
  );
  const agendaSlots = useMemo(() => {
    const startsAt = new Date(agendaWindow.startsAt).getTime();
    const endsAt = new Date(agendaWindow.endsAt).getTime();

    return visibleSlots.filter((slot) => {
      const slotStartsAt = new Date(slot.startsAt).getTime();
      return slotStartsAt >= startsAt && slotStartsAt < endsAt;
    });
  }, [agendaWindow.endsAt, agendaWindow.startsAt, visibleSlots]);

  const rangeById = useMemo(() => {
    const byId = new Map<string, AvailabilityRange>();

    for (const range of ranges) {
      byId.set(range.id, range);
    }

    return byId;
  }, [ranges]);
  const selectedSlot = useMemo(
    () => visibleSlots.find((slot) => slot.id === editingSlotId) ?? null,
    [editingSlotId, visibleSlots]
  );
  const selectedRange = selectedSlot ? rangeById.get(selectedSlot.rangeId) : null;

  const submitAvailability = async (form: AvailabilityRangeFormInput) => {
    if (!acquireMutationLock(availabilityMutationLock)) return;

    setMutationPending(true);
    setFeedback('none');
    try {
      const result = await createAvailabilityRange(
        toAvailabilityRangeInput(form)
      );

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
    } catch {
      setFeedback('error');
    } finally {
      setMutationPending(false);
      releaseMutationLock(availabilityMutationLock);
    }
  };

  const onSubmit = () => {
    void handleSubmit(submitAvailability)();
  };

  const startEditingSlot = (slot: AvailabilitySlot) => {
    setFeedback('none');
    setEditingSlotId(slot.id);
    setEditingSlotValues(slotToFormInput(slot));
  };

  const cancelEditingSlot = () => {
    setEditingSlotId(null);
    setEditingSlotValues(null);
  };

  const moveAgenda = (direction: -1 | 1) => {
    cancelEditingSlot();
    setAgendaAnchorDate((current) =>
      movePlanningAnchor(current, agendaMode, direction)
    );
  };

  const setEditingSlotField = <Key extends keyof AvailabilityRangeFormInput>(
    key: Key,
    value: AvailabilityRangeFormInput[Key]
  ) => {
    setEditingSlotValues((current) =>
      current ? { ...current, [key]: value } : current
    );
  };

  const canOfferSeriesScope = (slot: AvailabilitySlot) => {
    const range = rangeById.get(slot.rangeId);
    if (!range || range.recurrenceType === 'none') return false;

    return (slotsByRangeId.get(slot.rangeId) ?? []).every(
      (candidate) => candidate.status === 'available'
    );
  };

  const setMutationFeedback = (
    code: 'blocked' | 'conflict' | 'forbidden' | 'invalid' | undefined
  ) => {
    setFeedback(
      code === 'blocked'
        ? 'blocked'
        : code === 'conflict'
          ? 'conflict'
          : code === 'forbidden'
            ? 'forbidden'
            : 'error'
    );
  };

  const saveEditedSlot = async (
    slot: AvailabilitySlot,
    applyToSeries: boolean
  ) => {
    if (!editingSlotValues) return;

    const parsed = availabilityRangeSchema.safeParse(editingSlotValues);
    if (!parsed.success) {
      setFeedback('error');
      return;
    }

    const input = toAvailabilityRangeInput(parsed.data);
    const durationMinutes = Math.round(
      (new Date(input.endsAt).getTime() - new Date(input.startsAt).getTime()) /
        60_000
    );
    const result = await updateAvailabilitySlot({
      slotId: slot.id,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      durationMinutes,
      location: input.location,
      applyToSeries,
    });

    if (!result.ok) {
      setMutationFeedback(result.code);
      return;
    }

    setFeedback('updated');
    cancelEditingSlot();
    await loadRanges();
  };

  const deleteSlot = async (slot: AvailabilitySlot, applyToSeries: boolean) => {
    const result = await deleteAvailabilitySlot(slot.id, applyToSeries);

    if (!result.ok) {
      setMutationFeedback(result.code);
      return;
    }

    setFeedback('deleted');
    cancelEditingSlot();
    await loadRanges();
  };

  const requestMutationScope = (
    slot: AvailabilitySlot,
    action: 'save' | 'delete'
  ) => {
    if (!acquireMutationLock(availabilityMutationLock)) return;
    setMutationPending(true);

    const releasePendingMutation = () => {
      setMutationPending(false);
      releaseMutationLock(availabilityMutationLock);
    };
    const runMutation = async (applyToSeries: boolean) => {
      try {
        if (action === 'save') {
          await saveEditedSlot(slot, applyToSeries);
        } else {
          await deleteSlot(slot, applyToSeries);
        }
      } catch {
        setFeedback('error');
      } finally {
        releasePendingMutation();
      }
    };
    const applyOccurrence = () =>
      void runMutation(false);
    const applySeries = () => void runMutation(true);

    if (!canOfferSeriesScope(slot)) {
      applyOccurrence();
      return;
    }

    Alert.alert(
      t('availability.scopeDialogTitle'),
      t('availability.scopeDialogBody'),
      [
        {
          text: t('availability.scopeOccurrenceAction'),
          onPress: applyOccurrence,
        },
        {
          text: t('availability.scopeSeriesAction'),
          onPress: applySeries,
        },
        {
          text: t('availability.cancelAction'),
          onPress: releasePendingMutation,
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

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
                    error={
                      translateError(error?.message)
                    }
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

            {feedback === 'saved' ? (
              <Feedback
                message={t('availability.saveSuccessBody')}
                title={t('availability.saveSuccessTitle')}
                tone="success"
              />
            ) : null}
            {feedback === 'updated' ? (
              <Feedback
                message={t('availability.updateSuccessBody')}
                title={t('availability.updateSuccessTitle')}
                tone="success"
              />
            ) : null}
            {feedback === 'deleted' ? (
              <Feedback
                message={t('availability.deleteSuccessBody')}
                title={t('availability.deleteSuccessTitle')}
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
            {feedback === 'blocked' ? (
              <Feedback
                message={t('availability.blockedBody')}
                title={t('availability.blockedTitle')}
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
                disabled={
                  isSubmitting || mutationPending || loadState === 'error'
                }
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
            {visibleSlots.length === 0 ? (
              <Feedback
                message={t('availability.emptyBody')}
                title={t('availability.emptyTitle')}
                tone="info"
              />
            ) : (
              <View style={styles.savedAgenda}>
                <View style={styles.toolbar}>
                  <View style={styles.toolbarSegmented}>
                    {(['week', 'day'] as const).map((candidate) => (
                      <Button
                        key={candidate}
                        label={t(`planning.mode.${candidate}` as TranslationKey)}
                        onPress={() => {
                          cancelEditingSlot();
                          setAgendaMode(candidate);
                        }}
                        style={styles.toolbarButton}
                        variant={agendaMode === candidate ? 'primary' : 'secondary'}
                      />
                    ))}
                  </View>
                  <View style={styles.periodActions}>
                    <Button
                      icon={planningControlIcons.previous}
                      label={t('planning.previousAction')}
                      onPress={() => moveAgenda(-1)}
                      style={[styles.toolbarButton, styles.periodButton]}
                      variant="secondary"
                    />
                    <Button
                      label={t('planning.todayAction')}
                      onPress={() => {
                        cancelEditingSlot();
                        setAgendaAnchorDate(getSchedulingToday());
                      }}
                      style={[styles.toolbarButton, styles.periodButton]}
                      variant="secondary"
                    />
                    <Button
                      icon={planningControlIcons.next}
                      iconPosition="right"
                      label={t('planning.nextAction')}
                      onPress={() => moveAgenda(1)}
                      style={[styles.toolbarButton, styles.periodButton]}
                      variant="secondary"
                    />
                  </View>
                </View>

                {agendaSlots.length === 0 ? (
                  <Feedback
                    message={t('availability.emptyPeriodBody')}
                    title={t('availability.emptyPeriodTitle')}
                    tone="info"
                  />
                ) : null}

                <AgendaGrid
                  days={agendaWindow.days}
                  formatDay={formatAgendaDay}
                  getSlotStyle={(slot) => ({
                    backgroundColor:
                      editingSlotId === slot.id
                        ? theme.backgroundSelected
                        : theme.successSurface,
                    borderColor:
                      editingSlotId === slot.id ? theme.primary : theme.success,
                    borderLeftWidth: 5,
                  })}
                  onSlotPress={(slot) => startEditingSlot(slot)}
                  renderSlot={(slot) => (
                    <>
                      <ThemedText numberOfLines={1} type="smallBold">
                        {t('availability.rangeTime', {
                          start: formatTime(slot.startsAt),
                          end: formatTime(slot.endsAt),
                        })}
                      </ThemedText>
                      <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
                        {`${slot.location} · ${t(
                          `availability.slotStatus.${slot.status}` as TranslationKey
                        )}`}
                      </ThemedText>
                    </>
                  )}
                  slots={agendaSlots}
                />

              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={cancelEditingSlot}
        transparent
        visible={Boolean(selectedSlot && editingSlotValues)}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel={t('availability.cancelAction')}
            accessibilityRole="button"
            onPress={cancelEditingSlot}
            style={styles.modalBackdrop}
          />
          {selectedSlot && editingSlotValues ? (
            <View
              style={[
                styles.modalSurface,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}>
              <ScrollView
                contentContainerStyle={styles.slotEditPanel}
                keyboardShouldPersistTaps="handled">
                <View style={styles.slotEditHeading}>
                  <View style={styles.slotEditTitle}>
                    <ThemedText type="smallBold">
                      {formatDateTime(selectedSlot.startsAt)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {t(
                        `availability.slotStatus.${selectedSlot.status}` as TranslationKey
                      )}
                    </ThemedText>
                  </View>
                  {selectedRange ? (
                    <ThemedText type="small" themeColor="textMuted">
                      {t(
                        `availability.recurrence.${selectedRange.recurrenceType}` as TranslationKey
                      )}
                      {selectedRange.recurrenceEndsOn
                        ? ` · ${t('availability.recurrenceUntil', {
                            date: formatDate(selectedRange.recurrenceEndsOn),
                          })}`
                        : ''}
                    </ThemedText>
                  ) : null}
                </View>
                <View style={styles.formGrid}>
                  <TextField
                    label={t('availability.dateLabel')}
                    onChangeText={(value) => setEditingSlotField('date', value)}
                    placeholder={t('availability.datePlaceholder')}
                    value={editingSlotValues.date}
                  />
                  <TextField
                    label={t('availability.startsAtLabel')}
                    onChangeText={(value) =>
                      setEditingSlotField('startsAtLocalTime', value)
                    }
                    placeholder={t('availability.timePlaceholder')}
                    value={editingSlotValues.startsAtLocalTime}
                  />
                  <TextField
                    label={t('availability.endsAtLabel')}
                    onChangeText={(value) =>
                      setEditingSlotField('endsAtLocalTime', value)
                    }
                    placeholder={t('availability.timePlaceholder')}
                    value={editingSlotValues.endsAtLocalTime}
                  />
                </View>
                <ProfileOptionSelector
                  label={t('availability.locationLabel')}
                  onChange={(value) => setEditingSlotField('location', value)}
                  options={availabilityLocations.map((location) => ({
                    value: location,
                    label: location,
                  }))}
                  value={editingSlotValues.location}
                />
                <View style={styles.slotActions}>
                  <Button
                    disabled={mutationPending}
                    label={t('availability.updateAction')}
                    onPress={() => requestMutationScope(selectedSlot, 'save')}
                  />
                  <Button
                    disabled={mutationPending}
                    label={t('availability.deleteAction')}
                    onPress={() => requestMutationScope(selectedSlot, 'delete')}
                    variant="secondary"
                  />
                  <Button
                    disabled={mutationPending}
                    label={t('availability.cancelAction')}
                    onPress={cancelEditingSlot}
                    variant="secondary"
                  />
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.three,
  },
  savedAgenda: {
    gap: Spacing.three,
  },
  toolbar: {
    gap: Spacing.two,
  },
  toolbarSegmented: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  periodActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  toolbarButton: {
    flex: 1,
    paddingHorizontal: Spacing.one,
  },
  periodButton: {
    minWidth: 0,
  },
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  modalSurface: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    maxHeight: '90%',
    maxWidth: 720,
    overflow: 'hidden',
    width: '100%',
  },
  slotEditPanel: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  slotEditHeading: {
    gap: Spacing.one,
  },
  slotEditTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  slotActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
