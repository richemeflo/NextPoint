import {
  availabilitySlotDurations,
  bookingParticipantLimits,
  getSchedulingTime,
  isBookingParticipantCountValid,
  pricingLessonTypes,
  type AvailabilitySlotDuration,
  type PricingLessonType,
} from '@nextpoint/shared';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  requestBooking,
  searchRequestableBookingParticipants,
  type BookingMutationError,
  type BookingParticipant,
} from '@/features/bookings/booking-service';
import { isPartnerSearchReady } from '@/features/bookings/booking-participant-search';
import {
  acquireBookingMutationLock,
  releaseBookingMutationLock,
} from '@/features/bookings/booking-mutation-lock';
import type { PricingRate } from '@/features/pricing/pricing-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  getDefaultBookingRequestDuration,
  toBookingRequestStartsAt,
  type BookingRequestProposal,
} from '@/features/scheduling/booking-request-time';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { getSlotDateKey } from '@/features/scheduling/planning-window';
import { SchedulingModal } from '@/features/scheduling/scheduling-modal';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type StudentBookingRequestModalProps = {
  formatTime: (value: string) => string;
  getRequestProposal: (
    slot: AvailabilitySlot,
    startsAt: string
  ) => BookingRequestProposal;
  initialStartsAt: string;
  onClose: () => void;
  onError: (error: BookingMutationError) => void;
  onSuccess: () => Promise<void> | void;
  pricingRates: PricingRate[];
  slot: AvailabilitySlot;
};

function getCurrentTimestamp() {
  return Date.now();
}

export function StudentBookingRequestModal({
  formatTime,
  getRequestProposal,
  initialStartsAt,
  onClose,
  onError,
  onSuccess,
  pricingRates,
  slot,
}: StudentBookingRequestModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mutationLock = useRef(false);
  const [desiredStartsAt, setDesiredStartsAt] = useState(initialStartsAt);
  const [requestStartTime, setRequestStartTime] = useState(() =>
    getSchedulingTime(initialStartsAt)
  );
  const [requestDurationMinutes, setRequestDurationMinutes] =
    useState<AvailabilitySlotDuration>(() =>
      getDefaultBookingRequestDuration(
        getRequestProposal(slot, initialStartsAt)
      )
    );
  const [lessonType, setLessonType] =
    useState<PricingLessonType>('individual');
  const [studentComment, setStudentComment] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<
    BookingParticipant[]
  >([]);
  const [participantQuery, setParticipantQuery] = useState('');
  const [participantResults, setParticipantResults] = useState<
    BookingParticipant[]
  >([]);
  const [participantSearchState, setParticipantSearchState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [pending, setPending] = useState(false);

  const proposal = useMemo(
    () => getRequestProposal(slot, desiredStartsAt),
    [desiredStartsAt, getRequestProposal, slot]
  );
  const requestStartsAt = proposal.startsAt;
  const availableDurations = proposal.availableDurations;
  const requestEndsAt = requestStartsAt
    ? new Date(
        new Date(requestStartsAt).getTime() +
          requestDurationMinutes * 60_000
      ).toISOString()
    : null;
  const availableLessonTypes = useMemo(
    () =>
      pricingLessonTypes.filter((type) =>
        pricingRates.some(
          (rate) =>
            rate.isActive &&
            rate.lessonType === type &&
            rate.durationMinutes === requestDurationMinutes
        )
      ),
    [pricingRates, requestDurationMinutes]
  );
  const selectedLessonType = availableLessonTypes.includes(lessonType)
    ? lessonType
    : (availableLessonTypes[0] ?? 'individual');
  const additionalParticipantIds = selectedParticipants.map(
    (participant) => participant.studentId
  );
  const hasValidParticipants = isBookingParticipantCountValid(
    selectedLessonType,
    additionalParticipantIds.length + 1
  );
  const additionalParticipantLimit =
    bookingParticipantLimits[selectedLessonType].max - 1;

  const updateStartTime = (localTime: string) => {
    const requestedStartsAt = toBookingRequestStartsAt(
      getSlotDateKey(slot.startsAt),
      localTime
    );
    if (!requestedStartsAt) {
      setRequestStartTime(localTime);
      setDesiredStartsAt('');
      return;
    }

    const nextProposal = getRequestProposal(slot, requestedStartsAt);
    const proposedStartsAt = nextProposal.startsAt ?? requestedStartsAt;
    setRequestStartTime(getSchedulingTime(proposedStartsAt));
    setDesiredStartsAt(proposedStartsAt);
    if (!nextProposal.availableDurations.includes(requestDurationMinutes)) {
      setRequestDurationMinutes(60);
    }
  };

  useEffect(() => {
    if (
      selectedLessonType === 'individual' ||
      !isPartnerSearchReady(participantQuery)
    ) {
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      setParticipantResults([]);
      setParticipantSearchState('loading');
      void searchRequestableBookingParticipants(participantQuery)
        .then((result) => {
          if (!active) return;
          if (!result.ok) {
            setParticipantSearchState('error');
            return;
          }
          setParticipantResults(result.data);
          setParticipantSearchState('ready');
        })
        .catch(() => {
          if (active) setParticipantSearchState('error');
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [participantQuery, selectedLessonType]);

  const toggleParticipant = (participant: BookingParticipant) => {
    setSelectedParticipants((current) =>
      current.some(({ studentId }) => studentId === participant.studentId)
        ? current.filter(
            ({ studentId }) => studentId !== participant.studentId
          )
        : [...current, participant]
    );
  };

  const submit = async () => {
    if (!requestStartsAt) return;
    if (new Date(requestStartsAt).getTime() <= getCurrentTimestamp()) {
      onError('past_booking');
      return;
    }
    if (!acquireBookingMutationLock(mutationLock)) return;

    setPending(true);
    try {
      if (!availableLessonTypes.includes(selectedLessonType)) {
        onError('pricing_rate_missing');
        return;
      }

      const result = await requestBooking({
        slotId: slot.occurrenceId,
        startsAt: requestStartsAt,
        durationMinutes: requestDurationMinutes,
        lessonType: selectedLessonType,
        studentComment,
        participantIds:
          selectedLessonType === 'individual'
            ? []
            : additionalParticipantIds,
      });
      if (!result.ok) {
        onError(result.error);
        return;
      }

      await onSuccess();
    } catch {
      onError('unknown');
    } finally {
      releaseBookingMutationLock(mutationLock);
      setPending(false);
    }
  };

  return (
    <SchedulingModal
      closeLabel={t('availability.cancelAction')}
      onClose={onClose}
      pending={pending}
      subtitle={
        <ThemedText type="small" themeColor="textMuted">
          {requestStartsAt && requestEndsAt
            ? t('planning.slotTime', {
                start: formatTime(requestStartsAt),
                end: formatTime(requestEndsAt),
              })
            : t('booking.noDurationFitTitle')}
        </ThemedText>
      }
      title={t('booking.requestAction')}
      visible>
      <ThemedText type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
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
          onChangeText={updateStartTime}
          placeholder={t('booking.startTimePlaceholder')}
          value={requestStartTime}
        />
        <ProfileOptionSelector<'60' | '90'>
          label={t('booking.durationLabel')}
          onChange={(value) => {
            const duration = value === '60' ? 60 : 90;
            if (availableDurations.includes(duration)) {
              setRequestDurationMinutes(duration);
            }
          }}
          options={availabilitySlotDurations.map((duration) => ({
            value: duration === 60 ? '60' : '90',
            label: t(`availability.duration.${duration}` as TranslationKey),
            disabled: !availableDurations.includes(duration),
          }))}
          value={requestDurationMinutes === 60 ? '60' : '90'}
        />
        {requestStartsAt && requestEndsAt ? (
          <ThemedText type="smallBold">
            {t('booking.proposedTime', {
              start: formatTime(requestStartsAt),
              end: formatTime(requestEndsAt),
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
            setSelectedParticipants([]);
            setParticipantQuery('');
            setParticipantResults([]);
          }}
          options={availableLessonTypes.map((type) => ({
            value: type,
            label: t(`pricing.type.${type}` as TranslationKey),
          }))}
          value={selectedLessonType}
        />
        {availableLessonTypes.length === 0 ? (
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
            <ThemedText type="small" themeColor="textMuted">
              {t('booking.requesterIncluded')}
            </ThemedText>
            {selectedParticipants.map((participant) => (
              <Button
                disabled={pending}
                key={participant.studentId}
                label={participant.fullName ?? t('booking.unknownStudent')}
                onPress={() => toggleParticipant(participant)}
                variant="primary"
              />
            ))}
            <TextField
              autoCapitalize="words"
              autoCorrect={false}
              label={t('booking.partnerSearchLabel')}
              onChangeText={(value) => {
                setParticipantQuery(value);
                setParticipantResults([]);
                setParticipantSearchState('idle');
              }}
              placeholder={t('booking.partnerSearchPlaceholder')}
              value={participantQuery}
            />
            {!isPartnerSearchReady(participantQuery) ? (
              <ThemedText type="small" themeColor="textMuted">
                {t('booking.partnerSearchHint')}
              </ThemedText>
            ) : null}
            {participantSearchState === 'loading' ? (
              <View style={styles.participantSearchStatus}>
                <ActivityIndicator color={theme.primary} size="small" />
                <ThemedText type="small" themeColor="textMuted">
                  {t('booking.partnerSearchLoading')}
                </ThemedText>
              </View>
            ) : null}
            {participantSearchState === 'error' ? (
              <Feedback
                message={t('booking.partnerSearchError')}
                title={t('booking.errorTitle')}
                tone="error"
              />
            ) : null}
            {participantSearchState === 'ready' &&
            participantResults.length === 0 ? (
              <ThemedText type="small" themeColor="textMuted">
                {t('booking.partnerSearchEmpty')}
              </ThemedText>
            ) : null}
            {participantResults
              .filter(
                (participant) =>
                  !additionalParticipantIds.includes(participant.studentId)
              )
              .map((participant) => (
                <Button
                  disabled={
                    pending ||
                    additionalParticipantIds.length >=
                      additionalParticipantLimit
                  }
                  key={participant.studentId}
                  label={participant.fullName ?? t('booking.unknownStudent')}
                  onPress={() => toggleParticipant(participant)}
                  variant="secondary"
                />
              ))}
            {selectedLessonType === 'duo' && !hasValidParticipants ? (
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
            disabled={
              availableLessonTypes.length === 0 ||
              !requestStartsAt ||
              !availableDurations.includes(requestDurationMinutes) ||
              !hasValidParticipants ||
              pending
            }
            label={t('booking.requestAction')}
            onPress={() => void submit()}
          />
          <Button
            disabled={pending}
            label={t('availability.cancelAction')}
            onPress={onClose}
            variant="secondary"
          />
        </View>
      </View>
    </SchedulingModal>
  );
}

const styles = StyleSheet.create({
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
  participantSearchStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
