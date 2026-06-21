import type {
  AppLanguage,
  StudentProfileInput,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type StudentProfileRow = Tables<'student_profiles'>;

export type StudentProfile = StudentProfileInput & {
  updatedAt: string;
};

export type StudentProfileResult =
  | { ok: true; data: StudentProfile | null }
  | { ok: false };

function mapStudentProfile(row: StudentProfileRow): StudentProfile {
  return {
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    padelLevel: row.padel_level,
    age: row.age,
    preferredLanguage: row.preferred_language as AppLanguage,
    updatedAt: row.updated_at,
  };
}

export async function getStudentProfile(
  userId: string
): Promise<StudentProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapStudentProfile(data) : null };
}

export async function saveStudentProfile(
  userId: string,
  profile: StudentProfileInput
): Promise<StudentProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(
      {
        user_id: userId,
        full_name: profile.fullName,
        phone: profile.phone,
        email: profile.email,
        padel_level: profile.padelLevel,
        age: profile.age,
        preferred_language: profile.preferredLanguage,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) return { ok: false };
  return { ok: true, data: mapStudentProfile(data) };
}
