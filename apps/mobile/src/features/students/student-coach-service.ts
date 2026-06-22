import type {
  ManualStudentProfileInput,
  StudentAccountStatus,
  StudentSex,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type RelationshipRow = Tables<'student_coach_relationships'>;
type StudentProfileRow = Tables<'student_profiles'>;

export type StudentCoachAssociation = {
  id: string;
  coachId: string;
  studentId: string;
  status: RelationshipRow['status'];
  associationMethod: RelationshipRow['association_method'];
  createdAt: string;
};

export type AssociatedStudent = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  padelLevel: number;
  age: number;
  sex: StudentSex;
  accountStatus: StudentAccountStatus;
};

type AssociationResult =
  | { ok: true; data: StudentCoachAssociation | null }
  | { ok: false };

type AssociatedStudentsResult =
  | { ok: true; data: AssociatedStudent[] }
  | { ok: false };

type AssociatedStudentResult =
  | { ok: true; data: AssociatedStudent }
  | { ok: false; code?: string };

function mapAssociation(row: RelationshipRow): StudentCoachAssociation {
  return {
    id: row.id,
    coachId: row.coach_id,
    studentId: row.student_id,
    status: row.status,
    associationMethod: row.association_method,
    createdAt: row.created_at,
  };
}

function mapStudent(row: StudentProfileRow): AssociatedStudent {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    padelLevel: row.padel_level,
    age: row.age,
    sex: row.sex,
    accountStatus: row.account_status,
  };
}

export async function getStudentCoachAssociation(
  studentId: string
): Promise<AssociationResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('student_coach_relationships')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapAssociation(data) : null };
}

export async function getAssociatedStudents(
  coachId: string
): Promise<AssociatedStudentsResult> {
  if (!supabase) return { ok: false };

  const relationships = await supabase
    .from('student_coach_relationships')
    .select('student_id')
    .eq('coach_id', coachId)
    .eq('status', 'active');

  if (relationships.error) return { ok: false };

  const studentIds = relationships.data.map(({ student_id }) => student_id);
  if (studentIds.length === 0) return { ok: true, data: [] };

  const profiles = await supabase
    .from('student_profiles')
    .select('*')
    .in('user_id', studentIds)
    .order('full_name');

  if (profiles.error) return { ok: false };
  return { ok: true, data: profiles.data.map(mapStudent) };
}

export async function createManualStudent(
  profile: ManualStudentProfileInput
): Promise<AssociatedStudentResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.functions.invoke(
    'create-manual-student',
    { body: profile }
  );

  if (error || !data?.ok || !data.data) {
    return { ok: false, code: data?.error?.code };
  }

  return { ok: true, data: mapStudent(data.data) };
}
