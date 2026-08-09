import {
  bookingParticipantLimits,
  getSchedulingDateKey,
  getSchedulingDateLabelInstant,
  getSchedulingTime,
  getSchedulingToday,
  isBookingParticipantCountValid,
  schedulingLocalDateTimeToIso,
  schedulingTimeZone,
  type PricingDuration,
  type PricingLessonType,
} from '@nextpoint/shared';
import { useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  approveBooking,
  cancelBooking,
  createCoachBooking,
  getCoachBookingsInRange,
  modifyBooking,
  refuseBooking,
  type Booking,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from '@/features/bookings/booking-mutation-lock';
import { getCoachBookingPricingOptions } from '@/features/bookings/coach-booking-pricing';
import {
  getCoachPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import { planningControlIcons } from '@/features/scheduling/planning-control-icons';
import {
  isCoachPlanningBookingVisible,
  isCoachPlanningSlotVisible,
} from '@/features/scheduling/coach-planning-visibility';
import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
} from '@/features/scheduling/latest-planning-request';
import {
  getCoachAvailabilitySlotsInRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import {
  getPlanningWindow,
  getSlotDateKey,
  movePlanningAnchor,
  type PlanningViewMode,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';
import {
  getAssociatedStudents,
  type AssociatedStudent,
} from '@/features/students/student-coach-service';

const today = () => getSchedulingToday();

function getLinkedAnchorDate(value: string | undefined) {
  if (!value) return today();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? today() : getSchedulingDateKey(date);
}

function localDateTimeToIso(date: string, time: string) {
  const iso = schedulingLocalDateTimeToIso(date, time);
  if (!iso) throw new RangeError('Invalid Europe/Paris booking date');
  return iso;
}

function formatPrice(booking: Booking, locale: string) {
  if (!booking.pricing) return null;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: booking.pricing.currency,
  }).format(booking.pricing.amountCents / 100);
}

type CoachPlanningItem =
  | {
      kind: 'availability';
      id: string;
      startsAt: string;
      endsAt: string;
      slot: AvailabilitySlot;
    }
  | {
      kind: 'booking';
      id: string;
      startsAt: string;
      endsAt: string;
      booking: Booking;
    };

export default function CoachPlanningScreen() {
  const { bookingId: linkedBookingId, startsAt: linkedStartsAt } =
    useLocalSearchParams<{ bookingId?: string; startsAt?: string }>();
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const [mode, setMode] = useState<PlanningViewMode>('week');
  const [displayMode, setDisplayMode] = useState<'agenda' | 'list'>('agenda');
  const [anchorDate, setAnchorDate] = useState(() =>
    getLinkedAnchorDate(linkedStartsAt)
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<AssociatedStudent[]>([]);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const planningRequestVersion = useRef(0);
  const [feedback, setFeedback] = useState<
    | 'none'
    | 'approved'
    | 'refused'
    | 'created'
    | 'cancelled'
    | 'modified'
    | BookingMutationError
  >('none');
  const [feedbackSurface, setFeedbackSurface] = useState<
    'planning' | 'creation'
  >('planning');
  const bookingMutationLock = useRef(false);
  const [isBookingMutationPending, setIsBookingMutationPending] =
    useState(false);
  const [refusalComments, setRefusalComments] = useState<
    Record<string, string>
  >({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [newLessonType, setNewLessonType] =
    useState<PricingLessonType>('individual');
  const [newDate, setNewDate] = useState(today);
  const [newTime, setNewTime] = useState('18:00');
  const [newDuration, setNewDuration] = useState<'60' | '90'>('60');
  const [newRecurrenceEndsOn, setNewRecurrenceEndsOn] = useState('');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState(today);
  const [editTime, setEditTime] = useState('18:00');
  const [editDuration, setEditDuration] = useState<'60' | '90'>('60');

  const window = useMemo(
    () => getPlanningWindow(anchorDate, mode),
    [anchorDate, mode]
  );

  const loadPlanning = useCallback(async () => {
    const requestVersion = beginPlanningRequest(planningRequestVersion);
    if (!user) {
      setIsRefreshing(false);
      return;
    }

    setIsRefreshing(true);
    try {
      const [slotsResult, bookingsResult, studentsResult, pricingResult] =
        await Promise.all([
          getCoachAvailabilitySlotsInRange(
            user.id,
            window.startsAt,
            window.endsAt
          ),
          getCoachBookingsInRange(user.id, window.startsAt, window.endsAt),
          getAssociatedStudents(user.id),
          getCoachPricingRates(user.id),
        ]);

      if (!isLatestPlanningRequest(planningRequestVersion, requestVersion)) {
        return;
      }

      if (
        !slotsResult.ok ||
        !bookingsResult.ok ||
        !studentsResult.ok ||
        !pricingResult.ok
      ) {
        setLoadState('error');
        return;
      }

      setSlots(slotsResult.data);
      setBookings(bookingsResult.data);
      setStudents(studentsResult.data);
      setPricingRates(pricingResult.data);
      setLoadState('ready');
    } catch {
      if (!isLatestPlanningRequest(planningRequestVersion, requestVersion)) {
        return;
      }
      setLoadState('error');
    } finally {
      if (isLatestPlanningRequest(planningRequestVersion, requestVersion)) {
        setIsRefreshing(false);
      }
    }
  }, [user, window.endsAt, window.startsAt]);

  useEffect(() => {
    void Promise.resolve().then(loadPlanning).catch(() => undefined);

    return () => {
      invalidatePlanningRequest(planningRequestVersion);
    };
  }, [loadPlanning]);

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

  const move = (direction: -1 | 1) =>
    setAnchorDate((current) => movePlanningAnchor(current, mode, direction));

  const bookingPricingOptions = useMemo(
    () =>
      getCoachBookingPricingOptions(
        pricingRates,
        {
          durationMinutes: Number(newDuration) as PricingDuration,
          lessonType: newLessonType,
        },
        selectedStudentIds[0]
      ),
    [newDuration, newLessonType, pricingRates, selectedStudentIds]
  );
  const selectedCreateLessonType = bookingPricingOptions.selection.lessonType;
  const createParticipantLimit =
    bookingParticipantLimits[selectedCreateLessonType].max;
  const hasValidCreateParticipants = isBookingParticipantCountValid(
    selectedCreateLessonType,
    selectedStudentIds.length
  );

  const feedbackCopy: Partial<
    Record<typeof feedback, [TranslationKey, TranslationKey]>
  > = {
    approved: ['booking.approveSuccessTitle', 'booking.approveSuccessBody'],
    refused: ['booking.refuseSuccessTitle', 'booking.refuseSuccessBody'],
    created: ['booking.createSuccessTitle', 'booking.createSuccessBody'],
    cancelled: ['booking.cancelSuccessTitle', 'booking.cancelSuccessBody'],
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

  const bookingStatusKey = (status: Booking['status']) =>
    `status.${status}` as TranslationKey;

  const getBookingStatusStyle = (status: Booking['status'] | undefined) => {
    if (status === 'pending') {
      return {
        backgroundColor: theme.warningSurface,
        borderColor: theme.warning,
      };
    }

    if (status === 'confirmed' || status === 'modified') {
      return {
        backgroundColor: theme.successSurface,
        borderColor: theme.success,
      };
    }

    if (status === 'refused') {
      return { backgroundColor: theme.errorSurface, borderColor: theme.error };
    }

    return undefined;
  };

  const bookingStatusThemeColor = (
    status: Booking['status']
  ): 'warning' | 'success' | 'error' | 'primary' => {
    if (status === 'pending') return 'warning';
    if (status === 'confirmed' || status === 'modified') return 'success';
    if (status === 'refused') return 'error';
    return 'primary';
  };

  const studentName = (studentId: string) =>
    students.find((student) => student.userId === studentId)?.fullName ??
    t('booking.unknownStudent');

  const toggleSelectedStudent = (studentId: string) => {
    setSelectedStudentIds((current) => {
      if (selectedCreateLessonType === 'individual') {
        return [studentId];
      }

      return current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId];
    });
  };

  const runBookingMutation = async (
    action: () => Promise<
      { ok: true } | { ok: false; error: BookingMutationError }
    >,
    success: typeof feedback,
    surface: typeof feedbackSurface = 'planning'
  ) => {
    if (!acquireBookingMutationLock(bookingMutationLock)) return;

    setIsBookingMutationPending(true);
    setFeedbackSurface(surface);
    setFeedback('none');
    try {
      const result = await action();

      if (!result.ok) {
        setFeedback(result.error);
        return;
      }

      setFeedback(success);
      await loadPlanning();
    } catch {
      setFeedback('invalid_input');
    } finally {
      releaseBookingMutationLock(bookingMutationLock);
      setIsBookingMutationPending(false);
    }
  };

  const createDirectBooking = async () => {
    await runBookingMutation(async () => {
      const result = await createCoachBooking({
        studentIds: selectedStudentIds,
        startsAt: localDateTimeToIso(newDate, newTime),
        durationMinutes: bookingPricingOptions.selection.durationMinutes,
        location: 'Les Bruyères Centre Sportif',
        lessonType: bookingPricingOptions.selection.lessonType,
        recurrenceEndsOn: newRecurrenceEndsOn.trim() || null,
      });

      return result.ok ? { ok: true } : result;
    }, 'created', 'creation');
  };

  const startAnotherBooking = () => {
    setFeedback('none');
    setSelectedStudentIds([]);
    setNewRecurrenceEndsOn('');
  };

  const creationSucceeded =
    feedbackSurface === 'creation' && feedback === 'created';

  const startEditingBooking = (booking: Booking) => {
    const startsAt = new Date(booking.startsAt);
    setEditingBookingId(booking.id);
    setEditDate(getSchedulingDateKey(startsAt));
    setEditTime(getSchedulingTime(startsAt));
    setEditDuration(String(booking.durationMinutes) as '60' | '90');
  };

  const planningItems = useMemo<CoachPlanningItem[]>(
    () => [
      ...slots
        .filter((slot) => isCoachPlanningSlotVisible(slot.status))
        .map((slot) => ({
          kind: 'availability' as const,
          id: `availability-${slot.id}`,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          slot,
        })),
      ...bookings
        .filter(
          (booking) =>
            !booking.availabilitySlotId &&
            (booking.status === 'confirmed' || booking.status === 'modified')
        )
        .map((booking) => ({
          kind: 'booking' as const,
          id: `booking-${booking.id}`,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          booking,
        })),
    ],
    [bookings, slots]
  );

  const planningItemsByDay = useMemo(() => {
    const grouped = new Map<string, CoachPlanningItem[]>();

    for (const item of planningItems) {
      const key = getSlotDateKey(item.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    }

    return grouped;
  }, [planningItems]);

  const bookingsBySlotId = useMemo(() => {
    const grouped = new Map<string, Booking[]>();

    for (const booking of bookings) {
      if (
        !booking.availabilitySlotId ||
        !isCoachPlanningBookingVisible(booking.status)
      ) {
        continue;
      }

      const current = grouped.get(booking.availabilitySlotId) ?? [];
      current.push(booking);
      grouped.set(booking.availabilitySlotId, current);
    }

    return grouped;
  }, [bookings]);

  const linkedBooking = linkedBookingId
    ? (bookings.find((booking) => booking.id === linkedBookingId) ?? null)
    : null;

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

  const renderDirectBookingContent = (booking: Booking, agenda = false) => (
    <>
      <ThemedText numberOfLines={agenda ? 1 : undefined} type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(booking.startsAt),
          end: formatTime(booking.endsAt),
        })}
      </ThemedText>
      <ThemedText
        numberOfLines={agenda ? 1 : undefined}
        type="small"
        themeColor="textMuted">
        {studentName(booking.studentId)}
      </ThemedText>
      <ThemedText
        numberOfLines={agenda ? 1 : undefined}
        type="smallBold"
        themeColor={bookingStatusThemeColor(booking.status)}>
        {t(bookingStatusKey(booking.status))}
      </ThemedText>
    </>
  );

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

          <View style={styles.toolbar}>
            <View style={styles.toolbarSegmented}>
              {(['agenda', 'list'] as const).map((candidate) => (
                <Button
                  key={candidate}
                  icon={planningControlIcons[candidate]}
                  label={t(`planning.display.${candidate}` as TranslationKey)}
                  onPress={() => setDisplayMode(candidate)}
                  style={styles.toolbarButton}
                  variant={displayMode === candidate ? 'primary' : 'secondary'}
                />
              ))}
            </View>
            <View style={styles.toolbarSegmented}>
              {(['week', 'day'] as const).map((candidate) => (
                <Button
                  key={candidate}
                  label={t(`planning.mode.${candidate}` as TranslationKey)}
                  onPress={() => setMode(candidate)}
                  style={styles.toolbarButton}
                  variant={mode === candidate ? 'primary' : 'secondary'}
                />
              ))}
            </View>
            <View style={styles.periodActions}>
              <Button
                icon={planningControlIcons.previous}
                label={t('planning.previousAction')}
                onPress={() => move(-1)}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
              <Button
                label={t('planning.todayAction')}
                onPress={() => setAnchorDate(today())}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
              <Button
                icon={planningControlIcons.next}
                iconPosition="right"
                label={t('planning.nextAction')}
                onPress={() => move(1)}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
            </View>
          </View>

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

          <Card elevated style={styles.formCard}>
            <ThemedText type="subtitle">
              {t('booking.coachCreateTitle')}
            </ThemedText>
            {!bookingPricingOptions.hasMatchingRate ? (
              <Feedback
                message={t('booking.createPricingRequiredBody')}
                title={t('booking.createPricingRequiredTitle')}
                tone="warning"
              />
            ) : null}
            <ProfileOptionSelector<PricingLessonType>
              label={t('booking.lessonTypeLabel')}
              onChange={(value) => {
                setNewLessonType(value);
                setSelectedStudentIds([]);
              }}
              options={bookingPricingOptions.lessonTypes.map((value) => ({
                value,
                label: t(`pricing.type.${value}` as TranslationKey),
              }))}
              value={bookingPricingOptions.selection.lessonType}
            />
            <View style={styles.studentPicker}>
              <ThemedText type="smallBold">
                {selectedCreateLessonType === 'individual'
                  ? t('booking.studentLabel')
                  : t('booking.participantsLabel')}
              </ThemedText>
              <View style={styles.segmented}>
                {students.map((student) => (
                  <Button
                    disabled={
                      selectedCreateLessonType !== 'individual' &&
                      selectedStudentIds.length >= createParticipantLimit &&
                      !selectedStudentIds.includes(student.userId)
                    }
                    key={student.userId}
                    label={student.fullName}
                    onPress={() => toggleSelectedStudent(student.userId)}
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
                onChangeText={setNewDate}
                placeholder={t('availability.datePlaceholder')}
                value={newDate}
              />
              <TextField
                label={t('availability.startsAtLabel')}
                onChangeText={setNewTime}
                placeholder={t('availability.timePlaceholder')}
                value={newTime}
              />
              <ProfileOptionSelector<'60' | '90'>
                label={t('availability.durationLabel')}
                onChange={setNewDuration}
                options={bookingPricingOptions.durationMinutes.map((value) => ({
                  value: String(value) as '60' | '90',
                  label: t(`availability.duration.${value}` as TranslationKey),
                }))}
                value={
                  String(bookingPricingOptions.selection.durationMinutes) as
                    '60' | '90'
                }
              />
            </View>
            <TextField
              label={t('booking.recurrenceEndsOnLabel')}
              onChangeText={setNewRecurrenceEndsOn}
              placeholder={t('booking.recurrenceEndsOnPlaceholder')}
              value={newRecurrenceEndsOn}
            />
            <Button
              disabled={
                creationSucceeded ||
                !hasValidCreateParticipants ||
                !bookingPricingOptions.hasMatchingRate ||
                isBookingMutationPending
              }
              label={
                creationSucceeded
                  ? t('booking.createSuccessButton')
                  : isBookingMutationPending && feedbackSurface === 'creation'
                    ? t('booking.creating')
                    : t('booking.createAction')
              }
              onPress={() => void createDirectBooking()}
            />
            {feedbackSurface === 'creation' &&
            feedback !== 'none' &&
            feedback !== 'created' &&
            feedbackCopy[feedback] ? (
              <Feedback
                message={t(feedbackCopy[feedback][1])}
                title={t(feedbackCopy[feedback][0])}
                tone="error"
              />
            ) : null}
          </Card>

          {creationSucceeded ? (
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
                onPress={startAnotherBooking}
                variant="secondary"
              />
            </View>
          ) : null}

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
            {bookings.length === 0 ? (
              <Feedback
                title={t('booking.coachEmptyTitle')}
                message={t('booking.coachEmptyBody')}
                tone="info"
              />
            ) : (
              <View style={styles.slotGrid}>
                {bookings.map((booking) => {
                  const price = formatPrice(booking, locale);
                  const refusalComment = refusalComments[booking.id] ?? '';

                  return (
                    <Card
                      key={booking.id}
                      style={[
                        styles.bookingCard,
                        getBookingStatusStyle(booking.status),
                        booking.id === linkedBookingId
                          ? {
                              backgroundColor: theme.backgroundSelected,
                              borderColor: theme.primary,
                            }
                          : null,
                      ]}>
                      <ThemedText type="smallBold">
                        {studentName(booking.studentId)}
                      </ThemedText>
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
                      {booking.participants.length > 1 ? (
                        <ThemedText type="small" themeColor="textMuted">
                          {t('booking.participantNames', {
                            names: booking.participants
                              .map(
                                (participant) =>
                                  participant.fullName ??
                                  studentName(participant.studentId)
                              )
                              .join(', '),
                          })}
                        </ThemedText>
                      ) : null}

                      {booking.status === 'pending' ? (
                        <View style={styles.bookingActions}>
                          <Button
                            disabled={isBookingMutationPending}
                            label={t('booking.approveAction')}
                            onPress={() =>
                              void runBookingMutation(
                                () => approveBooking(booking.id),
                                'approved'
                              )
                            }
                          />
                          <TextField
                            label={t('booking.refusalCommentLabel')}
                            onChangeText={(value) =>
                              setRefusalComments((current) => ({
                                ...current,
                                [booking.id]: value,
                              }))
                            }
                            placeholder={t('booking.refusalCommentPlaceholder')}
                            value={refusalComment}
                          />
                          <Button
                            disabled={isBookingMutationPending}
                            label={t('booking.refuseAction')}
                            onPress={() =>
                              void runBookingMutation(
                                () => refuseBooking(booking.id, refusalComment),
                                'refused'
                              )
                            }
                            variant="secondary"
                          />
                        </View>
                      ) : null}

                      {booking.status === 'confirmed' ||
                      booking.status === 'modified' ? (
                        <View style={styles.bookingActions}>
                          {editingBookingId === booking.id ? (
                            <>
                              <View style={styles.formGrid}>
                                <TextField
                                  label={t('availability.dateLabel')}
                                  onChangeText={setEditDate}
                                  value={editDate}
                                />
                                <TextField
                                  label={t('availability.startsAtLabel')}
                                  onChangeText={setEditTime}
                                  value={editTime}
                                />
                              </View>
                              <ProfileOptionSelector<'60' | '90'>
                                label={t('availability.durationLabel')}
                                onChange={setEditDuration}
                                options={[
                                  {
                                    value: '60',
                                    label: t('availability.duration.60'),
                                  },
                                  {
                                    value: '90',
                                    label: t('availability.duration.90'),
                                  },
                                ]}
                                value={editDuration}
                              />
                              <Button
                                disabled={isBookingMutationPending}
                                label={t('availability.updateAction')}
                                onPress={() =>
                                  void runBookingMutation(
                                    () =>
                                      modifyBooking({
                                        bookingId: booking.id,
                                        startsAt: localDateTimeToIso(
                                          editDate,
                                          editTime
                                        ),
                                        durationMinutes: Number(
                                          editDuration
                                        ) as 60 | 90,
                                        location:
                                          booking.location as 'Les Bruyères Centre Sportif',
                                      }),
                                    'modified'
                                  )
                                }
                              />
                              <Button
                                disabled={isBookingMutationPending}
                                label={t('availability.cancelAction')}
                                onPress={() => setEditingBookingId(null)}
                                variant="secondary"
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                disabled={isBookingMutationPending}
                                label={t('booking.modifyAction')}
                                onPress={() => startEditingBooking(booking)}
                                variant="secondary"
                              />
                              <Button
                                disabled={isBookingMutationPending}
                                label={t('booking.cancelLessonAction')}
                                onPress={() =>
                                  void runBookingMutation(
                                    () => cancelBooking(booking.id),
                                    'cancelled'
                                  )
                                }
                                variant="secondary"
                              />
                            </>
                          )}
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  toolbar: {
    gap: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  toolbarSegmented: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  periodActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  toolbarButton: {
    flex: 1,
  },
  periodButton: {
    paddingHorizontal: Spacing.one,
  },
  formCard: {
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
  formGrid: {
    gap: Spacing.three,
  },
  studentPicker: {
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
  bookingCard: {
    minWidth: 260,
    flex: 1,
    gap: Spacing.two,
  },
  bookingActions: {
    gap: Spacing.two,
  },
});
