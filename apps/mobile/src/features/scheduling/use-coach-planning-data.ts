import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getCoachBookingsInRange,
  type Booking,
} from '@/features/bookings/booking-service';
import {
  getCoachPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import {
  getCoachAvailabilitySlotsInRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
} from '@/features/scheduling/latest-planning-request';
import { createScreenReferenceCache } from '@/features/scheduling/screen-reference-cache';
import {
  getAssociatedStudents,
  type AssociatedStudent,
} from '@/features/students/student-coach-service';

type PlanningLoadState = 'loading' | 'ready' | 'error';

type CoachPlanningData = {
  slots: AvailabilitySlot[];
  bookings: Booking[];
  students: AssociatedStudent[];
  pricingRates: PricingRate[];
  loadState: PlanningLoadState;
  isRefreshing: boolean;
  queryKey: string | null;
};

const initialState: CoachPlanningData = {
  slots: [],
  bookings: [],
  students: [],
  pricingRates: [],
  loadState: 'loading',
  isRefreshing: false,
  queryKey: null,
};

type CoachPlanningReferences = {
  students: AssociatedStudent[];
  pricingRates: PricingRate[];
};

async function loadCoachPlanningReferences(coachId: string) {
  const [studentsResult, pricingResult] = await Promise.all([
    getAssociatedStudents(coachId),
    getCoachPricingRates(coachId),
  ]);

  return studentsResult.ok && pricingResult.ok
    ? {
        ok: true as const,
        data: {
          students: studentsResult.data,
          pricingRates: pricingResult.data,
        },
      }
    : { ok: false as const };
}

export function useCoachPlanningData({
  coachId,
  startsAt,
  endsAt,
}: {
  coachId: string | undefined;
  startsAt: string;
  endsAt: string;
}) {
  const [state, setState] = useState<CoachPlanningData>(initialState);
  const requestVersion = useRef(0);
  const [planningReferenceCache] = useState(() =>
    createScreenReferenceCache<CoachPlanningReferences>()
  );
  const queryKey = coachId ? `${coachId}:${startsAt}:${endsAt}` : null;

  const loadPlanning = useCallback(async () => {
    const version = beginPlanningRequest(requestVersion);

    if (!coachId) {
      setState(initialState);
      return;
    }

    setState((current) => ({ ...current, isRefreshing: true }));

    try {
      const [slotsResult, bookingsResult, referencesResult] = await Promise.all(
        [
          getCoachAvailabilitySlotsInRange(coachId, startsAt, endsAt),
          getCoachBookingsInRange(coachId, startsAt, endsAt),
          planningReferenceCache.get(coachId, () =>
            loadCoachPlanningReferences(coachId)
          ),
        ]
      );

      if (!isLatestPlanningRequest(requestVersion, version)) return;

      if (!slotsResult.ok || !bookingsResult.ok || !referencesResult.ok) {
        setState((current) => ({
          ...current,
          loadState: 'error',
          queryKey,
        }));
        return;
      }

      setState({
        slots: slotsResult.data,
        bookings: bookingsResult.data,
        students: referencesResult.data.students,
        pricingRates: referencesResult.data.pricingRates,
        loadState: 'ready',
        isRefreshing: true,
        queryKey,
      });
    } catch {
      if (!isLatestPlanningRequest(requestVersion, version)) return;
      setState((current) => ({
        ...current,
        loadState: 'error',
        queryKey,
      }));
    } finally {
      if (isLatestPlanningRequest(requestVersion, version)) {
        setState((current) => ({ ...current, isRefreshing: false }));
      }
    }
  }, [coachId, endsAt, planningReferenceCache, queryKey, startsAt]);

  useEffect(() => {
    void Promise.resolve()
      .then(loadPlanning)
      .catch(() => undefined);

    return () => {
      invalidatePlanningRequest(requestVersion);
    };
  }, [loadPlanning]);

  return {
    ...state,
    loadState:
      state.queryKey === queryKey ? state.loadState : ('loading' as const),
    loadPlanning,
  };
}
