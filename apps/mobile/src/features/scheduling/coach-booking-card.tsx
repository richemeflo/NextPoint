import {
  getSchedulingDateLabelInstant,
  schedulingTimeZone,
} from '@nextpoint/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { Booking } from '@/features/bookings/booking-service';
import { useBookingPresentation } from '@/features/bookings/use-booking-presentation';
import { getSlotDateKey } from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export function CoachBookingCard({
  booking,
  linked,
  onApprove,
  onCancel,
  onEdit,
  onRefuse,
  participantNames,
  pending,
  studentName,
}: {
  booking: Booking;
  linked: boolean;
  onApprove: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onEdit: (booking: Booking) => void;
  onRefuse: (bookingId: string, comment: string) => void;
  participantNames: string | null;
  pending: boolean;
  studentName: string;
}) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [refusalComment, setRefusalComment] = useState('');
  const {
    bookingStatusKey,
    bookingStatusThemeColor,
    formatBookingPrice,
    getBookingStatusStyle,
  } = useBookingPresentation(locale);
  const price = formatBookingPrice(booking);
  const formatDay = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      timeZone: schedulingTimeZone,
    }).format(getSchedulingDateLabelInstant(value) ?? new Date(value));
  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  return (
    <Card
      style={[
        styles.bookingCard,
        getBookingStatusStyle(booking.status),
        linked
          ? {
              backgroundColor: theme.backgroundSelected,
              borderColor: theme.primary,
            }
          : null,
      ]}>
      <ThemedText type="smallBold">{studentName}</ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('studentAgenda.slotDetail', {
          date: formatDay(getSlotDateKey(booking.startsAt)),
          duration: t(
            `availability.duration.${booking.durationMinutes}` as TranslationKey
          ),
          location: booking.location,
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('planning.slotTime', {
          start: formatTime(booking.startsAt),
          end: formatTime(booking.endsAt),
        })}
      </ThemedText>
      {price ? (
        <ThemedText type="small" themeColor="textMuted">
          {t('booking.priceLabel', { price })}
        </ThemedText>
      ) : null}
      <ThemedText
        type="smallBold"
        themeColor={bookingStatusThemeColor(booking.status)}>
        {t(bookingStatusKey(booking.status))}
      </ThemedText>
      {booking.expiresAt && booking.status === 'pending' ? (
        <ThemedText type="small" themeColor="textMuted">
          {t('booking.expiresAt', {
            date: formatDay(getSlotDateKey(booking.expiresAt)),
          })}
        </ThemedText>
      ) : null}
      {booking.studentComment ? (
        <ThemedText type="small" themeColor="textMuted">
          {booking.studentComment}
        </ThemedText>
      ) : null}
      {participantNames ? (
        <ThemedText type="small" themeColor="textMuted">
          {t('booking.participantNames', { names: participantNames })}
        </ThemedText>
      ) : null}

      {booking.status === 'pending' ? (
        <View style={styles.bookingActions}>
          <Button
            disabled={pending}
            label={t('booking.approveAction')}
            onPress={() => onApprove(booking.id)}
          />
          <TextField
            label={t('booking.refusalCommentLabel')}
            onChangeText={setRefusalComment}
            placeholder={t('booking.refusalCommentPlaceholder')}
            value={refusalComment}
          />
          <Button
            disabled={pending}
            label={t('booking.refuseAction')}
            onPress={() => onRefuse(booking.id, refusalComment)}
            variant="secondary"
          />
        </View>
      ) : null}

      {booking.status === 'confirmed' || booking.status === 'modified' ? (
        <View style={styles.bookingActions}>
          <Button
            disabled={pending}
            label={t('booking.modifyAction')}
            onPress={() => onEdit(booking)}
            variant="secondary"
          />
          <Button
            disabled={pending}
            label={t('booking.cancelLessonAction')}
            onPress={() => onCancel(booking.id)}
            variant="secondary"
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  bookingCard: {
    minWidth: 260,
    flex: 1,
    gap: Spacing.two,
  },
  bookingActions: {
    gap: Spacing.two,
  },
});
