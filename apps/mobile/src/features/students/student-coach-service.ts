import {
  createManualStudentResponseSchema,
  type ManualStudentProfileInput,
  type StudentAccountStatus,
  type StudentHistoryEventStatus,
  type StudentHistoryEventType,
  type StudentSex,
  type Database,
  type Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type RelationshipRow = Tables<'student_coach_relationships'>;
type StudentHistoryRow = Tables<'student_history_events'>;
type StudentProfileRow = Tables<'student_profiles'>;

export type StudentCoachAssociation = {
  id: string;
  coachId: string;
  studentId: string;
  status: RelationshipRow['status'];
  associationMethod: RelationshipRow['association_method'];
  createdAt: string;
};

export type CompleteAssociatedStudent = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  padelLevel: number;
  age: number;
  sex: StudentSex;
  accountStatus: StudentAccountStatus;
  profileComplete: true;
};

export type AssociatedStudent =
  | CompleteAssociatedStudent
  | {
      userId: string;
      fullName: string;
      email: string;
      phone: null;
      padelLevel: null;
      age: null;
      sex: null;
      accountStatus: null;
      profileComplete: false;
    };

export type StudentHistoryEvent = {
  id: string;
  eventType: StudentHistoryEventType;
  status: StudentHistoryEventStatus;
  title: string;
  description: string | null;
  occurredAt: string;
};

export type AssociatedStudentDetail = {
  student: AssociatedStudent;
  history: StudentHistoryEvent[];
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

type AssociatedStudentDetailResult =
  | { ok: true; data: AssociatedStudentDetail }
  | { ok: false; code: 'not_found' | 'load_failed' };

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

function mapStudent(row: StudentProfileRow): CompleteAssociatedStudent {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    padelLevel: row.padel_level,
    age: row.age,
    sex: row.sex,
    accountStatus: row.account_status,
    profileComplete: true,
  };
}

type AssociatedStudentReadRow =
  Database['public']['Functions']['get_associated_students']['Returns'][number];

function mapAssociatedStudent(row: AssociatedStudentReadRow): AssociatedStudent {
  if (
    row.profile_complete &&
    row.phone !== null &&
    row.padel_level !== null &&
    row.age !== null &&
    row.sex !== null &&
    row.account_status !== null
  ) {
    return {
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      padelLevel: row.padel_level,
      age: row.age,
      sex: row.sex,
      accountStatus: row.account_status,
      profileComplete: true,
    };
  }

  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: null,
    padelLevel: null,
    age: null,
    sex: null,
    accountStatus: null,
    profileComplete: false,
  };
}

function mapHistoryEvent(row: StudentHistoryRow): StudentHistoryEvent {
  return {
    id: row.id,
    eventType: row.event_type,
    status: row.status,
    title: row.title,
    description: row.description,
    occurredAt: row.occurred_at,
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

  const students = await supabase.rpc('get_associated_students', {
    p_coach_id: coachId,
  });

  if (students.error) return { ok: false };
  return { ok: true, data: students.data.map(mapAssociatedStudent) };
}

export async function getAssociatedStudentDetail(
  studentId: string
): Promise<AssociatedStudentDetailResult> {
  if (!supabase) return { ok: false, code: 'load_failed' };

  const session = await supabase.auth.getSession();
  const coachId = session.data.session?.user.id;
  if (session.error || !coachId) {
    return { ok: false, code: 'load_failed' };
  }

  const students = await supabase.rpc('get_associated_students', {
    p_coach_id: coachId,
  });

  if (students.error) return { ok: false, code: 'load_failed' };
  const student = students.data.find((item) => item.user_id === studentId);
  if (!student) return { ok: false, code: 'not_found' };

  const history = await supabase
    .from('student_history_events')
    .select('*')
    .eq('student_id', studentId)
    .order('occurred_at', { ascending: false });

  if (history.error) return { ok: false, code: 'load_failed' };

  return {
    ok: true,
    data: {
      student: mapAssociatedStudent(student),
      history: history.data.map(mapHistoryEvent),
    },
  };
}

export async function createManualStudent(
  profile: ManualStudentProfileInput
): Promise<AssociatedStudentResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.functions.invoke(
    'create-manual-student',
    { body: profile }
  );
  const parsed = createManualStudentResponseSchema.safeParse(data as unknown);

  if (error || !parsed.success) return { ok: false };
  if (!parsed.data.ok) return { ok: false, code: parsed.data.error.code };

  return { ok: true, data: mapStudent(parsed.data.data) };
}
