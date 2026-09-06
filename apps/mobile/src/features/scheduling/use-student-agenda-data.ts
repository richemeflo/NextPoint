import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getStudentBookingsInRange,
  type Booking,
} from '@/features/bookings/booking-service';
import {
  getStudentMinimumPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import {
  getStudentRequestableAvailabilitySlotsInRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import {
  beginPlanningRequest,
  invalidatePlanningRequest,
  isLatestPlanningRequest,
} from '@/features/scheduling/latest-planning-request';
import {
  createScreenReferenceCache,
  type ReferenceLoadResult,
} from '@/features/scheduling/screen-reference-cache';
import { isStudentAgendaDependencyReady } from '@/features/scheduling/student-agenda-load';

type AgendaLoadState = 'loading' | 'ready' | 'error';

type StudentAgendaData = {
  slots: AvailabilitySlot[];
  bookings: Booking[];
  pricingRates: PricingRate[];
  agendaLoadedAt: number | null;
  loadState: AgendaLoadState;
  isRefreshing: boolean;
  queryKey: string | null;
};

const initialState: StudentAgendaData = {
  slots: [],
  bookings: [],
  pricingRates: [],
  agendaLoadedAt: null,
  loadState: 'loading',
  isRefreshing: false,
  queryKey: null,
};

type StudentAgendaReferences = {
  pricingRates: PricingRate[];
};

const emptyStudentAgendaReferences: ReferenceLoadResult<StudentAgendaReferences> =
  {
    ok: true,
    data: { pricingRates: [] },
  };

async function loadStudentAgendaReferences() {
  const pricingResult = await getStudentMinimumPricingRates();

  return pricingResult.ok
    ? {
        ok: true as const,
        data: {
          pricingRates: pricingResult.data,
        },
      }
    : { ok: false as const };
}

export function useStudentAgendaData({
  includeRequestableSlots,
  startsAt,
  endsAt,
}: {
  includeRequestableSlots: boolean;
  startsAt: string;
  endsAt: string;
}) {
  const [state, setState] = useState<StudentAgendaData>(initialState);
  const requestVersion = useRef(0);
  const [agendaReferenceCache] = useState(() =>
    createScreenReferenceCache<StudentAgendaReferences>()
  );
  const queryKey = `${includeRequestableSlots}:${startsAt}:${endsAt}`;

  const loadAgenda = useCallback(async () => {
    const version = beginPlanningRequest(requestVersion);
    setState((current) => ({ ...current, isRefreshing: true }));

    try {
      const [slotsResult, bookingsResult, referencesResult] = await Promise.all(
        [
          includeRequestableSlots
            ? getStudentRequestableAvailabilitySlotsInRange(startsAt, endsAt)
            : Promise.resolve({ ok: true as const, data: [] }),
          getStudentBookingsInRange(startsAt, endsAt),
          includeRequestableSlots
            ? agendaReferenceCache.get(
                'requestable-booking-references',
                loadStudentAgendaReferences
              )
            : Promise.resolve(emptyStudentAgendaReferences),
        ]
      );

      if (!isLatestPlanningRequest(requestVersion, version)) return;

      if (
        !isStudentAgendaDependencyReady(slotsResult) ||
        !isStudentAgendaDependencyReady(bookingsResult) ||
        !isStudentAgendaDependencyReady(referencesResult)
      ) {
        setState((current) => ({
          ...current,
          loadState: 'error',
          queryKey,
        }));
        return;
      }

      setState((current) => ({
        slots: slotsResult.data,
        bookings: bookingsResult.data,
        pricingRates: referencesResult.data.pricingRates,
        agendaLoadedAt: Date.now(),
        loadState: 'ready',
        isRefreshing: true,
        queryKey,
      }));
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
  }, [
    agendaReferenceCache,
    endsAt,
    includeRequestableSlots,
    queryKey,
    startsAt,
  ]);

  useEffect(() => {
    void Promise.resolve()
      .then(loadAgenda)
      .catch(() => undefined);

    return () => {
      invalidatePlanningRequest(requestVersion);
    };
  }, [loadAgenda]);

  const updateBookings = useCallback(
    (update: (current: Booking[]) => Booking[]) => {
      setState((current) => ({
        ...current,
        bookings: update(current.bookings),
      }));
    },
    []
  );

  return {
    ...state,
    loadState:
      state.queryKey === queryKey ? state.loadState : ('loading' as const),
    loadAgenda,
    updateBookings,
  };
}
