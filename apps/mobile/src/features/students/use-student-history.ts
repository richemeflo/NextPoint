import type { StudentHistoryEventStatus } from '@nextpoint/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getAssociatedStudentHistoryPage,
  type StudentHistoryEvent,
} from '@/features/students/student-coach-service';
import {
  mergeStudentHistoryPages,
  type StudentHistoryCursor,
} from '@/features/students/student-history-pagination';
import { getStudentHistoryDisplayEvents } from '@/features/students/student-history-view';

type LoadState = 'loading' | 'ready' | 'error';
type LoadMoreState = 'idle' | 'loading' | 'error';

export function useStudentHistory(
  studentId: string,
  status?: StudentHistoryEventStatus,
) {
  const [rawEvents, setRawEvents] = useState<StudentHistoryEvent[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>('idle');
  const cursor = useRef<StudentHistoryCursor | null>(null);
  const hasMore = useRef(false);
  const loadMoreLock = useRef(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    const version = requestVersion.current + 1;
    requestVersion.current = version;
    cursor.current = null;
    hasMore.current = false;
    loadMoreLock.current = false;
    setRawEvents([]);
    setLoadMoreState('idle');

    if (!studentId) {
      setLoadState('loading');
      return undefined;
    }

    setLoadState('loading');
    void getAssociatedStudentHistoryPage(studentId, { status })
      .then((result) => {
        if (requestVersion.current !== version) return;
        if (!result.ok) {
          setLoadState('error');
          return;
        }

        setRawEvents(result.data.data);
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
  }, [status, studentId]);

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
      const result = await getAssociatedStudentHistoryPage(studentId, {
        cursor: cursor.current,
        status,
      });
      if (requestVersion.current !== version) return;
      if (!result.ok) {
        setLoadMoreState('error');
        return;
      }

      setRawEvents((current) =>
        mergeStudentHistoryPages(current, result.data.data),
      );
      cursor.current = result.data.nextCursor;
      hasMore.current = result.data.hasMore;
      setLoadMoreState('idle');
    } catch {
      if (requestVersion.current === version) setLoadMoreState('error');
    } finally {
      if (requestVersion.current === version) loadMoreLock.current = false;
    }
  }, [loadState, status, studentId]);

  const events = useMemo(
    () => getStudentHistoryDisplayEvents(rawEvents),
    [rawEvents],
  );

  return { events, loadMore, loadMoreState, loadState };
}
