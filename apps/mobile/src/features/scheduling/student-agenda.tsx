import {
  canCancelBooking,
  getSchedulingDateLabelInstant,
  getSchedulingToday,
  schedulingTimeZone,
} from '@nextpoint/shared';

import { useCallback, useMemo, useState, type RefObject } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import {
  getEarliestBookingRequestStartsAt,
  getBookingRequestProposal,
} from '@/features/scheduling/booking-request-time';
import {
  type Booking,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import { useBookingPresentation } from '@/features/bookings/use-booking-presentation';
import {
  filterStudentBookings,
  type StudentBookingStatusFilter,
} from '@/features/bookings/student-booking-filter';
import {
  canAddBookingToGoogleCalendar,
} from '@/features/bookings/google-calendar';
import { openBookingInGoogleCalendar } from '@/features/bookings/google-calendar-link';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import { PlanningControls } from '@/features/scheduling/planning-controls';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { StudentAvailabilityCalendar } from '@/features/scheduling/student-availability-calendar';
import {
  getStudentAvailabilityMonth,
  isSameStudentAvailabilityMonth,
  moveStudentAvailabilityMonth,
} from '@/features/scheduling/student-availability-month';
import {
  getSlotDateKey,
  isStudentBookingDateSelectable,
} from '@/features/scheduling/planning-window';
import { StudentBookingCancellationModal } from '@/features/scheduling/student-booking-cancellation-modal';
import { StudentBookingRequestModal } from '@/features/scheduling/student-booking-request-modal';
import { StudentNextLessonCard } from '@/features/scheduling/student-next-lesson-card';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';
import { useStudentAgendaData } from '@/features/scheduling/use-student-agenda-data';
import { useStudentAgendaItems } from '@/features/scheduling/use-student-agenda-items';
import { usePlanningView } from '@/features/scheduling/use-planning-view';

function canStudentCancel(booking: Booking) {
  return canCancelBooking(
    { status: booking.status, startsAt: booking.startsAt },
    'student'
  ).ok;
}

type StudentAgendaProps = {
  availabilityAgendaRef?: RefObject<View | null>;
  initialAnchorDate?: string;
  onAvailabilityDateSelected?: () => void;
  surface?: 'requestable' | 'bookings';
};

function getCurrentTimestamp() {
  return Date.now();
}

export function StudentAgenda({
  availabilityAgendaRef,
  initialAnchorDate,
  onAvailabilityDateSelected,
  surface = 'requestable',
}: StudentAgendaProps) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
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
    setAnchorDate,
    setDisplayMode,
    setMode,
    window,
  } = usePlanningView(initialAnchorDate);
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
  const [calendarError, setCalendarError] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] =
    useState<StudentBookingStatusFilter>('all');
  const showRequestableSlots = surface === 'requestable';
  const showBookingSchedule = surface === 'bookings';
  const currentDate = getSchedulingToday();
  const [availabilityMonthAnchor, setAvailabilityMonthAnchor] = useState(
    () => currentDate
  );
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState<
    string | null
  >(null);
  const availabilityMonth = useMemo(
    () => getStudentAvailabilityMonth(availabilityMonthAnchor),
    [availabilityMonthAnchor]
  );
  const queryStartsAt = showRequestableSlots
    ? availabilityMonth.startsAt
    : window.startsAt;
  const queryEndsAt = showRequestableSlots
    ? availabilityMonth.endsAt
    : window.endsAt;

  const {
    agendaLoadedAt,
    bookings,
    isRefreshing,
    loadAgenda,
    loadState,
    pricingRates,
    slots,
    updateBookings,
  } = useStudentAgendaData({
    includeRequestableSlots: showRequestableSlots,
    startsAt: queryStartsAt,
    endsAt: queryEndsAt,
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
    selectedSlot,
    studentScheduleOccupations,
    visibleBookings,
    windowBookings,
  } = useStudentAgendaItems({
    agendaLoadedAt,
    bookings,
    endsAt: queryEndsAt,
    selectedSlotId: requestSelection?.slotId ?? null,
    slots: requestableSlots,
    startsAt: queryStartsAt,
  });
  const availableDates = useMemo(
    () =>
      [
        ...new Set(
          requestableSlots
            .map((slot) => getSlotDateKey(slot.startsAt))
            .filter(
              (date) =>
                date >= availabilityMonth.startDate &&
                date <= availabilityMonth.endDate &&
                isStudentBookingDateSelectable(date, currentDate)
            )
        ),
      ].sort(),
    [
      availabilityMonth.endDate,
      availabilityMonth.startDate,
      currentDate,
      requestableSlots,
    ]
  );

  const displayedAvailabilityDate = useMemo(() => {
    if (!showRequestableSlots || loadState !== 'ready') {
      return selectedAvailabilityDate;
    }
    if (
      selectedAvailabilityDate &&
      availableDates.includes(selectedAvailabilityDate)
    ) {
      return selectedAvailabilityDate;
    }
    if (availableDates.includes(currentDate)) return currentDate;
    return availableDates[0] ?? null;
  }, [
    availableDates,
    currentDate,
    loadState,
    selectedAvailabilityDate,
    showRequestableSlots,
  ]);
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
  const filteredVisibleBookings = useMemo(
    () => filterStudentBookings(visibleBookings, bookingStatusFilter),
    [bookingStatusFilter, visibleBookings]
  );
  const bookingStatusOptions: {
    value: StudentBookingStatusFilter;
    label: string;
  }[] = [
    { value: 'all', label: t('booking.studentFilter.all') },
    { value: 'pending', label: t('status.pending') },
    { value: 'confirmed', label: t('status.confirmed') },
    { value: 'refused', label: t('status.refused') },
    { value: 'cancelled', label: t('status.cancelled') },
    { value: 'expired', label: t('status.expired') },
  ];

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
    if (
      !isStudentBookingDateSelectable(
        getSlotDateKey(slot.startsAt),
        currentDate
      )
    ) {
      return;
    }

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

  const addToCalendar = async (booking: Booking) => {
    setCalendarError(false);
    const opened = await openBookingInGoogleCalendar(booking, {
      title: t('booking.calendarEventTitle'),
      details: t('booking.calendarEventDetails', {
        lessonType: t(`pricing.type.${booking.lessonType}` as TranslationKey),
        duration: t(`availability.duration.${booking.durationMinutes}` as TranslationKey),
      }),
    });
    if (!opened) setCalendarError(true);
  };

  const viewBookingInAgenda = (booking: Booking) => {
    setAnchorDate(getSlotDateKey(booking.startsAt));
    setDisplayMode('agenda');
  };

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
      {canAddBookingToGoogleCalendar(booking) ? (
        <Button
          label={t('booking.addToGoogleCalendar')}
          onPress={() => void addToCalendar(booking)}
          variant="secondary"
        />
      ) : null}
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

  if (loadState === 'loading' && agendaLoadedAt === null) {
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
      {showBookingSchedule ? (
        <StudentNextLessonCard
          onViewInAgenda={viewBookingInAgenda}
          refreshKey={agendaLoadedAt}
        />
      ) : null}
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="subtitle">
            {t(
              surface === 'bookings'
                ? 'booking.studentListTitle'
                : 'studentAgenda.title'
            )}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t(
              surface === 'bookings'
                ? 'booking.studentListBody'
                : 'studentAgenda.body'
            )}
          </ThemedText>
        </View>
        {isRefreshing ? (
          <ThemedText type="small" themeColor="textMuted">
            {t('planning.refreshing')}
          </ThemedText>
        ) : null}
      </View>

      {showBookingSchedule ? (
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
      {calendarError ? (
        <Feedback
          title={t('booking.errorTitle')}
          message={t('booking.calendarOpenError')}
          tone="error"
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
          pricingRates={pricingRates}
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

      {showRequestableSlots ? (
        <StudentAvailabilityCalendar
          currentDate={currentDate}
          dayAgendaRef={availabilityAgendaRef}
          disablePreviousMonth={
            isSameStudentAvailabilityMonth(
              availabilityMonth.startDate,
              currentDate
            )
          }
          formatTime={formatTime}
          month={availabilityMonth}
          onMoveMonth={(direction) => {
            setSelectedAvailabilityDate(null);
            setAvailabilityMonthAnchor((current) =>
              moveStudentAvailabilityMonth(current, direction)
            );
          }}
          onRequestDayAgendaFocus={onAvailabilityDateSelected}
          onSelectDate={(date) => {
            if (isStudentBookingDateSelectable(date, currentDate)) {
              setSelectedAvailabilityDate(date);
            }
          }}
          onSelectSlot={openRequest}
          onToday={() => {
            setSelectedAvailabilityDate(null);
            setAvailabilityMonthAnchor(currentDate);
          }}
          selectedDate={displayedAvailabilityDate}
          slots={requestableSlots}
        />
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
          <ProfileOptionSelector
            label={t('booking.studentFilter.label')}
            onChange={setBookingStatusFilter}
            options={bookingStatusOptions}
            value={bookingStatusFilter}
          />
          {filteredVisibleBookings.length === 0 ? (
            <Feedback
              title={t(
                bookingStatusFilter === 'all'
                  ? 'booking.studentEmptyTitle'
                  : 'booking.studentFilter.emptyTitle'
              )}
              message={t(
                bookingStatusFilter === 'all'
                  ? 'booking.studentEmptyBody'
                  : 'booking.studentFilter.emptyBody'
              )}
              tone="info"
            />
          ) : (
            <View style={styles.slotGrid}>
              {filteredVisibleBookings.map((booking) =>
                renderBookingCard(booking)
              )}
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
