export const lessonPackPageSize = 10;

export type LessonPackCursor = {
  createdAt: string;
  id: string;
};

type CursorLessonPack = LessonPackCursor;

export function buildLessonPackCursorFilter(cursor: LessonPackCursor) {
  return `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`;
}

export function getLessonPackCursor(
  packs: CursorLessonPack[],
): LessonPackCursor | null {
  const lastPack = packs.at(-1);
  return lastPack ? { createdAt: lastPack.createdAt, id: lastPack.id } : null;
}

export function mergeLessonPackPages<Pack extends { id: string }>(
  current: Pack[],
  next: Pack[],
) {
  const knownIds = new Set(current.map((pack) => pack.id));
  return [...current, ...next.filter((pack) => !knownIds.has(pack.id))];
}
