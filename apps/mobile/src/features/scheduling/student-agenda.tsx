import {
  canCancelBooking,
  getSchedulingDateLabelInstant,
  schedulingTimeZone,
} from '@nextpoint/shared';

import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  getEarliestBookingRequestStartsAt,
  getBookingRequestProposal,
} from '@/features/scheduling/booking-request-time';
import {
  type Booking,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import { useBookingPresentation } from '@/features/bookings/use-booking-presentation';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import { PlanningControls } from '@/features/scheduling/planning-controls';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { getSlotDateKey } from '@/features/scheduling/planning-window';
import { StudentBookingCancellationModal } from '@/features/scheduling/student-booking-cancellation-modal';
import { StudentBookingRequestModal } from '@/features/scheduling/student-booking-request-modal';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';
import { useStudentAgendaData } from '@/features/scheduling/use-student-agenda-data';
import {
  useStudentAgendaItems,
  type StudentHomeAgendaItem,
} from '@/features/scheduling/use-student-agenda-items';
import { usePlanningView } from '@/features/scheduling/use-planning-view';

function canStudentCancel(booking: Booking) {
  return canCancelBooking(
    { status: booking.status, startsAt: booking.startsAt },
    'student'
  ).ok;
}

type StudentAgendaProps = {
  surface?: 'requestable' | 'bookings';
};

function getCurrentTimestamp() {
  return Date.now();
}

export function StudentAgenda({ surface = 'requestable' }: StudentAgendaProps) {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const {
    bookingStatusKey,
    bookingStatusThemeColor,
    formatBookingPrice,
    getBookingStatusStyle,
  } = useBookingPresentation(locale);
  const {
    displayMode,
    goToToday,
    mode,
    move,
    setDisplayMode,
    setMode,
    window,
  } = usePlanningView();
  const [requestSelection, setRequestSelection] = useState<{
    slotId: string;
    startsAt: string;
  } | null>(null);
  const [cancellationBookingId, setCancellationBookingId] = useState<
    string | null
  >(null);
  const [feedback, setFeedback] = useState<
    'none' | 'requested' | 'cancelled' | BookingMutationError
  >('none');
  const showRequestableSlots = surface === 'requestable';
  const showBookingSchedule = surface === 'bookings';

  const {
    agendaLoadedAt,
    bookings,
    isRefreshing,
    loadAgenda,
    loadState,
    participants,
    pricingRates,
    slots,
    updateBookings,
  } = useStudentAgendaData({
    includeRequestableSlots: showRequestableSlots,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
  });

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

  const requestableSlots = slots;
  const {
    bookingsByDay,
    homeAgendaItems,
    homeItemsByDay,
    selectedSlot,
    studentScheduleOccupations,
    visibleBookings,
    windowBookings,
  } = useStudentAgendaItems({
    agendaLoadedAt,
    bookings,
    endsAt: window.endsAt,
    selectedSlotId: requestSelection?.slotId ?? null,
    slots: requestableSlots,
    startsAt: window.startsAt,
  });
  const getRequestProposalForSlot = useCallback(
    (slot: AvailabilitySlot, startsAt: string) => {
      const earliestStartsAt = getEarliestBookingRequestStartsAt();
      const desiredStartsAt = Math.max(
        new Date(startsAt).getTime(),
        earliestStartsAt
      );
      const occurrenceStartsAt = Math.max(
        new Date(slot.occurrenceStartsAt).getTime(),
        earliestStartsAt
      );

      return getBookingRequestProposal(
        {
          startsAt: new Date(occurrenceStartsAt).toISOString(),
          endsAt: slot.occurrenceEndsAt,
          occupations: [...slot.occupations, ...studentScheduleOccupations],
        },
        new Date(desiredStartsAt).toISOString()
      );
    },
    [studentScheduleOccupations]
  );
  const selectedCancellationBooking = useMemo(
    () =>
      bookings.find((booking) => booking.id === cancellationBookingId) ?? null,
    [bookings, cancellationBookingId]
  );

  const feedbackCopy: Partial<
    Record<typeof feedback, [TranslationKey, TranslationKey]>
  > = {
    requested: ['booking.requestSuccessTitle', 'booking.requestSuccessBody'],
    cancelled: [
      'booking.studentCancelSuccessTitle',
      'booking.studentCancelSuccessBody',
    ],
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
    unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
    not_found: ['booking.errorTitle', 'booking.unknownError'],
    unknown: ['booking.errorTitle', 'booking.unknownError'],
  };

  const openRequest = (slot: AvailabilitySlot, startsAt = slot.startsAt) => {
    const proposal = getRequestProposalForSlot(slot, startsAt);
    if (!proposal.startsAt) {
      setFeedback(
        new Date(slot.endsAt).getTime() <= getCurrentTimestamp()
          ? 'past_booking'
          : 'slot_unavailable'
      );
      return;
    }
    setRequestSelection({ slotId: slot.id, startsAt: proposal.startsAt });
    setFeedback('none');
  };

  const openCancellation = (booking: Booking) => {
    if (!canStudentCancel(booking)) return;

    setCancellationBookingId(booking.id);
    setFeedback('none');
  };

  const renderSlotContent = (slot: AvailabilitySlot) => (
    <>
      <ThemedText type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('studentAgenda.slotDetail', {
          date: formatDay(getSlotDateKey(slot.startsAt)),
          duration: t('availability.continuousRange'),
          location: slot.location,
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
    </>
  );

  const renderAgendaSlotContent = (slot: AvailabilitySlot) => (
    <View style={styles.agendaSlotPressable}>
      <ThemedText numberOfLines={1} type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText numberOfLines={2} type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
    </View>
  );

  const renderBookingContent = (booking: Booking, includeDate = true) => {
    const price = formatBookingPrice(booking);

    return (
      <>
        <ThemedText type="smallBold">
          {t('planning.slotTime', {
            start: formatTime(booking.startsAt),
            end: formatTime(booking.endsAt),
          })}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {includeDate
            ? t('studentAgenda.slotDetail', {
                date: formatDay(getSlotDateKey(booking.startsAt)),
                duration: t(
                  `availability.duration.${booking.durationMinutes}` as TranslationKey
                ),
                location: booking.location,
              })
            : t('planning.slotMeta', {
                duration: t(
                  `availability.duration.${booking.durationMinutes}` as TranslationKey
                ),
                location: booking.location,
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
        {booking.coachRefusalComment ? (
          <ThemedText type="small" themeColor="textMuted">
            {booking.coachRefusalComment}
          </ThemedText>
        ) : null}
      </>
    );
  };

  const renderBookingCard = (booking: Booking) => (
    <Card
      key={booking.id}
      style={[styles.bookingCard, getBookingStatusStyle(booking.status)]}>
      {renderBookingContent(booking)}
      {canStudentCancel(booking) ? (
        <Button
          label={t('booking.cancelAction')}
          onPress={() => openCancellation(booking)}
          variant="secondary"
        />
      ) : null}
    </Card>
  );

  const getBookingAgendaStatus = (booking: Booking) => {
    const status = t(bookingStatusKey(booking.status));

    if (booking.status === 'confirmed' || booking.status === 'modified') {
      return `${status} · ${booking.location}`;
    }

    if (booking.status === 'refused' && booking.coachRefusalComment) {
      return `${status} · ${booking.coachRefusalComment}`;
    }

    return status;
  };

  const renderBookingAgendaContent = (booking: Booking) => {
    const canUseTwoStatusLines = booking.durationMinutes >= 90;
    const content = (
      <>
        <ThemedText numberOfLines={1} type="smallBold">
          {t('planning.slotTime', {
            start: formatTime(booking.startsAt),
            end: formatTime(booking.endsAt),
          })}
        </ThemedText>
        <ThemedText
          numberOfLines={canUseTwoStatusLines ? 2 : 1}
          type="smallBold"
          themeColor={bookingStatusThemeColor(booking.status)}>
          {getBookingAgendaStatus(booking)}
        </ThemedText>
      </>
    );

    return canStudentCancel(booking) ? (
      <Pressable
        accessibilityLabel={t('booking.cancelAction')}
        accessibilityRole="button"
        onPress={() => openCancellation(booking)}
        style={styles.agendaBookingPressable}>
        {content}
      </Pressable>
    ) : (
      content
    );
  };

  const renderHomeAgendaItem = (item: StudentHomeAgendaItem) =>
    item.kind === 'slot'
      ? renderAgendaSlotContent(item.slot)
      : renderBookingAgendaContent(item.booking);

  const getHomeAgendaItemStyle = (item: StudentHomeAgendaItem) =>
    item.kind === 'booking'
      ? getBookingStatusStyle(item.booking.status)
      : {
          backgroundColor: theme.backgroundSelected,
          borderColor: theme.secondary,
          borderLeftWidth: 5,
        };

  const renderHomeListItem = (item: StudentHomeAgendaItem) =>
    item.kind === 'booking' ? (
      renderBookingCard(item.booking)
    ) : (
      <Pressable key={item.id} onPress={() => openRequest(item.slot)}>
        <Card style={styles.slotCard}>{renderSlotContent(item.slot)}</Card>
      </Pressable>
    );

  if (loadState === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} size="small" />
        <ThemedText type="small" themeColor="textMuted">
          {t('studentAgenda.loading')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="subtitle">
            {t(
              surface === 'bookings'
                ? 'booking.studentListTitle'
                : 'studentAgenda.title'
            )}
          </ThemedText>
          {isMobile && surface === 'requestable' ? null : (
            <ThemedText type="small" themeColor="textMuted">
              {t(
                surface === 'bookings'
                  ? 'booking.studentListBody'
                  : 'studentAgenda.body'
              )}
            </ThemedText>
          )}
        </View>
        {isRefreshing ? (
          <ThemedText type="small" themeColor="textMuted">
            {t('planning.refreshing')}
          </ThemedText>
        ) : null}
      </View>

      {showRequestableSlots || showBookingSchedule ? (
        <PlanningControls
          displayMode={displayMode}
          mode={mode}
          onDisplayModeChange={setDisplayMode}
          onModeChange={setMode}
          onMove={move}
          onToday={goToToday}
        />
      ) : null}

      {loadState === 'error' ? (
        <View style={styles.loadError}>
          <Feedback
            message={t('studentAgenda.loadErrorBody')}
            title={t('studentAgenda.loadErrorTitle')}
            tone="error"
          />
          <Button
            disabled={isRefreshing}
            label={
              isRefreshing
                ? t('planning.refreshing')
                : t('studentAgenda.retryAction')
            }
            onPress={() => void loadAgenda()}
            variant="secondary"
          />
        </View>
      ) : null}

      {feedback !== 'none' && feedbackCopy[feedback] ? (
        <Feedback
          title={t(feedbackCopy[feedback][0])}
          message={t(feedbackCopy[feedback][1])}
          tone={
            feedback === 'requested' || feedback === 'cancelled'
              ? 'success'
              : 'error'
          }
        />
      ) : null}

      {selectedSlot && requestSelection ? (
        <StudentBookingRequestModal
          formatTime={formatTime}
          getRequestProposal={getRequestProposalForSlot}
          initialStartsAt={requestSelection.startsAt}
          key={`${selectedSlot.id}:${requestSelection.startsAt}`}
          onClose={() => setRequestSelection(null)}
          onError={setFeedback}
          onSuccess={async () => {
            setRequestSelection(null);
            setFeedback('requested');
            await loadAgenda();
          }}
          participants={participants}
          pricingRates={pricingRates}
          requesterId={user?.id}
          slot={selectedSlot}
        />
      ) : null}
      {selectedCancellationBooking ? (
        <StudentBookingCancellationModal
          booking={selectedCancellationBooking}
          bookingSummary={renderBookingContent(selectedCancellationBooking)}
          key={selectedCancellationBooking.id}
          onClose={() => setCancellationBookingId(null)}
          onSuccess={async (updatedBooking) => {
            updateBookings((current) =>
              current.map((booking) =>
                booking.id === updatedBooking.id ? updatedBooking : booking
              )
            );
            setCancellationBookingId(null);
            setFeedback('cancelled');
            await loadAgenda();
          }}
        />
      ) : null}

      {showRequestableSlots && displayMode === 'agenda' ? (
        <>
          <AgendaGrid
            days={window.days}
            formatDay={formatDay}
            getSlotStyle={getHomeAgendaItemStyle}
            renderSlot={renderHomeAgendaItem}
            selectionRoundingMinutes={30}
            slots={homeAgendaItems}
            isSlotPressable={(item) =>
              item.kind === 'slot' &&
              new Date(item.endsAt).getTime() > Date.now()
            }
            onSlotPress={(item, startsAt) => {
              if (item.kind === 'slot') openRequest(item.slot, startsAt);
            }}
          />
        </>
      ) : showRequestableSlots ? (
        <View style={styles.days}>
          {window.days.map((day) => {
            const dayItems = homeItemsByDay.get(day.date) ?? [];

            return (
              <View key={day.date} style={styles.daySection}>
                <ThemedText type="smallBold">{formatDay(day.date)}</ThemedText>
                {dayItems.length === 0 ? (
                  <Feedback
                    message={t('studentAgenda.emptyDayBody')}
                    title={t('studentAgenda.emptyDayTitle')}
                    tone="info"
                  />
                ) : (
                  <View style={styles.slotGrid}>
                    {dayItems.map((item) => renderHomeListItem(item))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : null}

      {showBookingSchedule ? (
        displayMode === 'agenda' ? (
          windowBookings.length === 0 ? (
            <Feedback
              title={t('booking.studentEmptyTitle')}
              message={t('booking.studentEmptyBody')}
              tone="info"
            />
          ) : (
            <AgendaGrid
              days={window.days}
              formatDay={formatDay}
              getSlotStyle={(booking) => getBookingStatusStyle(booking.status)}
              renderSlot={renderBookingAgendaContent}
              slots={windowBookings}
            />
          )
        ) : (
          <View style={styles.days}>
            {window.days.map((day) => {
              const dayBookings = bookingsByDay.get(day.date) ?? [];

              return (
                <View key={day.date} style={styles.daySection}>
                  <ThemedText type="smallBold">
                    {formatDay(day.date)}
                  </ThemedText>
                  {dayBookings.length === 0 ? (
                    <Feedback
                      title={t('booking.studentEmptyTitle')}
                      message={t('booking.studentEmptyBody')}
                      tone="info"
                    />
                  ) : (
                    <View style={styles.slotGrid}>
                      {dayBookings.map((booking) => renderBookingCard(booking))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )
      ) : (
        <View style={styles.days}>
          <ThemedText type="subtitle">
            {t('booking.studentListTitle')}
          </ThemedText>
          {visibleBookings.length === 0 ? (
            <Feedback
              title={t('booking.studentEmptyTitle')}
              message={t('booking.studentEmptyBody')}
              tone="info"
            />
          ) : (
            <View style={styles.slotGrid}>
              {visibleBookings.map((booking) => renderBookingCard(booking))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  loading: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  loadError: {
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  header: {
    gap: Spacing.one,
  },
  heading: {
    gap: Spacing.one,
  },
  days: {
    gap: Spacing.four,
  },
  daySection: {
    gap: Spacing.two,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  slotCard: {
    minHeight: 112,
    minWidth: 220,
    flex: 1,
    gap: Spacing.two,
  },
  agendaSlotPressable: {
    flex: 1,
    gap: Spacing.one,
  },
  bookingCard: {
    minWidth: 240,
    flex: 1,
    gap: Spacing.two,
  },
  agendaBookingPressable: {
    flex: 1,
    gap: Spacing.one,
  },
});
