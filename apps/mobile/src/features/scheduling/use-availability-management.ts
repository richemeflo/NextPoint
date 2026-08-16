import {
  availabilityRangeSchema,
  toAvailabilityRangeInput,
  type AvailabilityRangeFormInput,
} from '@nextpoint/shared';
import { useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import {
  acquireMutationLock,
  releaseMutationLock,
} from '@/features/mutations/mutation-lock';
import {
  createAvailabilityRange,
  deleteAvailabilitySlot,
  updateAvailabilitySlot,
  type AvailabilityRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import { isCoachPlanningSlotVisible } from '@/features/scheduling/coach-planning-visibility';
import { useTranslation } from '@/i18n';

export type AvailabilityFeedback =
  | 'blocked'
  | 'conflict'
  | 'deleted'
  | 'error'
  | 'forbidden'
  | 'none'
  | 'saved'
  | 'updated';

type AvailabilityAction = 'delete' | 'save';
type AvailabilityMutationError =
  | 'blocked'
  | 'conflict'
  | 'forbidden'
  | 'invalid'
  | undefined;

function feedbackForError(code: AvailabilityMutationError): AvailabilityFeedback {
  if (code === 'blocked') return 'blocked';
  if (code === 'conflict') return 'conflict';
  if (code === 'forbidden') return 'forbidden';
  return 'error';
}

export function useAvailabilityManagement({
  ranges,
  refresh,
  slots,
}: {
  ranges: AvailabilityRange[];
  refresh: () => Promise<void>;
  slots: AvailabilitySlot[];
}) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<AvailabilityFeedback>('none');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [mutationPending, setMutationPending] = useState(false);
  const mutationLock = useRef(false);

  const visibleSlots = useMemo(
    () => slots.filter((slot) => isCoachPlanningSlotVisible(slot.status)),
    [slots]
  );
  const rangeById = useMemo(
    () => new Map(ranges.map((range) => [range.id, range])),
    [ranges]
  );
  const slotsByRangeId = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const current = grouped.get(slot.rangeId) ?? [];
      current.push(slot);
      grouped.set(slot.rangeId, current);
    }

    return grouped;
  }, [slots]);
  const selectedSlot = useMemo(
    () => visibleSlots.find((slot) => slot.id === editingSlotId) ?? null,
    [editingSlotId, visibleSlots]
  );
  const selectedRange = selectedSlot
    ? (rangeById.get(selectedSlot.rangeId) ?? null)
    : null;

  const cancelEditing = () => {
    setEditingSlotId(null);
  };

  const startEditing = (slot: AvailabilitySlot) => {
    setFeedback('none');
    setEditingSlotId(slot.id);
  };

  const createRange = async (form: AvailabilityRangeFormInput) => {
    if (!acquireMutationLock(mutationLock)) return false;

    setMutationPending(true);
    setFeedback('none');
    try {
      const result = await createAvailabilityRange(
        toAvailabilityRangeInput(form)
      );

      if (!result.ok) {
        setFeedback(feedbackForError(result.code));
        return false;
      }

      setFeedback('saved');
      await refresh();
      return true;
    } catch {
      setFeedback('error');
      return false;
    } finally {
      setMutationPending(false);
      releaseMutationLock(mutationLock);
    }
  };

  const canOfferSeriesScope = (slot: AvailabilitySlot) => {
    const range = rangeById.get(slot.rangeId);
    if (!range || range.recurrenceType === 'none') return false;

    return (slotsByRangeId.get(slot.rangeId) ?? []).every(
      (candidate) => candidate.status === 'available'
    );
  };

  const saveEditedSlot = async (
    slot: AvailabilitySlot,
    applyToSeries: boolean,
    values: AvailabilityRangeFormInput | undefined
  ) => {
    if (!values) return;

    const parsed = availabilityRangeSchema.safeParse(values);
    if (!parsed.success) {
      setFeedback('error');
      return;
    }

    const input = toAvailabilityRangeInput(parsed.data);
    const durationMinutes = Math.round(
      (new Date(input.endsAt).getTime() - new Date(input.startsAt).getTime()) /
        60_000
    );
    const result = await updateAvailabilitySlot({
      slotId: slot.id,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      durationMinutes,
      location: input.location,
      applyToSeries,
    });

    if (!result.ok) {
      setFeedback(feedbackForError(result.code));
      return;
    }

    setFeedback('updated');
    cancelEditing();
    await refresh();
  };

  const deleteSlot = async (slot: AvailabilitySlot, applyToSeries: boolean) => {
    const result = await deleteAvailabilitySlot(slot.id, applyToSeries);

    if (!result.ok) {
      setFeedback(feedbackForError(result.code));
      return;
    }

    setFeedback('deleted');
    cancelEditing();
    await refresh();
  };

  const requestMutationScope = (
    slot: AvailabilitySlot,
    action: AvailabilityAction,
    values?: AvailabilityRangeFormInput
  ) => {
    if (!acquireMutationLock(mutationLock)) return;
    setMutationPending(true);

    const releasePendingMutation = () => {
      setMutationPending(false);
      releaseMutationLock(mutationLock);
    };
    const runMutation = async (applyToSeries: boolean) => {
      try {
        if (action === 'save') {
          await saveEditedSlot(slot, applyToSeries, values);
        } else {
          await deleteSlot(slot, applyToSeries);
        }
      } catch {
        setFeedback('error');
      } finally {
        releasePendingMutation();
      }
    };
    const applyOccurrence = () => void runMutation(false);
    const applySeries = () => void runMutation(true);

    if (!canOfferSeriesScope(slot)) {
      applyOccurrence();
      return;
    }

    Alert.alert(
      t('availability.scopeDialogTitle'),
      t('availability.scopeDialogBody'),
      [
        {
          text: t('availability.scopeOccurrenceAction'),
          onPress: applyOccurrence,
        },
        {
          text: t('availability.scopeSeriesAction'),
          onPress: applySeries,
        },
        {
          text: t('availability.cancelAction'),
          onPress: releasePendingMutation,
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  return {
    cancelEditing,
    createRange,
    editingSlotId,
    feedback,
    mutationPending,
    requestMutationScope,
    selectedRange,
    selectedSlot,
    startEditing,
  };
}
