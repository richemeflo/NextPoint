import {
  bookingParticipantLimits,
  getSchedulingDateKey,
  getSchedulingTime,
  isBookingParticipantCountValid,
  schedulingLocalDateTimeToIso,
  type PricingLessonType,
} from '@nextpoint/shared';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { Booking } from '@/features/bookings/booking-service';
import { PricingStudentSelector } from '@/features/pricing/pricing-student-selector';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { SchedulingModal } from '@/features/scheduling/scheduling-modal';
import type { AssociatedStudent } from '@/features/students/student-coach-service';
import { useTranslation } from '@/i18n';

export type CoachBookingEditInput = {
  bookingId: string;
  durationMinutes: 60 | 90;
  location: 'Les Bruyères Centre Sportif';
  lessonType: PricingLessonType;
  startsAt: string;
  studentIds: string[];
};

export type CoachBookingRecurrenceCancellationInput = {
  bookingId: string;
  startsOn: string;
  endsOn: string;
};

export function CoachBookingEditorModal({
  booking,
  formatTime,
  onClose,
  onCancelRecurrences,
  onSubmit,
  pending,
  studentName,
  students,
}: {
  booking: Booking;
  formatTime: (value: string) => string;
  onClose: () => void;
  onCancelRecurrences: (
    input: CoachBookingRecurrenceCancellationInput
  ) => Promise<boolean>;
  onSubmit: (input: CoachBookingEditInput) => Promise<boolean>;
  pending: boolean;
  studentName: string;
  students: AssociatedStudent[];
}) {
  const { t } = useTranslation();
  const startsAt = new Date(booking.startsAt);
  const [date, setDate] = useState(() => getSchedulingDateKey(startsAt));
  const [time, setTime] = useState(() => getSchedulingTime(startsAt));
  const [duration, setDuration] = useState<'60' | '90'>(() =>
    String(booking.durationMinutes) as '60' | '90'
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState(() =>
    booking.participants.length > 0
      ? booking.participants.map((participant) => participant.studentId)
      : [booking.studentId]
  );
  const [studentQuery, setStudentQuery] = useState('');
  const [recurrenceStartsOn, setRecurrenceStartsOn] = useState(() =>
    getSchedulingDateKey(startsAt)
  );
  const [recurrenceEndsOn, setRecurrenceEndsOn] = useState(() =>
    getSchedulingDateKey(startsAt)
  );
  const canEditParticipants = booking.lessonType === 'group';
  const participantLimit = bookingParticipantLimits[booking.lessonType].max;
  const hasValidParticipants = isBookingParticipantCountValid(
    booking.lessonType,
    selectedStudentIds.length
  );
  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.userId,
        label: student.fullName,
        description:
          [student.phone, student.email].filter(Boolean).join(' · ') ||
          undefined,
      })),
    [students]
  );

  const submit = async () => {
    const updatedStartsAt = schedulingLocalDateTimeToIso(date, time);
    if (!updatedStartsAt) return;

    if (
      await onSubmit({
        bookingId: booking.id,
        studentIds: selectedStudentIds,
        startsAt: updatedStartsAt,
        durationMinutes: Number(duration) as 60 | 90,
        location: booking.location as 'Les Bruyères Centre Sportif',
        lessonType: booking.lessonType,
      })
    ) {
      onClose();
    }
  };

  const cancelRecurrences = async () => {
    if (
      await onCancelRecurrences({
        bookingId: booking.id,
        startsOn: recurrenceStartsOn,
        endsOn: recurrenceEndsOn,
      })
    ) {
      onClose();
    }
  };

  return (
    <SchedulingModal
      closeLabel={t('availability.cancelAction')}
      onClose={onClose}
      pending={pending}
      presentation="dialog"
      subtitle={
        <ThemedText type="small" themeColor="textMuted">
          {studentName} ·{' '}
          {t('planning.slotTime', {
            start: formatTime(booking.startsAt),
            end: formatTime(booking.endsAt),
          })}
        </ThemedText>
      }
      title={t('booking.modifyAction')}
      visible>
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
      </View>
      <ProfileOptionSelector<'60' | '90'>
        label={t('availability.durationLabel')}
        onChange={setDuration}
        options={[
          { value: '60', label: t('availability.duration.60') },
          { value: '90', label: t('availability.duration.90') },
        ]}
        value={duration}
      />
      {canEditParticipants ? (
        <PricingStudentSelector
          label={t('booking.participantsLabel')}
          maxSelected={participantLimit}
          onChange={setSelectedStudentIds}
          onQueryChange={setStudentQuery}
          options={studentOptions}
          query={studentQuery}
          values={selectedStudentIds}
        />
      ) : null}
      <View style={styles.modalActions}>
        <Button
          disabled={pending || !hasValidParticipants}
          label={t('availability.updateAction')}
          onPress={() => void submit()}
        />
        <Button
          disabled={pending}
          label={t('availability.cancelAction')}
          onPress={onClose}
          variant="secondary"
        />
      </View>
      {booking.recurrenceSeriesId ? (
        <View style={styles.recurrenceSection}>
          <ThemedText type="smallBold">
            {t('booking.recurrenceCancelTitle')}
          </ThemedText>
          <View style={styles.formGrid}>
            <TextField
              label={t('booking.recurrenceStartsOnLabel')}
              onChangeText={setRecurrenceStartsOn}
              placeholder={t('availability.datePlaceholder')}
              value={recurrenceStartsOn}
            />
            <TextField
              label={t('booking.recurrenceEndsOnRangeLabel')}
              onChangeText={setRecurrenceEndsOn}
              placeholder={t('availability.datePlaceholder')}
              value={recurrenceEndsOn}
            />
          </View>
          <Button
            disabled={pending}
            label={t('booking.recurrenceCancelAction')}
            onPress={() => void cancelRecurrences()}
            variant="secondary"
          />
        </View>
      ) : null}
    </SchedulingModal>
  );
}

const styles = StyleSheet.create({
  formGrid: {
    gap: Spacing.three,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  recurrenceSection: {
    gap: Spacing.two,
  },
});
