import {
  bookingParticipantLimits,
  getSchedulingToday,
  isBookingParticipantCountValid,
  schedulingLocalDateTimeToIso,
  type PricingDuration,
  type PricingLessonType,
} from '@nextpoint/shared';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Radii, Spacing } from '@/constants/theme';
import type { BookingMutationError } from '@/features/bookings/booking-service';
import { getCoachBookingPricingOptions } from '@/features/bookings/coach-booking-pricing';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import type { PricingRate } from '@/features/pricing/pricing-service';
import type { AssociatedStudent } from '@/features/students/student-coach-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export type CoachBookingCreateInput = {
  durationMinutes: PricingDuration;
  lessonType: PricingLessonType;
  recurrenceEndsOn: string | null;
  startsAt: string;
  studentIds: string[];
};

const creationErrorKeys: Record<
  BookingMutationError,
  [TranslationKey, TranslationKey]
> = {
  unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
  slot_unavailable: ['booking.errorTitle', 'booking.slotUnavailable'],
  already_processed: ['booking.errorTitle', 'booking.alreadyProcessed'],
  invalid_participants: ['booking.errorTitle', 'booking.invalidParticipants'],
  invalid_input: ['booking.errorTitle', 'booking.invalidInput'],
  pricing_rate_missing: ['booking.errorTitle', 'booking.pricingMissing'],
  past_booking: ['booking.errorTitle', 'booking.pastBooking'],
  pending_limit_reached: ['booking.errorTitle', 'booking.pendingLimit'],
  student_pending_limit_reached: [
    'booking.errorTitle',
    'booking.studentPendingLimit',
  ],
  student_schedule_conflict: [
    'booking.errorTitle',
    'booking.studentScheduleConflict',
  ],
  not_found: ['booking.errorTitle', 'booking.unknownError'],
  unknown: ['booking.errorTitle', 'booking.unknownError'],
};

function toStartsAt(date: string, time: string) {
  const startsAt = schedulingLocalDateTimeToIso(date, time);
  if (!startsAt) throw new RangeError('Invalid Europe/Paris booking date');
  return startsAt;
}

export function CoachBookingCreateSection({
  disabled,
  error,
  onCreate,
  onReset,
  pending,
  pricingRates,
  students,
  succeeded,
}: {
  disabled: boolean;
  error: BookingMutationError | null;
  onCreate: (input: CoachBookingCreateInput) => Promise<void>;
  onReset: () => void;
  pending: boolean;
  pricingRates: PricingRate[];
  students: AssociatedStudent[];
  succeeded: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [lessonType, setLessonType] =
    useState<PricingLessonType>('individual');
  const [date, setDate] = useState(getSchedulingToday);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState<'60' | '90'>('60');
  const [recurrenceEndsOn, setRecurrenceEndsOn] = useState('');

  const pricingOptions = useMemo(
    () =>
      getCoachBookingPricingOptions(
        pricingRates,
        {
          durationMinutes: Number(duration) as PricingDuration,
          lessonType,
        },
        selectedStudentIds[0]
      ),
    [duration, lessonType, pricingRates, selectedStudentIds]
  );
  const selectedLessonType = pricingOptions.selection.lessonType;
  const participantLimit = bookingParticipantLimits[selectedLessonType].max;
  const hasValidParticipants = isBookingParticipantCountValid(
    selectedLessonType,
    selectedStudentIds.length
  );

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((current) => {
      if (selectedLessonType === 'individual') return [studentId];
      return current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId];
    });
  };

  const submit = async () => {
    await onCreate({
      studentIds: selectedStudentIds,
      startsAt: toStartsAt(date, time),
      durationMinutes: pricingOptions.selection.durationMinutes,
      lessonType: pricingOptions.selection.lessonType,
      recurrenceEndsOn: recurrenceEndsOn.trim() || null,
    });
  };

  const reset = () => {
    setSelectedStudentIds([]);
    setRecurrenceEndsOn('');
    onReset();
  };

  return (
    <>
      <Card elevated style={styles.formCard}>
        <ThemedText type="subtitle">{t('booking.coachCreateTitle')}</ThemedText>
        {!pricingOptions.hasMatchingRate ? (
          <Feedback
            message={t('booking.createPricingRequiredBody')}
            title={t('booking.createPricingRequiredTitle')}
            tone="warning"
          />
        ) : null}
        <ProfileOptionSelector<PricingLessonType>
          label={t('booking.lessonTypeLabel')}
          onChange={(value) => {
            setLessonType(value);
            setSelectedStudentIds([]);
          }}
          options={pricingOptions.lessonTypes.map((value) => ({
            value,
            label: t(`pricing.type.${value}` as TranslationKey),
          }))}
          value={pricingOptions.selection.lessonType}
        />
        <View style={styles.studentPicker}>
          <ThemedText type="smallBold">
            {selectedLessonType === 'individual'
              ? t('booking.studentLabel')
              : t('booking.participantsLabel')}
          </ThemedText>
          <View style={styles.segmented}>
            {students.map((student) => (
              <Button
                disabled={
                  selectedLessonType !== 'individual' &&
                  selectedStudentIds.length >= participantLimit &&
                  !selectedStudentIds.includes(student.userId)
                }
                key={student.userId}
                label={student.fullName}
                onPress={() => toggleStudent(student.userId)}
                variant={
                  selectedStudentIds.includes(student.userId)
                    ? 'primary'
                    : 'secondary'
                }
              />
            ))}
          </View>
        </View>
        <View style={styles.formGrid}>
          <TextField
            label={t('availability.dateLabel')}
            onChangeText={setDate}
            placeholder={t('availability.datePlaceholder')}
            value={date}
          />
          <TextField
            label={t('availability.startsAtLabel')}
            onChangeText={setTime}
            placeholder={t('availability.timePlaceholder')}
            value={time}
          />
          <ProfileOptionSelector<'60' | '90'>
            label={t('availability.durationLabel')}
            onChange={setDuration}
            options={pricingOptions.durationMinutes.map((value) => ({
              value: String(value) as '60' | '90',
              label: t(`availability.duration.${value}` as TranslationKey),
            }))}
            value={String(pricingOptions.selection.durationMinutes) as '60' | '90'}
          />
        </View>
        <TextField
          label={t('booking.recurrenceEndsOnLabel')}
          onChangeText={setRecurrenceEndsOn}
          placeholder={t('booking.recurrenceEndsOnPlaceholder')}
          value={recurrenceEndsOn}
        />
        <Button
          disabled={
            succeeded ||
            !hasValidParticipants ||
            !pricingOptions.hasMatchingRate ||
            disabled
          }
          label={
            succeeded
              ? t('booking.createSuccessButton')
              : pending
                ? t('booking.creating')
                : t('booking.createAction')
          }
          onPress={() => void submit()}
        />
        {error ? (
          <Feedback
            message={t(creationErrorKeys[error][1])}
            title={t(creationErrorKeys[error][0])}
            tone="error"
          />
        ) : null}
      </Card>

      {succeeded ? (
        <View
          accessibilityLiveRegion="assertive"
          accessibilityRole="alert"
          style={[
            styles.creationSuccess,
            {
              backgroundColor: theme.successSurface,
              borderColor: theme.success,
            },
          ]}>
          <ThemedText
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.creationSuccessIcon}
            themeColor="success">
            ✓
          </ThemedText>
          <ThemedText type="subtitle" themeColor="success">
            {t('booking.createSuccessTitle')}
          </ThemedText>
          <ThemedText type="default">
            {t('booking.createSuccessBody')}
          </ThemedText>
          <Button
            label={t('booking.createAnotherAction')}
            onPress={reset}
            variant="secondary"
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  studentPicker: {
    gap: Spacing.two,
  },
  formGrid: {
    gap: Spacing.three,
  },
  creationSuccess: {
    alignItems: 'center',
    borderRadius: Radii.medium,
    borderWidth: 2,
    gap: Spacing.three,
    padding: Spacing.five,
  },
  creationSuccessIcon: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: 700,
  },
});
