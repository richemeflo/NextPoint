import {
  maximumLessonPackSessions,
  type LessonPackAdjustment,
  type LessonPackStatus,
} from '@nextpoint/shared';

export type LessonPackStateItem = {
  id: string;
  includedSessions: number;
  usedSessions: number;
  remainingSessions: number;
  status: LessonPackStatus;
};

export type LessonPackAdjustmentDisabledReason =
  | 'no_remaining_session'
  | 'minimum_included_sessions'
  | 'maximum_included_sessions';

export type LessonPackConsumptionDisabledReason = 'no_remaining_session';

export function getLessonPackAdjustmentDisabledReason(
  pack: LessonPackStateItem,
  adjustment: LessonPackAdjustment
): LessonPackAdjustmentDisabledReason | null {
  if (
    adjustment === -1 &&
    (pack.includedSessions <= pack.usedSessions ||
      pack.remainingSessions <= 0 ||
      pack.status === 'exhausted')
  ) {
    return 'no_remaining_session';
  }

  if (adjustment === -1 && pack.includedSessions <= 1) {
    return 'minimum_included_sessions';
  }

  if (
    adjustment === 1 &&
    pack.includedSessions >= maximumLessonPackSessions
  ) {
    return 'maximum_included_sessions';
  }

  return null;
}

export function getLessonPackConsumptionDisabledReason(
  pack: LessonPackStateItem
): LessonPackConsumptionDisabledReason | null {
  if (pack.remainingSessions <= 0 || pack.status === 'exhausted') {
    return 'no_remaining_session';
  }

  return null;
}

export function replaceAdjustedLessonPack<TPack extends LessonPackStateItem>(
  packs: TPack[],
  adjustedPack: TPack
): TPack[] {
  return packs.map((pack) =>
    pack.id === adjustedPack.id ? adjustedPack : pack
  );
}
