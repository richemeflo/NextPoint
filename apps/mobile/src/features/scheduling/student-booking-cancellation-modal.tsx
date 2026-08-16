import {
  bookingCancellationMessageMaxLength,
  studentCancelBookingSchema,
} from '@nextpoint/shared';

import type { ReactNode } from 'react';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  cancelBooking,
  type Booking,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from '@/features/bookings/booking-mutation-lock';
import { SchedulingModal } from '@/features/scheduling/scheduling-modal';
import { useTranslation, type TranslationKey } from '@/i18n';

const errorCopy: Record<
  BookingMutationError,
  [TranslationKey, TranslationKey]
> = {
  unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
  slot_unavailable: ['booking.errorTitle', 'booking.slotUnavailable'],
  pending_limit_reached: ['booking.errorTitle', 'booking.pendingLimit'],
  student_pending_limit_reached: [
    'booking.errorTitle',
    'booking.studentPendingLimit',
  ],
  student_schedule_conflict: [
    'booking.errorTitle',
    'booking.studentScheduleConflict',
  ],
  already_processed: ['booking.errorTitle', 'booking.alreadyProcessed'],
  past_booking: ['booking.errorTitle', 'booking.pastBooking'],
  invalid_participants: ['booking.errorTitle', 'booking.invalidParticipants'],
  invalid_input: ['booking.errorTitle', 'booking.invalidInput'],
  pricing_rate_missing: ['booking.errorTitle', 'booking.pricingMissing'],
  not_found: ['booking.errorTitle', 'booking.unknownError'],
  unknown: ['booking.errorTitle', 'booking.unknownError'],
};

type StudentBookingCancellationModalProps = {
  booking: Booking;
  bookingSummary: ReactNode;
  onClose: () => void;
  onSuccess: (booking: Booking) => Promise<void> | void;
};

export function StudentBookingCancellationModal({
  booking,
  bookingSummary,
  onClose,
  onSuccess,
}: StudentBookingCancellationModalProps) {
  const { t } = useTranslation();
  const mutationLock = useRef(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<BookingMutationError | null>(null);
  const [pending, setPending] = useState(false);
  const normalizedMessage = message.trim();
  const messageLength = Array.from(normalizedMessage).length;
  const messageError =
    messageLength === 0
      ? t('booking.cancellationMessageRequired')
      : messageLength > bookingCancellationMessageMaxLength
        ? t('booking.cancellationMessageTooLong')
        : undefined;

  const submit = async () => {
    if (!acquireBookingMutationLock(mutationLock)) return;

    const parsedInput = studentCancelBookingSchema.safeParse({
      bookingId: booking.id,
      cancellationMessage: message,
    });
    if (!parsedInput.success) {
      releaseBookingMutationLock(mutationLock);
      return;
    }

    setError(null);
    setPending(true);
    try {
      const result = await cancelBooking(
        parsedInput.data.bookingId,
        parsedInput.data.cancellationMessage
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }

      await onSuccess(result.data);
    } catch {
      setError('unknown');
    } finally {
      releaseBookingMutationLock(mutationLock);
      setPending(false);
    }
  };

  return (
    <SchedulingModal
      closeLabel={t('booking.cancellationCloseAction')}
      onClose={onClose}
      pending={pending}
      subtitle={
        <ThemedText type="small" themeColor="textMuted">
          {t('booking.cancellationBody')}
        </ThemedText>
      }
      title={t('booking.cancellationTitle')}
      visible>
      {bookingSummary}
      <TextField
        error={message.length > 0 ? messageError : undefined}
        label={t('booking.cancellationMessageLabel')}
        multiline
        numberOfLines={4}
        onChangeText={(value) => {
          setMessage(value);
          setError(null);
        }}
        placeholder={t('booking.cancellationMessagePlaceholder')}
        style={styles.cancellationInput}
        textAlignVertical="top"
        value={message}
      />
      <ThemedText type="small" themeColor="textMuted">
        {t('booking.cancellationMessageCount', {
          count: messageLength,
          max: bookingCancellationMessageMaxLength,
        })}
      </ThemedText>
      {error ? (
        <Feedback
          message={t(errorCopy[error][1])}
          title={t(errorCopy[error][0])}
          tone="error"
        />
      ) : null}
      <View style={styles.actions}>
        <Button
          disabled={!!messageError || pending}
          label={
            pending
              ? t('booking.cancellationSubmitting')
              : t('booking.cancellationConfirmAction')
          }
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  cancellationInput: {
    minHeight: 112,
    paddingTop: Spacing.three,
  },
});
