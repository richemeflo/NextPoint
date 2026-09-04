import type {
  LessonPackAdjustment,
  LessonPackInput,
  LessonPackStatus,
  PricingDuration,
  PricingLessonType,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';
import {
  buildLessonPackCursorFilter,
  getLessonPackCursor,
  lessonPackPageSize,
  type LessonPackCursor,
} from '@/features/lesson-packs/lesson-pack-pagination';
import { runLessonPackRequest } from '@/features/lesson-packs/lesson-pack-request';

type LessonPackRow = Tables<'lesson_packs'>;

export type LessonPack = {
  id: string;
  studentId: string;
  pricingRateId: string | null;
  lessonType: PricingLessonType;
  durationMinutes: PricingDuration;
  includedSessions: number;
  usedSessions: number;
  remainingSessions: number;
  status: LessonPackStatus;
  createdAt: string;
};

export type LessonPacksPage = {
  data: LessonPack[];
  hasMore: boolean;
  nextCursor: LessonPackCursor | null;
};

type LessonPacksPageResult =
  { ok: true; data: LessonPacksPage } | { ok: false };

type LessonPackResult =
  { ok: true; data: LessonPack } | { ok: false; code?: 'active_pack_exists' };

type AdjustLessonPackResult =
  { ok: true; data: LessonPack } | { ok: false; code: 'adjust_refused' };

type ConsumeLessonPackResult =
  { ok: true; data: LessonPack } | { ok: false; code: 'consume_refused' };

function mapLessonPack(row: LessonPackRow): LessonPack {
  return {
    id: row.id,
    studentId: row.student_id,
    pricingRateId: row.pricing_rate_id ?? null,
    lessonType: row.lesson_type as PricingLessonType,
    durationMinutes: row.duration_minutes as PricingDuration,
    includedSessions: row.included_sessions,
    usedSessions: row.used_sessions,
    remainingSessions:
      row.remaining_sessions ?? row.included_sessions - row.used_sessions,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getStudentLessonPacksPage(
  studentId: string,
  {
    cursor = null,
    limit = lessonPackPageSize,
  }: {
    cursor?: LessonPackCursor | null;
    limit?: number;
  } = {},
): Promise<LessonPacksPageResult> {
  if (!supabase) return { ok: false };

  const pageLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  let query = supabase
    .from('lesson_packs')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageLimit + 1);

  if (cursor) query = query.or(buildLessonPackCursorFilter(cursor));

  const { data, error } = await query;
  if (error) return { ok: false };
  const packs = data.slice(0, pageLimit).map(mapLessonPack);
  return {
    ok: true,
    data: {
      data: packs,
      hasMore: data.length > pageLimit,
      nextCursor: getLessonPackCursor(packs),
    },
  };
}

export async function assignLessonPack(
  studentId: string,
  input: LessonPackInput,
): Promise<LessonPackResult> {
  if (!supabase) return { ok: false };
  const client = supabase;

  const { data, error } = await runLessonPackRequest((signal) =>
    client
      .rpc('assign_lesson_pack', {
        p_student_id: studentId,
        p_included_sessions: input.includedSessions,
        p_pricing_rate_id: input.pricingRateId,
        p_lesson_type: input.lessonType,
        p_duration_minutes: input.durationMinutes,
      })
      .abortSignal(signal),
  );

  if (error || !data) {
    return {
      ok: false,
      code: error?.code === '23505' ? 'active_pack_exists' : undefined,
    };
  }

  return { ok: true, data: mapLessonPack(data) };
}

export async function adjustLessonPackSessions(
  packId: string,
  adjustment: LessonPackAdjustment,
): Promise<AdjustLessonPackResult> {
  if (!supabase) return { ok: false, code: 'adjust_refused' };
  const client = supabase;

  const { data, error } = await runLessonPackRequest((signal) =>
    client
      .rpc('adjust_lesson_pack_sessions', {
        p_pack_id: packId,
        p_delta: adjustment,
      })
      .abortSignal(signal),
  );

  if (error || !data) {
    return { ok: false, code: 'adjust_refused' };
  }

  return { ok: true, data: mapLessonPack(data) };
}

export async function consumeLessonPackSession(
  packId: string,
): Promise<ConsumeLessonPackResult> {
  if (!supabase) return { ok: false, code: 'consume_refused' };
  const client = supabase;

  const { data, error } = await runLessonPackRequest((signal) =>
    client
      .rpc('consume_lesson_pack_session', {
        p_pack_id: packId,
      })
      .abortSignal(signal),
  );

  if (error || !data) {
    return { ok: false, code: 'consume_refused' };
  }

  return { ok: true, data: mapLessonPack(data) };
}
