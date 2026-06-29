import type { LessonPackStatus } from '@nextpoint/shared';

export type LessonPackStateItem = {
  id: string;
  includedSessions: number;
  usedSessions: number;
  remainingSessions: number;
  status: LessonPackStatus;
};

export type LessonPackConsumeDisabledReason = 'no_remaining_session';

export function getLessonPackConsumeDisabledReason(
  pack: LessonPackStateItem
): LessonPackConsumeDisabledReason | null {
  if (pack.remainingSessions <= 0 || pack.status === 'exhausted') {
    return 'no_remaining_session';
  }

  return null;
}

export function replaceConsumedLessonPack<TPack extends LessonPackStateItem>(
  packs: TPack[],
  consumedPack: TPack
): TPack[] {
  return packs.map((pack) =>
    pack.id === consumedPack.id ? consumedPack : pack
  );
}
