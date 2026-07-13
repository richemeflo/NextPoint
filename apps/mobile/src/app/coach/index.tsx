import type { PricingLessonType } from '@nextpoint/shared';
import { useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
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
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
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
import { getAssociatedStudents, type AssociatedStudent } from '@/features/students/student-coach-service';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = () => formatLocalDate(new Date());

function getLinkedAnchorDate(value: string | undefined) {
  if (!value) return today();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? today() : formatLocalDate(date);
}

function localDateTimeToIso(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function formatPrice(booking: Booking, locale: string) {
  if (!booking.pricing) return null;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: booking.pricing.currency,
  }).format(booking.pricing.amountCents / 100);
}

export default function CoachPlanningScreen() {
  const { bookingId: linkedBookingId, startsAt: linkedStartsAt } =
    useLocalSearchParams<{ bookingId?: string; startsAt?: string }>();
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [mode, setMode] = useState<PlanningViewMode>('week');
  const [displayMode, setDisplayMode] = useState<'agenda' | 'list'>('agenda');
  const [anchorDate, setAnchorDate] = useState(() =>
    getLinkedAnchorDate(linkedStartsAt)
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [students, setStudents] = useState<AssociatedStudent[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<
    'none' | 'approved' | 'refused' | 'created' | 'cancelled' | 'modified' | BookingMutationError
  >('none');
  const [refusalComments, setRefusalComments] = useState<Record<string, string>>(
    {}
  );
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
    if (!user) return;

    setIsRefreshing(true);
    const [slotsResult, bookingsResult, studentsResult] = await Promise.all([
      getCoachAvailabilitySlotsInRange(user.id, window.startsAt, window.endsAt),
      getCoachBookingsInRange(user.id, window.startsAt, window.endsAt),
      getAssociatedStudents(user.id),
    ]);

    if (!slotsResult.ok || !bookingsResult.ok) {
      setLoadState('error');
      setIsRefreshing(false);
      return;
    }

    setSlots(slotsResult.data);
    setBookings(bookingsResult.data);
    if (studentsResult.ok) setStudents(studentsResult.data);
    setLoadState('ready');
    setIsRefreshing(false);
  }, [user, window.endsAt, window.startsAt]);

  useEffect(() => {
    void Promise.resolve().then(loadPlanning);
  }, [loadPlanning]);

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

  const formatRange = () =>
    mode === 'day'
      ? formatDay(window.startDate)
      : t('planning.weekRange', {
          start: formatDay(window.startDate),
          end: formatDay(window.endDate),
        });

  const move = (direction: -1 | 1) =>
    setAnchorDate((current) => movePlanningAnchor(current, mode, direction));

  const feedbackCopy: Partial<Record<typeof feedback, [TranslationKey, TranslationKey]>> = {
    approved: ['booking.approveSuccessTitle', 'booking.approveSuccessBody'],
    refused: ['booking.refuseSuccessTitle', 'booking.refuseSuccessBody'],
    created: ['booking.createSuccessTitle', 'booking.createSuccessBody'],
    cancelled: ['booking.cancelSuccessTitle', 'booking.cancelSuccessBody'],
    modified: ['booking.modifySuccessTitle', 'booking.modifySuccessBody'],
    unauthorized: ['booking.errorTitle', 'booking.unauthorized'],
    slot_unavailable: ['booking.errorTitle', 'booking.slotUnavailable'],
    already_processed: ['booking.errorTitle', 'booking.alreadyProcessed'],
    invalid_participants: ['booking.errorTitle', 'booking.invalidParticipants'],
    pricing_rate_missing: ['booking.errorTitle', 'booking.pricingMissing'],
    past_booking: ['booking.errorTitle', 'booking.pastBooking'],
    not_found: ['booking.errorTitle', 'booking.unknownError'],
    unknown: ['booking.errorTitle', 'booking.unknownError'],
  };

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

  const getHighlightedSlotBooking = (slotBookings: Booking[]) =>
    slotBookings.find(
      (booking) => booking.status === 'confirmed' || booking.status === 'modified'
    ) ??
    slotBookings.find((booking) => booking.status === 'pending') ??
    slotBookings.find((booking) => booking.status === 'refused');

  const studentName = (studentId: string) =>
    students.find((student) => student.userId === studentId)?.fullName ??
    t('booking.unknownStudent');

  const toggleSelectedStudent = (studentId: string) => {
    setSelectedStudentIds((current) => {
      if (newLessonType === 'individual') return [studentId];

      return current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId];
    });
  };

  const runBookingMutation = async (
    action: () => Promise<{ ok: true } | { ok: false; error: BookingMutationError }>,
    success: typeof feedback
  ) => {
    setFeedback('none');
    const result = await action();

    if (!result.ok) {
      setFeedback(result.error);
      return;
    }

    setFeedback(success);
    await loadPlanning();
  };

  const createDirectBooking = async () => {
    await runBookingMutation(
      async () => {
        const result = await createCoachBooking({
          studentIds: selectedStudentIds,
          startsAt: localDateTimeToIso(newDate, newTime),
          durationMinutes: Number(newDuration) as 60 | 90,
          location: 'Les Bruyères Centre Sportif',
          lessonType: newLessonType,
          recurrenceEndsOn: newRecurrenceEndsOn.trim() || null,
        });

        return result.ok ? { ok: true } : result;
      },
      'created'
    );
  };

  const startEditingBooking = (booking: Booking) => {
    const startsAt = new Date(booking.startsAt);
    setEditingBookingId(booking.id);
    setEditDate(formatLocalDate(startsAt));
    setEditTime(
      `${String(startsAt.getHours()).padStart(2, '0')}:${String(
        startsAt.getMinutes()
      ).padStart(2, '0')}`
    );
    setEditDuration(String(booking.durationMinutes) as '60' | '90');
  };

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const key = getSlotDateKey(slot.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(slot);
      grouped.set(key, current);
    }

    return grouped;
  }, [slots]);

  const bookingsBySlotId = useMemo(() => {
    const grouped = new Map<string, Booking[]>();

    for (const booking of bookings) {
      if (!booking.availabilitySlotId) continue;

      const current = grouped.get(booking.availabilitySlotId) ?? [];
      current.push(booking);
      grouped.set(booking.availabilitySlotId, current);
    }

    return grouped;
  }, [bookings]);

  const linkedBooking = linkedBookingId
    ? bookings.find((booking) => booking.id === linkedBookingId) ?? null
    : null;

  const getSlotBookingStyle = (slotId: string) =>
    getBookingStatusStyle(
      getHighlightedSlotBooking(bookingsBySlotId.get(slotId) ?? [])?.status
    );

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

          <View style={styles.periodHeader}>
            <ThemedText type="subtitle">{formatRange()}</ThemedText>
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

          {feedback !== 'none' && feedbackCopy[feedback] ? (
            <Feedback
              title={t(feedbackCopy[feedback][0])}
              message={t(feedbackCopy[feedback][1])}
              tone={
                ['approved', 'refused', 'created', 'cancelled', 'modified'].includes(
                  feedback
                )
                  ? 'success'
                  : 'error'
              }
            />
          ) : null}

          <Card elevated style={styles.formCard}>
            <ThemedText type="subtitle">{t('booking.coachCreateTitle')}</ThemedText>
            <ProfileOptionSelector<PricingLessonType>
              label={t('booking.lessonTypeLabel')}
              onChange={(value) => {
                setNewLessonType(value);
                setSelectedStudentIds([]);
              }}
              options={[
                { value: 'individual', label: t('pricing.type.individual') },
                { value: 'group', label: t('pricing.type.group') },
              ]}
              value={newLessonType}
            />
            <View style={styles.studentPicker}>
              <ThemedText type="smallBold">
                {newLessonType === 'individual'
                  ? t('booking.studentLabel')
                  : t('booking.participantsLabel')}
              </ThemedText>
              <View style={styles.segmented}>
                {students.map((student) => (
                  <Button
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
                options={[
                  { value: '60', label: t('availability.duration.60') },
                  { value: '90', label: t('availability.duration.90') },
                ]}
                value={newDuration}
              />
            </View>
            <TextField
              label={t('booking.recurrenceEndsOnLabel')}
              onChangeText={setNewRecurrenceEndsOn}
              placeholder={t('booking.recurrenceEndsOnPlaceholder')}
              value={newRecurrenceEndsOn}
            />
            <Button
              disabled={selectedStudentIds.length === 0}
              label={t('booking.createAction')}
              onPress={() => void createDirectBooking()}
            />
          </Card>

          {displayMode === 'agenda' ? (
            <AgendaGrid
              days={window.days}
              formatDay={formatDay}
              getSlotStyle={(slot) => getSlotBookingStyle(slot.id)}
              renderSlot={renderAgendaSlotContent}
              slots={slots}
            />
          ) : (
            <View style={styles.days}>
              {window.days.map((day) => {
                const daySlots = slotsByDay.get(day.date) ?? [];

                return (
                  <View key={day.date} style={styles.daySection}>
                    <ThemedText type="smallBold">{formatDay(day.date)}</ThemedText>
                    {daySlots.length === 0 ? (
                      <Feedback
                        message={t('planning.emptyDayBody')}
                        title={t('planning.emptyDayTitle')}
                        tone="info"
                      />
                    ) : (
                      <View style={styles.slotGrid}>
                        {daySlots.map((slot) => (
                          <Card
                            key={slot.id}
                            style={[styles.slotCard, getSlotBookingStyle(slot.id)]}>
                            {renderSlotContent(slot)}
                          </Card>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.days}>
            <ThemedText type="subtitle">{t('booking.coachListTitle')}</ThemedText>
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
                              .map((participant) => participant.fullName ?? studentName(participant.studentId))
                              .join(', '),
                          })}
                        </ThemedText>
                      ) : null}

                      {booking.status === 'pending' ? (
                        <View style={styles.bookingActions}>
                          <Button
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

                      {booking.status === 'confirmed' || booking.status === 'modified' ? (
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
                                  { value: '60', label: t('availability.duration.60') },
                                  { value: '90', label: t('availability.duration.90') },
                                ]}
                                value={editDuration}
                              />
                              <Button
                                label={t('availability.updateAction')}
                                onPress={() =>
                                  void runBookingMutation(
                                    () =>
                                      modifyBooking({
                                        bookingId: booking.id,
                                        startsAt: localDateTimeToIso(editDate, editTime),
                                        durationMinutes: Number(editDuration) as 60 | 90,
                                        location: booking.location as 'Les Bruyères Centre Sportif',
                                      }),
                                    'modified'
                                  )
                                }
                              />
                              <Button
                                label={t('availability.cancelAction')}
                                onPress={() => setEditingBookingId(null)}
                                variant="secondary"
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                label={t('booking.modifyAction')}
                                onPress={() => startEditingBooking(booking)}
                                variant="secondary"
                              />
                              <Button
                                label={t('booking.cancelAction')}
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
  periodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  formCard: {
    gap: Spacing.three,
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
