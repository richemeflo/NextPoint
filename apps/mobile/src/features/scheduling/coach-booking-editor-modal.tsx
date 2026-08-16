import {
  getSchedulingDateKey,
  getSchedulingTime,
  schedulingLocalDateTimeToIso,
} from '@nextpoint/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { Booking } from '@/features/bookings/booking-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { SchedulingModal } from '@/features/scheduling/scheduling-modal';
import { useTranslation } from '@/i18n';

export type CoachBookingEditInput = {
  bookingId: string;
  durationMinutes: 60 | 90;
  location: 'Les Bruyères Centre Sportif';
  startsAt: string;
};

export function CoachBookingEditorModal({
  booking,
  formatTime,
  onClose,
  onSubmit,
  pending,
  studentName,
}: {
  booking: Booking;
  formatTime: (value: string) => string;
  onClose: () => void;
  onSubmit: (input: CoachBookingEditInput) => Promise<boolean>;
  pending: boolean;
  studentName: string;
}) {
  const { t } = useTranslation();
  const startsAt = new Date(booking.startsAt);
  const [date, setDate] = useState(() => getSchedulingDateKey(startsAt));
  const [time, setTime] = useState(() => getSchedulingTime(startsAt));
  const [duration, setDuration] = useState<'60' | '90'>(() =>
    String(booking.durationMinutes) as '60' | '90'
  );

  const submit = async () => {
    const updatedStartsAt = schedulingLocalDateTimeToIso(date, time);
    if (!updatedStartsAt) return;

    if (
      await onSubmit({
        bookingId: booking.id,
        startsAt: updatedStartsAt,
        durationMinutes: Number(duration) as 60 | 90,
        location: booking.location as 'Les Bruyères Centre Sportif',
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
      <View style={styles.modalActions}>
        <Button
          disabled={pending}
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
});
