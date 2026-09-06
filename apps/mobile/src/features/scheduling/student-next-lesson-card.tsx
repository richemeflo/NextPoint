import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { schedulingTimeZone } from '@nextpoint/shared';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { Spacing } from '@/constants/theme';
import {
  getStudentNextBooking,
  type Booking,
} from '@/features/bookings/booking-service';
import { openBookingInGoogleCalendar } from '@/features/bookings/google-calendar-link';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; booking: Booking | null };

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

export function StudentNextLessonCard({
  onViewInAgenda,
  refreshKey,
}: {
  onViewInAgenda: (booking: Booking) => void;
  refreshKey: number | null;
}) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [calendarError, setCalendarError] = useState(false);

  useEffect(() => {
    let active = true;

    void getStudentNextBooking()
      .then((result) => {
        if (!active) return;
        setState(
          result.ok
            ? { status: 'ready', booking: result.data }
            : { status: 'error' }
        );
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  if (state.status === 'loading') {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator color={theme.primary} />
        <ThemedText type="small" themeColor="textMuted">
          {t('booking.nextLessonLoading')}
        </ThemedText>
      </Card>
    );
  }

  if (state.status === 'error') {
    return (
      <Feedback
        title={t('booking.nextLessonErrorTitle')}
        message={t('booking.nextLessonErrorBody')}
        tone="error"
      />
    );
  }

  if (!state.booking) {
    return (
      <Feedback
        title={t('booking.nextLessonTitle')}
        message={t('booking.nextLessonEmpty')}
        tone="info"
      />
    );
  }

  const { booking } = state;
  const date = new Intl.DateTimeFormat(locale, {
    weekday: compact ? 'short' : 'long',
    day: 'numeric',
    month: compact ? 'short' : 'long',
    year: compact ? undefined : 'numeric',
    timeZone: schedulingTimeZone,
  }).format(new Date(booking.startsAt));
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: schedulingTimeZone,
  });
  const partners = booking.participants
    .filter(({ studentId }) => studentId !== booking.studentId)
    .map(({ fullName }) => fullName ?? t('booking.unknownStudent'));
  const lessonType = t(
    `pricing.type.${booking.lessonType}` as TranslationKey
  );
  const time = t('planning.slotTime', {
    start: timeFormatter.format(new Date(booking.startsAt)),
    end: timeFormatter.format(new Date(booking.endsAt)),
  });

  const addToCalendar = async () => {
    setCalendarError(false);
    const opened = await openBookingInGoogleCalendar(booking, {
      title: t('booking.calendarEventTitle'),
      details: t('booking.calendarEventDetails', {
        lessonType,
        duration: t(
          `availability.duration.${booking.durationMinutes}` as TranslationKey
        ),
      }),
    });
    if (!opened) setCalendarError(true);
  };

  return (
    <Card elevated style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <ThemedText type={compact ? 'smallBold' : 'subtitle'}>
          {t('booking.nextLessonTitle')}
        </ThemedText>
        <StatusBadge status={booking.status} />
      </View>
      {compact ? (
        <View style={styles.compactSummary}>
          <ThemedText style={styles.compactDate} type="subtitle">
            {t('booking.nextLessonSummary', { date, time })}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t('booking.nextLessonMeta', {
              location: booking.location,
              lessonType,
            })}
          </ThemedText>
          {booking.lessonType !== 'individual' && partners.length > 0 ? (
            <ThemedText type="small" themeColor="textMuted">
              {t(
                partners.length === 1
                  ? 'booking.nextLessonPartnerValue'
                  : 'booking.nextLessonPartnersValue',
                { names: partners.join(', ') }
              )}
            </ThemedText>
          ) : null}
        </View>
      ) : (
        <View style={styles.details}>
          <Detail label={t('booking.nextLessonDate')} value={date} />
          <Detail label={t('booking.nextLessonTime')} value={time} />
          <Detail
            label={t('booking.nextLessonLocation')}
            value={booking.location}
          />
          <Detail
            label={t('booking.nextLessonType')}
            value={lessonType}
          />
          {booking.lessonType !== 'individual' && partners.length > 0 ? (
            <Detail
              label={t(
                partners.length === 1
                  ? 'booking.nextLessonPartner'
                  : 'booking.nextLessonPartners'
              )}
              value={partners.join(', ')}
            />
          ) : null}
        </View>
      )}
      <View style={styles.actions}>
        <Button
          label={
            compact
              ? t('booking.addToGoogleCalendarCompact')
              : t('booking.addToGoogleCalendar')
          }
          onPress={() => void addToCalendar()}
          style={styles.action}
          variant="secondary"
        />
        <Button
          label={t('booking.nextLessonViewInAgenda')}
          onPress={() => onViewInAgenda(booking)}
          style={styles.action}
        />
      </View>
      {calendarError ? (
        <ThemedText type="small" themeColor="error">
          {t('booking.calendarOpenError')}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  cardCompact: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  compactSummary: {
    gap: Spacing.one,
  },
  compactDate: {
    textTransform: 'capitalize',
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  detail: {
    flexBasis: 180,
    flexGrow: 1,
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
  loadingCard: {
    minHeight: 96,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
});
