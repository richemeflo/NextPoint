import {
  bookingCancellationMessageMaxLength,
  bookingParticipantLimits,
  availabilitySlotDurations,
  canCancelBooking,
  getSchedulingDateLabelInstant,
  getSchedulingTime,
  getSchedulingToday,
  isBookingParticipantCountValid,
  pricingLessonTypes,
  schedulingTimeZone,
  studentCancelBookingSchema,
  type PricingLessonType,
  type AvailabilitySlotDuration,
} from '@nextpoint/shared';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  getEarliestBookingRequestStartsAt,
  getBookingRequestProposal,
  toBookingRequestStartsAt,
} from '@/features/scheduling/booking-request-time';
import {
  cancelBooking,
  getRequestableBookingParticipants,
  getStudentBookingsInRange,
  requestBooking,
  type Booking,
  type BookingParticipant,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from '@/features/bookings/booking-mutation-lock';
import {
  getPublishedPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
} from '@/features/scheduling/latest-planning-request';
import {
  getStudentRequestableAvailabilitySlotsInRange,
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

const today = () => getSchedulingToday();

function formatPrice(booking: Booking, locale: string) {
  if (!booking.pricing) return null;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: booking.pricing.currency,
  }).format(booking.pricing.amountCents / 100);
}

function canStudentCancel(booking: Booking) {
  return canCancelBooking(
    { status: booking.status, startsAt: booking.startsAt },
    'student'
  ).ok;
}

type StudentAgendaProps = {
  surface?: 'requestable' | 'bookings';
};

type StudentHomeAgendaItem =
  | {
      id: string;
      startsAt: string;
      endsAt: string;
      kind: 'slot';
      slot: AvailabilitySlot;
    }
  | {
      id: string;
      startsAt: string;
      endsAt: string;
      kind: 'booking';
      booking: Booking;
    };

const homeBookingStatuses: Booking['status'][] = [
  'pending',
  'confirmed',
  'modified',
  'refused',
];

function isHomeBookingVisible(booking: Booking) {
  return homeBookingStatuses.includes(booking.status);
}

export function StudentAgenda({ surface = 'requestable' }: StudentAgendaProps) {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [mode, setMode] = useState<PlanningViewMode>('week');
  const [displayMode, setDisplayMode] = useState<'agenda' | 'list'>('agenda');
  const [anchorDate, setAnchorDate] = useState(today);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [participants, setParticipants] = useState<BookingParticipant[]>([]);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>([]);
  const [agendaLoadedAt, setAgendaLoadedAt] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const planningRequestVersion = useRef(0);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [desiredStartsAt, setDesiredStartsAt] = useState<string | null>(null);
  const [requestStartTime, setRequestStartTime] = useState('');
  const [requestDurationMinutes, setRequestDurationMinutes] =
    useState<AvailabilitySlotDuration>(60);
  const [lessonType, setLessonType] = useState<PricingLessonType>('individual');
  const [studentComment, setStudentComment] = useState('');
  const [cancellationBookingId, setCancellationBookingId] = useState<
    string | null
  >(null);
  const [cancellationMessage, setCancellationMessage] = useState('');
  const [cancellationError, setCancellationError] =
    useState<BookingMutationError | null>(null);
  const bookingMutationLock = useRef(false);
  const [bookingMutationKind, setBookingMutationKind] = useState<
    'request' | 'cancel' | null
  >(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<
    string[]
  >([]);
  const [feedback, setFeedback] = useState<
    'none' | 'requested' | 'cancelled' | BookingMutationError
  >('none');
  const showRequestableSlots = surface === 'requestable';
  const showBookingSchedule = surface === 'bookings';
  const useRequestModal = showRequestableSlots;
  const isRequestSubmitting = bookingMutationKind === 'request';
  const isCancelling = bookingMutationKind === 'cancel';

  const window = useMemo(
    () => getPlanningWindow(anchorDate, mode),
    [anchorDate, mode]
  );

  const loadAgenda = useCallback(async () => {
    const requestVersion = beginPlanningRequest(planningRequestVersion);
    setIsRefreshing(true);
    try {
      const [slotsResult, bookingsResult, participantsResult, pricingResult] =
        await Promise.all([
          showRequestableSlots
            ? getStudentRequestableAvailabilitySlotsInRange(
                window.startsAt,
                window.endsAt
              )
            : Promise.resolve({ ok: true as const, data: [] }),
          getStudentBookingsInRange(window.startsAt, window.endsAt),
          showRequestableSlots
            ? getRequestableBookingParticipants()
            : Promise.resolve({ ok: true as const, data: [] }),
          showRequestableSlots
            ? getPublishedPricingRates()
            : Promise.resolve({ ok: true as const, data: [] }),
        ]);

      if (!isLatestPlanningRequest(planningRequestVersion, requestVersion)) {
        return;
      }

      if (!slotsResult.ok || !bookingsResult.ok || !pricingResult.ok) {
        setLoadState('error');
        return;
      }

      setSlots(slotsResult.data);
      setBookings(bookingsResult.data);
      setAgendaLoadedAt(Date.now());
      if (participantsResult.ok) setParticipants(participantsResult.data);
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
  }, [showRequestableSlots, window.endsAt, window.startsAt]);

  useEffect(() => {
    void Promise.resolve()
      .then(loadAgenda)
      .catch(() => undefined);

    return () => {
      invalidatePlanningRequest(planningRequestVersion);
    };
  }, [loadAgenda]);

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

  const move = (direction: -1 | 1) =>
    setAnchorDate((current) => movePlanningAnchor(current, mode, direction));

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

  const visibleBookings = bookings;
  const windowBookings = useMemo(
    () =>
      visibleBookings.filter((booking) => {
        const startsAt = new Date(booking.startsAt).getTime();
        return (
          startsAt >= new Date(window.startsAt).getTime() &&
          startsAt < new Date(window.endsAt).getTime()
        );
      }),
    [visibleBookings, window.endsAt, window.startsAt]
  );
  const bookingsByDay = useMemo(() => {
    const grouped = new Map<string, Booking[]>();

    for (const booking of windowBookings) {
      const key = getSlotDateKey(booking.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(booking);
      grouped.set(key, current);
    }

    return grouped;
  }, [windowBookings]);

  const homeWindowBookings = useMemo(
    () => windowBookings.filter(isHomeBookingVisible),
    [windowBookings]
  );

  const requestableSlots = slots;

  const homeAgendaItems = useMemo<StudentHomeAgendaItem[]>(
    () =>
      [
        ...homeWindowBookings.map((booking) => ({
          id: `booking-${booking.id}`,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          kind: 'booking' as const,
          booking,
        })),
        ...requestableSlots.map((slot) => ({
          id: `slot-${slot.id}`,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          kind: 'slot' as const,
          slot,
        })),
      ].sort(
        (first, second) =>
          new Date(first.startsAt).getTime() -
          new Date(second.startsAt).getTime()
      ),
    [homeWindowBookings, requestableSlots]
  );

  const homeItemsByDay = useMemo(() => {
    const grouped = new Map<string, StudentHomeAgendaItem[]>();

    for (const item of homeAgendaItems) {
      const key = getSlotDateKey(item.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(item);
      grouped.set(key, current);
    }

    return grouped;
  }, [homeAgendaItems]);
  const selectedSlot = useMemo(
    () => requestableSlots.find((slot) => slot.id === selectedSlotId) ?? null,
    [requestableSlots, selectedSlotId]
  );
  const studentScheduleOccupations = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === 'confirmed' ||
            booking.status === 'modified' ||
            (booking.status === 'pending' &&
              (!booking.expiresAt ||
                agendaLoadedAt === null ||
                new Date(booking.expiresAt).getTime() > agendaLoadedAt))
        )
        .map((booking) => ({
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
        })),
    [agendaLoadedAt, bookings]
  );
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
  const selectedRequestProposal = useMemo(() => {
    if (!selectedSlot || !desiredStartsAt) return null;

    return getRequestProposalForSlot(selectedSlot, desiredStartsAt);
  }, [desiredStartsAt, getRequestProposalForSlot, selectedSlot]);
  const selectedRequestStartsAt = selectedRequestProposal?.startsAt ?? null;
  const availableRequestDurations =
    selectedRequestProposal?.availableDurations ?? [];
  const selectedRequestEndsAt = selectedRequestStartsAt
    ? new Date(
        new Date(selectedRequestStartsAt).getTime() +
          requestDurationMinutes * 60_000
      ).toISOString()
    : null;
  const selectedCancellationBooking = useMemo(
    () =>
      bookings.find((booking) => booking.id === cancellationBookingId) ?? null,
    [bookings, cancellationBookingId]
  );
  const normalizedCancellationMessage = cancellationMessage.trim();
  const cancellationMessageLength = Array.from(
    normalizedCancellationMessage
  ).length;
  const cancellationMessageError =
    cancellationMessageLength === 0
      ? t('booking.cancellationMessageRequired')
      : cancellationMessageLength > bookingCancellationMessageMaxLength
        ? t('booking.cancellationMessageTooLong')
        : undefined;
  const selectedSlotLessonTypes = useMemo(() => {
    if (!selectedSlot) return [...pricingLessonTypes];

    return pricingLessonTypes.filter((type) =>
      pricingRates.some(
        (rate) =>
          rate.isActive &&
          rate.lessonType === type &&
          rate.durationMinutes === requestDurationMinutes
      )
    );
  }, [pricingRates, requestDurationMinutes, selectedSlot]);
  const selectedLessonType = selectedSlotLessonTypes.includes(lessonType)
    ? lessonType
    : (selectedSlotLessonTypes[0] ?? 'individual');
  const selectedAdditionalParticipantIds = selectedParticipantIds.filter(
    (id) => id !== user?.id
  );
  const hasValidParticipantSelection = isBookingParticipantCountValid(
    selectedLessonType,
    selectedAdditionalParticipantIds.length + 1
  );
  const additionalParticipantLimit =
    bookingParticipantLimits[selectedLessonType].max - 1;

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

  const submitRequest = async (slot: AvailabilitySlot) => {
    if (!selectedRequestStartsAt) return;
    if (new Date(selectedRequestStartsAt).getTime() <= Date.now()) {
      setFeedback('past_booking');
      return;
    }
    if (!acquireBookingMutationLock(bookingMutationLock)) return;

    setBookingMutationKind('request');
    try {
      if (!selectedSlotLessonTypes.includes(selectedLessonType)) {
        setFeedback('pricing_rate_missing');
        return;
      }

      setFeedback('none');
      const result = await requestBooking({
        slotId: slot.occurrenceId,
        startsAt: selectedRequestStartsAt,
        durationMinutes: requestDurationMinutes,
        lessonType: selectedLessonType,
        studentComment,
        participantIds:
          selectedLessonType !== 'individual'
            ? selectedAdditionalParticipantIds
            : [],
      });

      if (!result.ok) {
        setFeedback(result.error);
        return;
      }

      setSelectedSlotId(null);
      setDesiredStartsAt(null);
      setRequestStartTime('');
      setStudentComment('');
      setSelectedParticipantIds([]);
      setFeedback('requested');
      await loadAgenda();
    } catch {
      setFeedback('unknown');
    } finally {
      releaseBookingMutationLock(bookingMutationLock);
      setBookingMutationKind(null);
    }
  };

  const openRequest = (slot: AvailabilitySlot, startsAt = slot.startsAt) => {
    const proposal = getRequestProposalForSlot(slot, startsAt);
    if (!proposal.startsAt) {
      setFeedback(
        new Date(slot.endsAt).getTime() <= Date.now()
          ? 'past_booking'
          : 'slot_unavailable'
      );
      return;
    }
    const proposedStartsAt = proposal.startsAt;

    setSelectedSlotId(slot.id);
    setDesiredStartsAt(proposedStartsAt);
    setRequestStartTime(getSchedulingTime(proposedStartsAt));
    setRequestDurationMinutes(60);
    setFeedback('none');
  };

  const updateRequestStartTime = (
    slot: AvailabilitySlot,
    localTime: string
  ) => {
    const requestedStartsAt = toBookingRequestStartsAt(
      getSlotDateKey(slot.startsAt),
      localTime
    );
    if (!requestedStartsAt) {
      setRequestStartTime(localTime);
      setDesiredStartsAt(null);
      return;
    }

    const proposal = getRequestProposalForSlot(slot, requestedStartsAt);
    const proposedStartsAt = proposal.startsAt ?? requestedStartsAt;
    setRequestStartTime(getSchedulingTime(proposedStartsAt));
    setDesiredStartsAt(proposedStartsAt);
    if (!proposal.availableDurations.includes(requestDurationMinutes)) {
      setRequestDurationMinutes(60);
    }
  };

  const toggleParticipant = (studentId: string) => {
    setSelectedParticipantIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const openCancellation = (booking: Booking) => {
    if (!canStudentCancel(booking)) return;

    setCancellationBookingId(booking.id);
    setCancellationMessage('');
    setCancellationError(null);
    setFeedback('none');
  };

  const closeCancellation = () => {
    if (isCancelling) return;

    setCancellationBookingId(null);
    setCancellationMessage('');
    setCancellationError(null);
  };

  const cancelStudentBooking = async () => {
    if (
      !selectedCancellationBooking ||
      !acquireBookingMutationLock(bookingMutationLock)
    ) {
      return;
    }

    const parsedInput = studentCancelBookingSchema.safeParse({
      bookingId: selectedCancellationBooking.id,
      cancellationMessage,
    });
    if (!parsedInput.success) {
      releaseBookingMutationLock(bookingMutationLock);
      return;
    }

    setFeedback('none');
    setCancellationError(null);
    setBookingMutationKind('cancel');
    try {
      const result = await cancelBooking(
        parsedInput.data.bookingId,
        parsedInput.data.cancellationMessage
      );

      if (!result.ok) {
        setCancellationError(result.error);
        return;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === result.data.id ? result.data : booking
        )
      );
      setCancellationBookingId(null);
      setCancellationMessage('');
      setFeedback('cancelled');
      await loadAgenda();
    } catch {
      setCancellationError('unknown');
    } finally {
      releaseBookingMutationLock(bookingMutationLock);
      setBookingMutationKind(null);
    }
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

  const renderRequestPanel = (slot: AvailabilitySlot) =>
    selectedSlotId === slot.id ? (
      <View style={styles.requestPanel}>
        <TextField
          autoCapitalize="none"
          error={
            requestStartTime && !desiredStartsAt
              ? t('booking.invalidStartTime')
              : undefined
          }
          inputMode="numeric"
          keyboardType="numbers-and-punctuation"
          label={t('booking.startTimeLabel')}
          maxLength={5}
          onChangeText={(value) => updateRequestStartTime(slot, value)}
          placeholder={t('booking.startTimePlaceholder')}
          value={requestStartTime}
        />
        <ProfileOptionSelector<'60' | '90'>
          label={t('booking.durationLabel')}
          onChange={(value) => {
            const duration = value === '60' ? 60 : 90;
            if (availableRequestDurations.includes(duration)) {
              setRequestDurationMinutes(duration);
            }
          }}
          options={availabilitySlotDurations.map((duration) => ({
            value: duration === 60 ? '60' : '90',
            label: t(`availability.duration.${duration}` as TranslationKey),
            disabled: !availableRequestDurations.includes(duration),
          }))}
          value={requestDurationMinutes === 60 ? '60' : '90'}
        />
        {selectedRequestStartsAt && selectedRequestEndsAt ? (
          <ThemedText type="smallBold">
            {t('booking.proposedTime', {
              start: formatTime(selectedRequestStartsAt),
              end: formatTime(selectedRequestEndsAt),
            })}
          </ThemedText>
        ) : (
          <Feedback
            message={t('booking.noDurationFitBody')}
            title={t('booking.noDurationFitTitle')}
            tone="warning"
          />
        )}
        <ProfileOptionSelector<PricingLessonType>
          label={t('booking.lessonTypeLabel')}
          onChange={(value) => {
            setLessonType(value);
            setSelectedParticipantIds([]);
          }}
          options={selectedSlotLessonTypes.map((type) => ({
            value: type,
            label: t(`pricing.type.${type}` as TranslationKey),
          }))}
          value={selectedLessonType}
        />
        {selectedSlotLessonTypes.length === 0 ? (
          <Feedback
            message={t('booking.pricingMissing')}
            title={t('booking.errorTitle')}
            tone="error"
          />
        ) : null}
        {selectedLessonType !== 'individual' ? (
          <View style={styles.participantList}>
            <ThemedText type="smallBold">
              {t('booking.participantsLabel')}
            </ThemedText>
            {participants.map((participant) => (
              <Button
                key={participant.studentId}
                label={
                  participant.studentId === user?.id
                    ? t('booking.requesterIncluded')
                    : (participant.fullName ?? t('booking.unknownStudent'))
                }
                onPress={() => toggleParticipant(participant.studentId)}
                variant={
                  participant.studentId === user?.id ||
                  selectedParticipantIds.includes(participant.studentId)
                    ? 'primary'
                    : 'secondary'
                }
                disabled={
                  participant.studentId === user?.id ||
                  isRequestSubmitting ||
                  (!selectedAdditionalParticipantIds.includes(
                    participant.studentId
                  ) &&
                    selectedAdditionalParticipantIds.length >=
                      additionalParticipantLimit)
                }
              />
            ))}
            {selectedLessonType === 'duo' && !hasValidParticipantSelection ? (
              <ThemedText type="small" themeColor="error">
                {t('booking.duoParticipantRequired')}
              </ThemedText>
            ) : null}
          </View>
        ) : null}
        <TextField
          label={t('booking.commentLabel')}
          onChangeText={setStudentComment}
          placeholder={t('booking.commentPlaceholder')}
          value={studentComment}
        />
        <View style={styles.requestActions}>
          <Button
            label={t('booking.requestAction')}
            onPress={() => void submitRequest(slot)}
            disabled={
              selectedSlotLessonTypes.length === 0 ||
              !selectedRequestStartsAt ||
              !availableRequestDurations.includes(requestDurationMinutes) ||
              !hasValidParticipantSelection ||
              bookingMutationKind !== null
            }
          />
          <Button
            disabled={bookingMutationKind !== null}
            label={t('availability.cancelAction')}
            onPress={() => {
              setSelectedSlotId(null);
              setDesiredStartsAt(null);
              setRequestStartTime('');
            }}
            variant="secondary"
          />
        </View>
      </View>
    ) : null;

  const renderRequestModal = () =>
    useRequestModal && selectedSlot ? (
      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!isRequestSubmitting) setSelectedSlotId(null);
        }}
        transparent
        visible>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            disabled={isRequestSubmitting}
            onPress={() => setSelectedSlotId(null)}
            style={styles.modalBackdrop}
          />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitle}>
                <ThemedText type="subtitle">
                  {t('booking.requestAction')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {selectedRequestStartsAt && selectedRequestEndsAt
                    ? t('planning.slotTime', {
                        start: formatTime(selectedRequestStartsAt),
                        end: formatTime(selectedRequestEndsAt),
                      })
                    : t('booking.noDurationFitTitle')}
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel={t('availability.cancelAction')}
                accessibilityRole="button"
                disabled={isRequestSubmitting}
                onPress={() => setSelectedSlotId(null)}
                style={[
                  styles.modalClose,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}>
                <ThemedText type="smallBold">X</ThemedText>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              <ThemedText type="small" themeColor="textMuted">
                {selectedSlot.location}
              </ThemedText>
              {renderRequestPanel(selectedSlot)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    ) : null;

  const renderCancellationModal = () =>
    selectedCancellationBooking ? (
      <Modal
        animationType="fade"
        onRequestClose={closeCancellation}
        transparent
        visible>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityElementsHidden
            disabled={isCancelling}
            importantForAccessibility="no-hide-descendants"
            onPress={closeCancellation}
            style={styles.modalBackdrop}
          />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitle}>
                <ThemedText type="subtitle">
                  {t('booking.cancellationTitle')}
                </ThemedText>
                <ThemedText type="small" themeColor="textMuted">
                  {t('booking.cancellationBody')}
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel={t('booking.cancellationCloseAction')}
                accessibilityRole="button"
                disabled={isCancelling}
                onPress={closeCancellation}
                style={[
                  styles.modalClose,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}>
                <ThemedText type="smallBold">X</ThemedText>
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}>
              {renderBookingContent(selectedCancellationBooking)}
              <TextField
                error={
                  cancellationMessage.length > 0
                    ? cancellationMessageError
                    : undefined
                }
                label={t('booking.cancellationMessageLabel')}
                multiline
                numberOfLines={4}
                onChangeText={(value) => {
                  setCancellationMessage(value);
                  setCancellationError(null);
                }}
                placeholder={t('booking.cancellationMessagePlaceholder')}
                style={styles.cancellationInput}
                textAlignVertical="top"
                value={cancellationMessage}
              />
              <ThemedText type="small" themeColor="textMuted">
                {t('booking.cancellationMessageCount', {
                  count: cancellationMessageLength,
                  max: bookingCancellationMessageMaxLength,
                })}
              </ThemedText>
              {cancellationError && feedbackCopy[cancellationError] ? (
                <Feedback
                  message={t(feedbackCopy[cancellationError][1])}
                  title={t(feedbackCopy[cancellationError][0])}
                  tone="error"
                />
              ) : null}
              <View style={styles.requestActions}>
                <Button
                  disabled={!!cancellationMessageError || isCancelling}
                  label={
                    isCancelling
                      ? t('booking.cancellationSubmitting')
                      : t('booking.cancellationConfirmAction')
                  }
                  onPress={() => void cancelStudentBooking()}
                />
                <Button
                  disabled={isCancelling}
                  label={t('availability.cancelAction')}
                  onPress={closeCancellation}
                  variant="secondary"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    ) : null;

  const renderBookingContent = (booking: Booking, includeDate = true) => {
    const price = formatPrice(booking, locale);

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
    ) : selectedSlotId === item.slot.id && !useRequestModal ? (
      <Card key={item.id} style={styles.slotCard}>
        {renderSlotContent(item.slot)}
        {renderRequestPanel(item.slot)}
      </Card>
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

      {showRequestableSlots || showBookingSchedule ? (
        <View style={styles.toolbar}>
          <View style={styles.segmented}>
            {(['agenda', 'list'] as const).map((candidate) => (
              <Button
                key={candidate}
                label={t(`planning.display.${candidate}` as TranslationKey)}
                onPress={() => setDisplayMode(candidate)}
                style={styles.toolbarButton}
                variant={displayMode === candidate ? 'primary' : 'secondary'}
              />
            ))}
          </View>
          <View style={styles.segmented}>
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
              label={t('planning.nextAction')}
              onPress={() => move(1)}
              style={[styles.toolbarButton, styles.periodButton]}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}

      {loadState === 'error' ? (
        <Feedback
          message={t('studentAgenda.loadErrorBody')}
          title={t('studentAgenda.loadErrorTitle')}
          tone="error"
        />
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

      {renderRequestModal()}
      {renderCancellationModal()}

      {showRequestableSlots && displayMode === 'agenda' ? (
        <>
          <AgendaGrid
            days={window.days}
            formatDay={formatDay}
            getSlotStyle={getHomeAgendaItemStyle}
            renderSlot={renderHomeAgendaItem}
            slots={homeAgendaItems}
            isSlotPressable={(item) =>
              item.kind === 'slot' &&
              new Date(item.endsAt).getTime() > Date.now()
            }
            onSlotPress={(item, startsAt) => {
              if (item.kind === 'slot') openRequest(item.slot, startsAt);
            }}
          />
          {selectedSlot && !useRequestModal ? (
            <Card style={styles.selectedAgendaSlot}>
              {renderSlotContent(selectedSlot)}
              {renderRequestPanel(selectedSlot)}
            </Card>
          ) : null}
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
  header: {
    gap: Spacing.one,
  },
  heading: {
    gap: Spacing.one,
  },
  toolbar: {
    gap: Spacing.three,
  },
  segmented: {
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
  agendaSlotPressableSelected: {
    borderWidth: 1,
    borderRadius: 6,
    margin: -2,
    padding: 2,
  },
  selectedAgendaSlot: {
    gap: Spacing.two,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  modalCard: {
    maxHeight: '86%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  modalTitle: {
    flex: 1,
    gap: Spacing.one,
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
  },
  modalBody: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  requestPanel: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  requestActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  participantList: {
    gap: Spacing.two,
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
  cancellationInput: {
    minHeight: 112,
    paddingTop: Spacing.three,
  },
});
