import {
  getSchedulingDateKey,
  getSchedulingDateLabelInstant,
  getSchedulingToday,
  schedulingTimeZone,
} from '@nextpoint/shared';
import { useLocalSearchParams, type ErrorBoundaryProps } from 'expo-router';

import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppErrorFallback } from '@/components/app-error-fallback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  approveBooking,
  cancelBooking,
  cancelBookingRecurrences,
  createCoachBooking,
  modifyBooking,
  refuseBooking,
  type Booking,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from '@/features/bookings/booking-mutation-lock';
import { useBookingPresentation } from '@/features/bookings/use-booking-presentation';
import { ProfileMultiOptionSelector } from '@/features/profiles/profile-option-selector';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import { CoachBookingCard } from '@/features/scheduling/coach-booking-card';
import {
  CoachBookingCreateSection,
  type CoachBookingCreateInput,
} from '@/features/scheduling/coach-booking-create-section';
import {
  CoachBookingEditorModal,
  type CoachBookingRecurrenceCancellationInput,
  type CoachBookingEditInput,
} from '@/features/scheduling/coach-booking-editor-modal';
import { PlanningControls } from '@/features/scheduling/planning-controls';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';
import { useCoachPlanningData } from '@/features/scheduling/use-coach-planning-data';
import {
  useCoachPlanningItems,
  type CoachPlanningItem,
} from '@/features/scheduling/use-coach-planning-items';
import { usePlanningView } from '@/features/scheduling/use-planning-view';

const today = () => getSchedulingToday();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} retry={retry} scope="planning" />;
}

function getLinkedAnchorDate(value: string | undefined) {
  if (!value) return today();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? today() : getSchedulingDateKey(date);
}

export default function CoachPlanningScreen() {
  const { bookingId: linkedBookingId, startsAt: linkedStartsAt } =
    useLocalSearchParams<{ bookingId?: string; startsAt?: string }>();
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const {
    bookingStatusKey,
    bookingStatusThemeColor,
    getBookingStatusStyle,
  } = useBookingPresentation(locale);
  const [showAvailability, setShowAvailability] = useState(true);
  const [showConfirmedLessons, setShowConfirmedLessons] = useState(true);
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const {
    displayMode,
    goToToday,
    mode,
    move,
    setDisplayMode,
    setMode,
    window,
  } = usePlanningView(getLinkedAnchorDate(linkedStartsAt));
  const [feedback, setFeedback] = useState<
    | 'none'
    | 'approved'
    | 'refused'
    | 'created'
    | 'cancelled'
    | 'recurrencesCancelled'
    | 'modified'
    | BookingMutationError
  >('none');
  const [feedbackSurface, setFeedbackSurface] = useState<
    'planning' | 'creation'
  >('planning');
  const bookingMutationLock = useRef(false);
  const [isBookingMutationPending, setIsBookingMutationPending] =
    useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

  const {
    bookings,
    isRefreshing,
    loadPlanning,
    loadState,
    pricingRates,
    slots,
    students,
  } = useCoachPlanningData({
    coachId: user?.id,
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

  const formatRange = () =>
    mode === 'day'
      ? formatDay(window.startDate)
      : t('planning.weekRange', {
          start: formatDay(window.startDate),
          end: formatDay(window.endDate),
        });

  const feedbackCopy: Partial<
    Record<typeof feedback, [TranslationKey, TranslationKey]>
  > = {
    approved: ['booking.approveSuccessTitle', 'booking.approveSuccessBody'],
    refused: ['booking.refuseSuccessTitle', 'booking.refuseSuccessBody'],
    created: ['booking.createSuccessTitle', 'booking.createSuccessBody'],
    cancelled: ['booking.cancelSuccessTitle', 'booking.cancelSuccessBody'],
    recurrencesCancelled: [
      'booking.recurrenceCancelSuccessTitle',
      'booking.recurrenceCancelSuccessBody',
    ],
    modified: ['booking.modifySuccessTitle', 'booking.modifySuccessBody'],
    unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
    slot_unavailable: ['booking.errorTitle', 'booking.slotUnavailable'],
    already_processed: ['booking.errorTitle', 'booking.alreadyProcessed'],
    invalid_participants: ['booking.errorTitle', 'booking.invalidParticipants'],
    invalid_input: ['booking.errorTitle', 'booking.invalidInput'],
    pricing_rate_missing: ['booking.errorTitle', 'booking.pricingMissing'],
    past_booking: ['booking.errorTitle', 'booking.pastBooking'],
    not_found: ['booking.errorTitle', 'booking.unknownError'],
    unknown: ['booking.errorTitle', 'booking.unknownError'],
  };

  const studentName = (studentId: string) =>
    students.find((student) => student.userId === studentId)?.fullName ??
    t('booking.unknownStudent');

  const runBookingMutation = async (
    action: () => Promise<
      { ok: true } | { ok: false; error: BookingMutationError }
    >,
    success: typeof feedback,
    surface: typeof feedbackSurface = 'planning'
  ) => {
    if (!acquireBookingMutationLock(bookingMutationLock)) return false;

    setIsBookingMutationPending(true);
    setFeedbackSurface(surface);
    setFeedback('none');
    try {
      const result = await action();

      if (!result.ok) {
        setFeedback(result.error);
        return false;
      }

      setFeedback(success);
      await loadPlanning();
      return true;
    } catch {
      setFeedback('invalid_input');
      return false;
    } finally {
      releaseBookingMutationLock(bookingMutationLock);
      setIsBookingMutationPending(false);
    }
  };

  const createDirectBooking = async (input: CoachBookingCreateInput) => {
    await runBookingMutation(async () => {
      const result = await createCoachBooking({
        studentIds: input.studentIds,
        startsAt: input.startsAt,
        durationMinutes: input.durationMinutes,
        location: 'Les Bruyères Centre Sportif',
        lessonType: input.lessonType,
        recurrenceEndsOn: input.recurrenceEndsOn,
      });

      return result.ok ? { ok: true } : result;
    }, 'created', 'creation');
  };

  const startAnotherBooking = () => {
    setFeedback('none');
  };

  const creationSucceeded =
    feedbackSurface === 'creation' && feedback === 'created';

  const startEditingBooking = (booking: Booking) => {
    setEditingBookingId(booking.id);
  };

  const visibleBookings = showRecurringOnly
    ? bookings.filter((booking) => booking.recurrenceSeriesId)
    : bookings;

  const { bookingsBySlotId, planningItems, planningItemsByDay } =
    useCoachPlanningItems({
      bookings: visibleBookings,
      showAvailability,
      showConfirmedLessons,
      slots,
    });

  const linkedBooking = linkedBookingId
    ? (bookings.find((booking) => booking.id === linkedBookingId) ?? null)
    : null;
  const editingBooking = editingBookingId
    ? (bookings.find((booking) => booking.id === editingBookingId) ?? null)
    : null;

  const closeBookingEditor = () => {
    if (!isBookingMutationPending) setEditingBookingId(null);
  };

  const updateEditingBooking = (input: CoachBookingEditInput) =>
    runBookingMutation(() => modifyBooking(input), 'modified');

  const cancelEditingBookingRecurrences = (
    input: CoachBookingRecurrenceCancellationInput
  ) =>
    runBookingMutation(
      () => cancelBookingRecurrences(input),
      'recurrencesCancelled'
    );

  const getPlanningItemStyle = (item: CoachPlanningItem) =>
    item.kind === 'availability'
      ? {
          backgroundColor: theme.backgroundSelected,
          borderColor: theme.secondary,
          borderLeftWidth: 5,
        }
      : getBookingStatusStyle(item.booking.status);

  const renderSlotContent = (slot: AvailabilitySlot) => (
    <>
      <ThemedText type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('planning.slotMeta', {
          duration: t(
            `availability.duration.${slot.durationMinutes}` as TranslationKey
          ),
          location: slot.location,
        })}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="primary">
        {t(`availability.slotStatus.${slot.status}` as TranslationKey)}
      </ThemedText>
      {(bookingsBySlotId.get(slot.id) ?? []).map((booking) => (
        <ThemedText key={booking.id} type="small" themeColor="textMuted">
          {t('booking.inlineRequest', {
            student: studentName(booking.studentId),
            status: t(bookingStatusKey(booking.status)),
          })}
        </ThemedText>
      ))}
    </>
  );

  const renderAgendaSlotContent = (slot: AvailabilitySlot) => (
    <>
      <ThemedText numberOfLines={1} type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText numberOfLines={1} type="smallBold" themeColor="primary">
        {t(`availability.slotStatus.${slot.status}` as TranslationKey)}
      </ThemedText>
      {(bookingsBySlotId.get(slot.id) ?? []).map((booking) => (
        <ThemedText
          key={booking.id}
          numberOfLines={1}
          type="small"
          themeColor="textMuted">
          {t('booking.inlineRequest', {
            student: studentName(booking.studentId),
            status: t(bookingStatusKey(booking.status)),
          })}
        </ThemedText>
      ))}
    </>
  );

  const renderDirectBookingContent = (booking: Booking, agenda = false) => {
    const status = t(bookingStatusKey(booking.status));
    const student = studentName(booking.studentId);

    return (
      <>
        <ThemedText numberOfLines={agenda ? 1 : undefined} type="smallBold">
          {t('planning.slotTime', {
            start: formatTime(booking.startsAt),
            end: formatTime(booking.endsAt),
          })}
        </ThemedText>
        {agenda && booking.durationMinutes === 60 ? (
          <ThemedText
            numberOfLines={1}
            type="smallBold"
            themeColor={bookingStatusThemeColor(booking.status)}>
            {`${student} · ${status}`}
          </ThemedText>
        ) : (
          <>
            <ThemedText
              numberOfLines={agenda ? 1 : undefined}
              type="small"
              themeColor="textMuted">
              {student}
            </ThemedText>
            <ThemedText
              numberOfLines={agenda ? 1 : undefined}
              type="smallBold"
              themeColor={bookingStatusThemeColor(booking.status)}>
              {status}
            </ThemedText>
          </>
        )}
      </>
    );
  };

  const renderPlanningItem = (item: CoachPlanningItem, agenda = false) =>
    item.kind === 'availability'
      ? agenda
        ? renderAgendaSlotContent(item.slot)
        : renderSlotContent(item.slot)
      : renderDirectBookingContent(item.booking, agenda);

  if (loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('planning.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.coachLabel')}
            </ThemedText>
            <ThemedText type="title">{t('planning.coachTitle')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('planning.coachBody')}
            </ThemedText>
          </View>

          <PlanningControls
            displayMode={displayMode}
            filters={
              <View style={styles.filterRow}>
                <ProfileMultiOptionSelector<'availability' | 'confirmedLessons'>
                  label={t('planning.filtersLabel')}
                  onToggle={(filter) => {
                    if (filter === 'availability') {
                      setShowAvailability((current) => !current);
                      return;
                    }

                    setShowConfirmedLessons((current) => !current);
                  }}
                  options={[
                    {
                      value: 'availability',
                      label: t('planning.availabilityFilter'),
                    },
                    {
                      value: 'confirmedLessons',
                      label: t('planning.confirmedLessonsFilter'),
                    },
                  ]}
                  selectedValues={[
                    ...(showAvailability ? (['availability'] as const) : []),
                    ...(showConfirmedLessons
                      ? (['confirmedLessons'] as const)
                      : []),
                  ]}
                  singleLine
                />
                <ProfileMultiOptionSelector<'recurringLessons'>
                  label={t('planning.recurringFilterLabel')}
                  onToggle={() => setShowRecurringOnly((current) => !current)}
                  options={[
                    {
                      value: 'recurringLessons',
                      label: t('planning.recurringLessonsFilter'),
                    },
                  ]}
                  selectedValues={[
                    ...(showRecurringOnly
                      ? (['recurringLessons'] as const)
                      : []),
                  ]}
                  singleLine
                />
              </View>
            }
            mode={mode}
            onDisplayModeChange={setDisplayMode}
            onModeChange={setMode}
            onMove={move}
            onToday={goToToday}
          />

          <View style={styles.periodHeader}>
            <ThemedText
              adjustsFontSizeToFit={isMobile}
              minimumFontScale={0.6}
              numberOfLines={isMobile ? 1 : undefined}
              style={isMobile ? styles.mobilePeriodTitle : undefined}
              type="subtitle">
              {formatRange()}
            </ThemedText>
            {isRefreshing ? (
              <ThemedText type="small" themeColor="textMuted">
                {t('planning.refreshing')}
              </ThemedText>
            ) : null}
          </View>

          {loadState === 'error' ? (
            <Feedback
              message={t('planning.loadErrorBody')}
              title={t('planning.loadErrorTitle')}
              tone="error"
            />
          ) : null}

          {feedbackSurface === 'planning' &&
          feedback !== 'none' &&
          feedbackCopy[feedback] ? (
            <Feedback
              title={t(feedbackCopy[feedback][0])}
              message={t(feedbackCopy[feedback][1])}
              tone={
                [
                  'approved',
                  'refused',
                  'created',
                  'cancelled',
                  'modified',
                  'recurrencesCancelled',
                ].includes(feedback)
                  ? 'success'
                  : 'error'
              }
            />
          ) : null}

          {displayMode === 'agenda' ? (
            <AgendaGrid
              days={window.days}
              formatDay={formatDay}
              getSlotStyle={getPlanningItemStyle}
              isSlotPressable={(item) => item.kind === 'booking'}
              onSlotPress={(item) => {
                if (item.kind === 'booking') startEditingBooking(item.booking);
              }}
              renderSlot={(item) => renderPlanningItem(item, true)}
              slots={planningItems}
            />
          ) : (
            <View style={styles.days}>
              {window.days.map((day) => {
                const dayItems = planningItemsByDay.get(day.date) ?? [];

                return (
                  <View key={day.date} style={styles.daySection}>
                    <ThemedText type="smallBold">
                      {formatDay(day.date)}
                    </ThemedText>
                    {dayItems.length === 0 ? (
                      <Feedback
                        message={t('planning.emptyDayBody')}
                        title={t('planning.emptyDayTitle')}
                        tone="info"
                      />
                    ) : (
                      <View style={styles.slotGrid}>
                        {dayItems.map((item) => (
                          <Card
                            key={item.id}
                            style={[
                              styles.slotCard,
                              getPlanningItemStyle(item),
                            ]}>
                            {renderPlanningItem(item)}
                          </Card>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <CoachBookingCreateSection
            disabled={isBookingMutationPending}
            error={
              feedbackSurface === 'creation' &&
              feedback !== 'none' &&
              feedback !== 'created'
                ? (feedback as BookingMutationError)
                : null
            }
            onCreate={createDirectBooking}
            onReset={startAnotherBooking}
            pending={
              isBookingMutationPending && feedbackSurface === 'creation'
            }
            pricingRates={pricingRates}
            students={students}
            succeeded={creationSucceeded}
          />

          <View style={styles.days}>
            <ThemedText type="subtitle">
              {t('booking.coachListTitle')}
            </ThemedText>
            {linkedBooking ? (
              <Feedback
                message={t('messaging.linkedContextBody', {
                  student: studentName(linkedBooking.studentId),
                })}
                title={t('messaging.linkedContextTitle')}
                tone="success"
              />
            ) : linkedBookingId && loadState === 'ready' ? (
              <Feedback
                message={t('messaging.contextUnavailableBody')}
                title={t('messaging.contextUnavailableTitle')}
                tone="warning"
              />
            ) : null}
            {visibleBookings.length === 0 ? (
              <Feedback
                title={t('booking.coachEmptyTitle')}
                message={t('booking.coachEmptyBody')}
                tone="info"
              />
            ) : (
              <View style={styles.slotGrid}>
                {visibleBookings.map((booking) => (
                  <CoachBookingCard
                    booking={booking}
                    key={booking.id}
                    linked={booking.id === linkedBookingId}
                    onApprove={(bookingId) =>
                      void runBookingMutation(
                        () => approveBooking(bookingId),
                        'approved'
                      )
                    }
                    onCancel={(bookingId) =>
                      void runBookingMutation(
                        () => cancelBooking(bookingId),
                        'cancelled'
                      )
                    }
                    onEdit={startEditingBooking}
                    onRefuse={(bookingId, comment) =>
                      void runBookingMutation(
                        () => refuseBooking(bookingId, comment),
                        'refused'
                      )
                    }
                    participantNames={
                      booking.participants.length > 1
                        ? booking.participants
                            .map(
                              (participant) =>
                                participant.fullName ??
                                studentName(participant.studentId)
                            )
                            .join(', ')
                        : null
                    }
                    pending={isBookingMutationPending}
                    studentName={studentName(booking.studentId)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {editingBooking ? (
        <CoachBookingEditorModal
          booking={editingBooking}
          formatTime={formatTime}
          key={editingBooking.id}
          onCancelRecurrences={cancelEditingBookingRecurrences}
          onClose={closeBookingEditor}
          onSubmit={updateEditingBooking}
          pending={isBookingMutationPending}
          studentName={studentName(editingBooking.studentId)}
          students={students}
        />
      ) : null}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  periodHeader: {
    gap: Spacing.one,
  },
  mobilePeriodTitle: {
    width: '100%',
    fontSize: 16,
    lineHeight: 24,
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
});
