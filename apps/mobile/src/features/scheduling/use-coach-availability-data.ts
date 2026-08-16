import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getCoachAvailabilityRanges,
  getCoachAvailabilitySlots,
  type AvailabilityRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';

type AvailabilityLoadState = 'error' | 'loading' | 'ready';

type CoachAvailabilityData = {
  coachId: string | null;
  loadState: AvailabilityLoadState;
  ranges: AvailabilityRange[];
  slots: AvailabilitySlot[];
};

const initialState: CoachAvailabilityData = {
  coachId: null,
  loadState: 'loading',
  ranges: [],
  slots: [],
};

export function useCoachAvailabilityData(coachId: string | undefined) {
  const [state, setState] = useState<CoachAvailabilityData>(initialState);
  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;

    if (!coachId) {
      setState(initialState);
      return;
    }

    try {
      const [rangesResult, slotsResult] = await Promise.all([
        getCoachAvailabilityRanges(coachId),
        getCoachAvailabilitySlots(coachId),
      ]);

      if (version !== requestVersion.current) return;

      if (!rangesResult.ok || !slotsResult.ok) {
        setState((current) => ({
          ...current,
          coachId,
          loadState: 'error',
        }));
        return;
      }

      setState({
        coachId,
        loadState: 'ready',
        ranges: rangesResult.data,
        slots: slotsResult.data,
      });
    } catch {
      if (version !== requestVersion.current) return;
      setState((current) => ({
        ...current,
        coachId,
        loadState: 'error',
      }));
    }
  }, [coachId]);

  useEffect(() => {
    void refresh();

    return () => {
      requestVersion.current += 1;
    };
  }, [refresh]);

  return {
    ...state,
    loadState:
      state.coachId === (coachId ?? null)
        ? state.loadState
        : ('loading' as const),
    refresh,
  };
}
