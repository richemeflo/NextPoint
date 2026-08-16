import { useCallback, useEffect, useRef, useState } from 'react';

import {
  getStudentLessonPacksPage,
  type LessonPack,
} from '@/features/lesson-packs/lesson-pack-service';
import {
  mergeLessonPackPages,
  type LessonPackCursor,
} from '@/features/lesson-packs/lesson-pack-pagination';

type LoadState = 'loading' | 'ready' | 'error';
type LoadMoreState = 'idle' | 'loading' | 'error';

export function useStudentLessonPacks(studentId: string) {
  const [packs, setPacks] = useState<LessonPack[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>('idle');
  const cursor = useRef<LessonPackCursor | null>(null);
  const hasMore = useRef(false);
  const loadMoreLock = useRef(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = requestVersion.current + 1;
    requestVersion.current = version;
    cursor.current = null;
    hasMore.current = false;
    loadMoreLock.current = false;
    setPacks([]);
    setLoadState('loading');
    setLoadMoreState('idle');

    void getStudentLessonPacksPage(studentId)
      .then((result) => {
        if (requestVersion.current !== version) return;
        if (!result.ok) {
          setLoadState('error');
          return;
        }

        setPacks(result.data.data);
        cursor.current = result.data.nextCursor;
        hasMore.current = result.data.hasMore;
        setLoadState('ready');
      })
      .catch(() => {
        if (requestVersion.current === version) setLoadState('error');
      });

    return () => {
      if (requestVersion.current === version) requestVersion.current += 1;
    };
  }, [studentId]);

  const loadMore = useCallback(async () => {
    if (
      loadState !== 'ready' ||
      loadMoreLock.current ||
      !hasMore.current ||
      !cursor.current
    ) {
      return;
    }

    const version = requestVersion.current;
    loadMoreLock.current = true;
    setLoadMoreState('loading');
    try {
      const result = await getStudentLessonPacksPage(studentId, {
        cursor: cursor.current,
      });
      if (requestVersion.current !== version) return;
      if (!result.ok) {
        setLoadMoreState('error');
        return;
      }

      setPacks((current) => mergeLessonPackPages(current, result.data.data));
      cursor.current = result.data.nextCursor;
      hasMore.current = result.data.hasMore;
      setLoadMoreState('idle');
    } catch {
      if (requestVersion.current === version) setLoadMoreState('error');
    } finally {
      if (requestVersion.current === version) loadMoreLock.current = false;
    }
  }, [loadState, studentId]);

  const prependPack = useCallback((pack: LessonPack) => {
    setPacks((current) => [
      pack,
      ...current.filter((currentPack) => currentPack.id !== pack.id),
    ]);
  }, []);

  const replacePack = useCallback((pack: LessonPack) => {
    setPacks((current) =>
      current.map((currentPack) =>
        currentPack.id === pack.id ? pack : currentPack,
      ),
    );
  }, []);

  return {
    loadMore,
    loadMoreState,
    loadState,
    packs,
    prependPack,
    replacePack,
  };
}
