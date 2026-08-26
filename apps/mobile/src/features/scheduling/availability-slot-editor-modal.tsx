import {
  availabilityLocations,
  defaultAvailabilityLocation,
  getSchedulingDateKey,
  getSchedulingDateLabelInstant,
  getSchedulingTime,
  schedulingTimeZone,
  type AvailabilityRangeFormInput,
} from '@nextpoint/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AvailabilityFeedback } from '@/features/scheduling/availability-feedback';
import {
  type AvailabilityRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import { SchedulingModal } from '@/features/scheduling/scheduling-modal';
import type { AvailabilityFeedback as AvailabilityFeedbackValue } from '@/features/scheduling/use-availability-management';
import { useTranslation, type TranslationKey } from '@/i18n';

type AvailabilitySlotEditorModalProps = {
  feedback: AvailabilityFeedbackValue;
  onClose: () => void;
  onDelete: (slot: AvailabilitySlot) => void;
  onScopeCancel: () => void;
  onScopeSelect: (applyToSeries: boolean) => void;
  onSave: (
    slot: AvailabilitySlot,
    values: AvailabilityRangeFormInput
  ) => void;
  pending: boolean;
  range: AvailabilityRange | null;
  scopeSelectionAction: 'delete' | 'save' | null;
  slot: AvailabilitySlot | null;
};

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

export function AvailabilitySlotEditorModal({
  slot,
  ...props
}: AvailabilitySlotEditorModalProps) {
  return (
    <AvailabilitySlotEditorModalContent
      key={slot?.id ?? 'closed'}
      {...props}
      slot={slot}
    />
  );
}

function AvailabilitySlotEditorModalContent({
  feedback,
  onClose,
  onDelete,
  onScopeCancel,
  onScopeSelect,
  onSave,
  pending,
  range,
  scopeSelectionAction,
  slot,
}: AvailabilitySlotEditorModalProps) {
  const { locale, t } = useTranslation();
  const [values, setValues] = useState<AvailabilityRangeFormInput | null>(() =>
    slot ? slotToFormInput(slot) : null
  );

  const setField = <Key extends keyof AvailabilityRangeFormInput>(
    key: Key,
    value: AvailabilityRangeFormInput[Key]
  ) => {
    setValues((current) =>
      current ? { ...current, [key]: value } : current
    );
  };

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
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

  const subtitle = slot ? (
    <View style={styles.subtitle}>
      <ThemedText type="small" themeColor="textMuted">
        {t(`availability.slotStatus.${slot.status}` as TranslationKey)}
      </ThemedText>
      {range ? (
        <ThemedText type="small" themeColor="textMuted">
          {t(
            `availability.recurrence.${range.recurrenceType}` as TranslationKey
          )}
          {range.recurrenceEndsOn
            ? ` · ${t('availability.recurrenceUntil', {
                date: formatDate(range.recurrenceEndsOn),
              })}`
            : ''}
        </ThemedText>
      ) : null}
    </View>
  ) : undefined;

  return (
    <SchedulingModal
      closeLabel={t('availability.cancelAction')}
      onClose={onClose}
      pending={pending}
      presentation="dialog"
      subtitle={subtitle}
      title={slot ? formatDateTime(slot.startsAt) : ''}
      visible={Boolean(slot && values)}>
      {slot && values ? (
        scopeSelectionAction ? (
          <View style={styles.scopeSelection}>
            <Feedback
              message={t('availability.scopeDialogBody')}
              title={t(
                scopeSelectionAction === 'delete'
                  ? 'availability.scopeDeleteDialogTitle'
                  : 'availability.scopeDialogTitle'
              )}
              tone="info"
            />
            <View style={styles.actions}>
              <Button
                disabled={pending}
                label={t('availability.scopeOccurrenceAction')}
                onPress={() => onScopeSelect(false)}
                variant={
                  scopeSelectionAction === 'delete' ? 'danger' : 'primary'
                }
              />
              <Button
                disabled={pending}
                label={t('availability.scopeSeriesAction')}
                onPress={() => onScopeSelect(true)}
                variant={
                  scopeSelectionAction === 'delete' ? 'danger' : 'secondary'
                }
              />
              <Button
                disabled={pending}
                label={t('availability.cancelAction')}
                onPress={onScopeCancel}
                variant="secondary"
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.formGrid}>
              <TextField
                label={t('availability.dateLabel')}
                onChangeText={(value) => setField('date', value)}
                placeholder={t('availability.datePlaceholder')}
                value={values.date}
              />
              <TextField
                label={t('availability.startsAtLabel')}
                onChangeText={(value) =>
                  setField('startsAtLocalTime', value)
                }
                placeholder={t('availability.timePlaceholder')}
                value={values.startsAtLocalTime}
              />
              <TextField
                label={t('availability.endsAtLabel')}
                onChangeText={(value) => setField('endsAtLocalTime', value)}
                placeholder={t('availability.timePlaceholder')}
                value={values.endsAtLocalTime}
              />
            </View>
            <ProfileOptionSelector
              label={t('availability.locationLabel')}
              onChange={(value) => setField('location', value)}
              options={availabilityLocations.map((location) => ({
                value: location,
                label: location,
              }))}
              value={values.location}
            />
            <AvailabilityFeedback context="edit" value={feedback} />
            <View style={styles.actions}>
              <Button
                disabled={pending}
                label={t('availability.updateAction')}
                onPress={() => onSave(slot, values)}
              />
              <Button
                disabled={pending}
                label={t('availability.deleteAction')}
                onPress={() => onDelete(slot)}
                variant="danger"
              />
              <Button
                disabled={pending}
                label={t('availability.cancelAction')}
                onPress={onClose}
                variant="secondary"
              />
            </View>
          </>
        )
      ) : null}
    </SchedulingModal>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    gap: Spacing.one,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  scopeSelection: {
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
