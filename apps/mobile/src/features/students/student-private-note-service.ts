import type {
  StudentPrivateNoteInput,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type StudentPrivateNoteRow = Tables<'student_private_notes'>;

export type StudentPrivateNote = {
  id: string;
  studentId: string;
  content: string;
  updatedAt: string;
};

type StudentPrivateNoteResult =
  | { ok: true; data: StudentPrivateNote | null }
  | { ok: false };

type SaveStudentPrivateNoteResult =
  | { ok: true; data: StudentPrivateNote }
  | { ok: false };

function mapPrivateNote(row: StudentPrivateNoteRow): StudentPrivateNote {
  return {
    id: row.id,
    studentId: row.student_id,
    content: row.content,
    updatedAt: row.updated_at,
  };
}

export async function getStudentPrivateNote(
  studentId: string
): Promise<StudentPrivateNoteResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('student_private_notes')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapPrivateNote(data) : null };
}

export async function saveStudentPrivateNote(
  studentId: string,
  input: StudentPrivateNoteInput
): Promise<SaveStudentPrivateNoteResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('save_student_private_note', {
    p_student_id: studentId,
    p_content: input.content,
  });

  if (error || !data) return { ok: false };
  return { ok: true, data: mapPrivateNote(data) };
}
