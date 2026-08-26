import {
  availabilityRangeSchema,
  toAvailabilityRangeInput,
  type AvailabilityRangeFormInput,
} from '@nextpoint/shared';
import { useMemo, useRef, useState } from 'react';

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
import { canOfferAvailabilitySeriesScope } from '@/features/scheduling/availability-mutation-scope';
import { isCoachPlanningSlotVisible } from '@/features/scheduling/coach-planning-visibility';

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
type PendingScopeRequest = {
  action: AvailabilityAction;
  slot: AvailabilitySlot;
  values?: AvailabilityRangeFormInput;
};
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
  const [feedback, setFeedback] = useState<AvailabilityFeedback>('none');
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [mutationPending, setMutationPending] = useState(false);
  const [pendingScopeRequest, setPendingScopeRequest] =
    useState<PendingScopeRequest | null>(null);
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
    setPendingScopeRequest(null);
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
    return canOfferAvailabilitySeriesScope(
      rangeById.get(slot.rangeId) ?? null,
      slotsByRangeId.get(slot.rangeId) ?? []
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
    if (mutationLock.current || pendingScopeRequest) return;

    if (
      action === 'save' &&
      (!values || !availabilityRangeSchema.safeParse(values).success)
    ) {
      setFeedback('error');
      return;
    }

    setFeedback('none');
    const request = { action, slot, values };

    if (canOfferSeriesScope(slot)) {
      setPendingScopeRequest(request);
      return;
    }

    void runMutation(request, false);
  };

  const runMutation = async (
    request: PendingScopeRequest,
    applyToSeries: boolean
  ) => {
    if (!acquireMutationLock(mutationLock)) return;
    setMutationPending(true);

    try {
      if (request.action === 'save') {
        await saveEditedSlot(request.slot, applyToSeries, request.values);
      } else {
        await deleteSlot(request.slot, applyToSeries);
      }
    } catch {
      setFeedback('error');
    } finally {
      setMutationPending(false);
      releaseMutationLock(mutationLock);
    }
  };

  const confirmMutationScope = (applyToSeries: boolean) => {
    const request = pendingScopeRequest;
    if (!request) return;

    setPendingScopeRequest(null);
    void runMutation(request, applyToSeries);
  };

  const cancelMutationScope = () => {
    if (mutationPending) return;
    setPendingScopeRequest(null);
  };

  return {
    cancelEditing,
    cancelMutationScope,
    confirmMutationScope,
    createRange,
    editingSlotId,
    feedback,
    mutationPending,
    requestMutationScope,
    scopeSelectionAction: pendingScopeRequest?.action ?? null,
    selectedRange,
    selectedSlot,
    startEditing,
  };
}
