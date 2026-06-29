import type {
  LessonPackInput,
  LessonPackStatus,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type LessonPackRow = Tables<'lesson_packs'>;

export type LessonPack = {
  id: string;
  studentId: string;
  includedSessions: number;
  usedSessions: number;
  remainingSessions: number;
  status: LessonPackStatus;
  createdAt: string;
};

type LessonPacksResult =
  | { ok: true; data: LessonPack[] }
  | { ok: false };

type LessonPackResult =
  | { ok: true; data: LessonPack }
  | { ok: false; code?: 'active_pack_exists' };

function mapLessonPack(row: LessonPackRow): LessonPack {
  return {
    id: row.id,
    studentId: row.student_id,
    includedSessions: row.included_sessions,
    usedSessions: row.used_sessions,
    remainingSessions:
      row.remaining_sessions ?? row.included_sessions - row.used_sessions,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getStudentLessonPacks(
  studentId: string
): Promise<LessonPacksResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('lesson_packs')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) return { ok: false };
  return { ok: true, data: data.map(mapLessonPack) };
}

export async function assignLessonPack(
  studentId: string,
  input: LessonPackInput
): Promise<LessonPackResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('assign_lesson_pack', {
    p_student_id: studentId,
    p_included_sessions: input.includedSessions,
  });

  if (error || !data) {
    return {
      ok: false,
      code: error?.code === '23505' ? 'active_pack_exists' : undefined,
    };
  }

  return { ok: true, data: mapLessonPack(data) };
}
