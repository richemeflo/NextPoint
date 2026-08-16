import { useCallback, useMemo, useState } from 'react';
import { getSchedulingToday } from '@nextpoint/shared';

import type { PlanningDisplayMode } from '@/features/scheduling/planning-controls';
import {
  getPlanningWindow,
  movePlanningAnchor,
  type PlanningViewMode,
} from '@/features/scheduling/planning-window';

export function usePlanningView(initialAnchorDate = getSchedulingToday()) {
  const [mode, setMode] = useState<PlanningViewMode>('week');
  const [displayMode, setDisplayMode] =
    useState<PlanningDisplayMode>('agenda');
  const [anchorDate, setAnchorDate] = useState(initialAnchorDate);
  const window = useMemo(
    () => getPlanningWindow(anchorDate, mode),
    [anchorDate, mode]
  );

  const move = useCallback(
    (direction: -1 | 1) => {
      setAnchorDate((current) =>
        movePlanningAnchor(current, mode, direction)
      );
    },
    [mode]
  );

  const goToToday = useCallback(() => {
    setAnchorDate(getSchedulingToday());
  }, []);

  return {
    anchorDate,
    displayMode,
    goToToday,
    mode,
    move,
    setAnchorDate,
    setDisplayMode,
    setMode,
    window,
  };
}
