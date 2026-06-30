import type { PricingLessonType } from '@nextpoint/shared';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  cancelBooking,
  getRequestableBookingParticipants,
  getStudentBookings,
  requestBooking,
  type Booking,
  type BookingParticipant,
  type BookingMutationError,
} from '@/features/bookings/booking-service';
import {
  getPublishedPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
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

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = () => formatLocalDate(new Date());

function formatPrice(booking: Booking, locale: string) {
  if (!booking.pricing) return null;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: booking.pricing.currency,
  }).format(booking.pricing.amountCents / 100);
}

function canStudentCancel(booking: Booking) {
  return (
    (booking.status === 'confirmed' || booking.status === 'modified') &&
    new Date(booking.startsAt).getTime() > Date.now()
  );
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
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [lessonType, setLessonType] = useState<PricingLessonType>('individual');
  const [studentComment, setStudentComment] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    []
  );
  const [feedback, setFeedback] = useState<
    'none' | 'requested' | 'cancelled' | BookingMutationError
  >('none');
  const showRequestableSlots = surface === 'requestable';
  const showBookingSchedule = surface === 'bookings';
  const useRequestModal = showRequestableSlots;

  const window = useMemo(
    () => getPlanningWindow(anchorDate, mode),
    [anchorDate, mode]
  );

  const loadAgenda = useCallback(async () => {
    setIsRefreshing(true);
    const [slotsResult, bookingsResult, participantsResult, pricingResult] =
      await Promise.all([
        showRequestableSlots
          ? getStudentRequestableAvailabilitySlotsInRange(
              window.startsAt,
              window.endsAt
            )
          : Promise.resolve({ ok: true as const, data: [] }),
        getStudentBookings(),
        showRequestableSlots
          ? getRequestableBookingParticipants()
          : Promise.resolve({ ok: true as const, data: [] }),
        showRequestableSlots
          ? getPublishedPricingRates()
          : Promise.resolve({ ok: true as const, data: [] }),
      ]);

    if (!slotsResult.ok || !bookingsResult.ok || !pricingResult.ok) {
      setLoadState('error');
      setIsRefreshing(false);
      return;
    }

    setSlots(slotsResult.data);
    setBookings(bookingsResult.data);
    if (participantsResult.ok) setParticipants(participantsResult.data);
    setPricingRates(pricingResult.data);
    setLoadState('ready');
    setIsRefreshing(false);
  }, [showRequestableSlots, window.endsAt, window.startsAt]);

  useEffect(() => {
    void Promise.resolve().then(loadAgenda);
  }, [loadAgenda]);

  const formatDay = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    }).format(new Date(`${value}T00:00:00Z`));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const move = (direction: -1 | 1) =>
    setAnchorDate((current) => movePlanningAnchor(current, mode, direction));

  const bookingStatusKey = (status: Booking['status']) =>
    `status.${status}` as TranslationKey;

  const getBookingStatusStyle = (status: Booking['status'] | undefined) => {
    if (status === 'pending') {
      return { backgroundColor: theme.warningSurface, borderColor: theme.warning };
    }

    if (status === 'confirmed' || status === 'modified') {
      return { backgroundColor: theme.successSurface, borderColor: theme.success };
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

  const visibleBookings = useMemo(
    () =>
      surface === 'bookings'
        ? bookings.filter(isHomeBookingVisible)
        : bookings,
    [bookings, surface]
  );
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

  const homeBookedSlotIds = useMemo(() => {
    const ids = new Set<string>();

    for (const booking of homeWindowBookings) {
      if (booking.availabilitySlotId) ids.add(booking.availabilitySlotId);
    }

    return ids;
  }, [homeWindowBookings]);

  const requestableSlots = useMemo(
    () => slots.filter((slot) => !homeBookedSlotIds.has(slot.id)),
    [homeBookedSlotIds, slots]
  );

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
          new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime()
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
  const selectedSlotLessonTypes = useMemo(() => {
    if (!selectedSlot) return ['individual', 'group'] as PricingLessonType[];

    return (['individual', 'group'] as PricingLessonType[]).filter((type) =>
      pricingRates.some(
        (rate) =>
          rate.isActive &&
          rate.lessonType === type &&
          rate.durationMinutes === selectedSlot.durationMinutes
      )
    );
  }, [pricingRates, selectedSlot]);
  const selectedLessonType = selectedSlotLessonTypes.includes(lessonType)
    ? lessonType
    : (selectedSlotLessonTypes[0] ?? 'individual');

  const feedbackCopy: Partial<
    Record<typeof feedback, [TranslationKey, TranslationKey]>
  > = {
    requested: ['booking.requestSuccessTitle', 'booking.requestSuccessBody'],
    cancelled: ['booking.cancelSuccessTitle', 'booking.cancelSuccessBody'],
    slot_unavailable: ['booking.errorTitle', 'booking.slotUnavailable'],
    pending_limit_reached: ['booking.errorTitle', 'booking.pendingLimit'],
    student_pending_limit_reached: [
      'booking.errorTitle',
      'booking.studentPendingLimit',
    ],
    already_processed: ['booking.errorTitle', 'booking.alreadyProcessed'],
    past_booking: ['booking.errorTitle', 'booking.pastBooking'],
    invalid_participants: ['booking.errorTitle', 'booking.invalidParticipants'],
    pricing_rate_missing: ['booking.errorTitle', 'booking.pricingMissing'],
    unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
    not_found: ['booking.errorTitle', 'booking.unknownError'],
    unknown: ['booking.errorTitle', 'booking.unknownError'],
  };

  const submitRequest = async (slot: AvailabilitySlot) => {
    if (homeBookedSlotIds.has(slot.id)) {
      setFeedback('already_processed');
      setSelectedSlotId(null);
      return;
    }

    if (!selectedSlotLessonTypes.includes(selectedLessonType)) {
      setFeedback('pricing_rate_missing');
      return;
    }

    setFeedback('none');
    const result = await requestBooking({
      slotId: slot.id,
      lessonType: selectedLessonType,
      studentComment,
      participantIds:
        selectedLessonType === 'group'
          ? selectedParticipantIds.filter((id) => id !== user?.id)
          : [],
    });

    if (!result.ok) {
      setFeedback(result.error);
      return;
    }

    setSelectedSlotId(null);
    setStudentComment('');
    setSelectedParticipantIds([]);
    setFeedback('requested');
    await loadAgenda();
  };

  const toggleParticipant = (studentId: string) => {
    setSelectedParticipantIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  };

  const cancelStudentBooking = async (booking: Booking) => {
    setFeedback('none');
    const result = await cancelBooking(booking.id);

    if (!result.ok) {
      setFeedback(result.error);
      return;
    }

    setFeedback('cancelled');
    await loadAgenda();
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
          duration: t(
            `availability.duration.${slot.durationMinutes}` as TranslationKey
          ),
          location: slot.location,
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
    </>
  );

  const renderAgendaSlotContent = (slot: AvailabilitySlot) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => setSelectedSlotId(slot.id)}
      style={[
        styles.agendaSlotPressable,
        selectedSlotId === slot.id ? styles.agendaSlotPressableSelected : null,
        selectedSlotId === slot.id ? { borderColor: theme.primary } : null,
      ]}>
      <ThemedText numberOfLines={1} type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText numberOfLines={2} type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
    </Pressable>
  );

  const renderRequestPanel = (slot: AvailabilitySlot) =>
    selectedSlotId === slot.id ? (
      <View style={styles.requestPanel}>
        <ProfileOptionSelector<PricingLessonType>
          label={t('booking.lessonTypeLabel')}
          onChange={setLessonType}
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
        {selectedLessonType === 'group' ? (
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
                disabled={participant.studentId === user?.id}
              />
            ))}
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
            disabled={selectedSlotLessonTypes.length === 0}
          />
          <Button
            label={t('availability.cancelAction')}
            onPress={() => setSelectedSlotId(null)}
            variant="secondary"
          />
        </View>
      </View>
    ) : null;

  const renderRequestModal = () =>
    useRequestModal && selectedSlot ? (
      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedSlotId(null)}
        transparent
        visible>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
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
                  {t('planning.slotTime', {
                    start: formatTime(selectedSlot.startsAt),
                    end: formatTime(selectedSlot.endsAt),
                  })}
                </ThemedText>
              </View>
              <Pressable
                accessibilityLabel={t('availability.cancelAction')}
                accessibilityRole="button"
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
              {renderSlotContent(selectedSlot)}
              {renderRequestPanel(selectedSlot)}
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
          onPress={() => void cancelStudentBooking(booking)}
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

    return (
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
  };

  const renderHomeAgendaItem = (item: StudentHomeAgendaItem) =>
    item.kind === 'slot'
      ? renderAgendaSlotContent(item.slot)
      : renderBookingAgendaContent(item.booking);

  const getHomeAgendaItemStyle = (item: StudentHomeAgendaItem) =>
    item.kind === 'booking' ? getBookingStatusStyle(item.booking.status) : undefined;

  const renderHomeListItem = (item: StudentHomeAgendaItem) =>
    item.kind === 'booking' ? (
      renderBookingCard(item.booking)
    ) : selectedSlotId === item.slot.id && !useRequestModal ? (
      <Card key={item.id} style={styles.slotCard}>
        {renderSlotContent(item.slot)}
        {renderRequestPanel(item.slot)}
      </Card>
    ) : (
      <Pressable key={item.id} onPress={() => setSelectedSlotId(item.slot.id)}>
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
                variant={mode === candidate ? 'primary' : 'secondary'}
              />
            ))}
          </View>
          <View style={styles.periodActions}>
            <Button
              label={t('planning.previousAction')}
              onPress={() => move(-1)}
              variant="secondary"
            />
            <Button
              label={t('planning.todayAction')}
              onPress={() => setAnchorDate(today())}
              variant="secondary"
            />
            <Button
              label={t('planning.nextAction')}
              onPress={() => move(1)}
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

      {showRequestableSlots && displayMode === 'agenda' ? (
        <>
          <AgendaGrid
            days={window.days}
            formatDay={formatDay}
            getSlotStyle={getHomeAgendaItemStyle}
            renderSlot={renderHomeAgendaItem}
            slots={homeAgendaItems}
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
                  <ThemedText type="smallBold">{formatDay(day.date)}</ThemedText>
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
          <ThemedText type="subtitle">{t('booking.studentListTitle')}</ThemedText>
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
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  periodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
});
