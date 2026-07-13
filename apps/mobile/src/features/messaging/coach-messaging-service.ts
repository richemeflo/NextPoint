import {
  coachMessageReplySchema,
  type BookingStatus,
  type Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type ThreadRow = Tables<'coach_message_threads'>;
type MessageRow = Tables<'coach_messages'>;
type BookingRow = Tables<'bookings'>;
type StudentProfileRow = Tables<'student_profiles'>;

export type CoachMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type CoachMessageContext = {
  bookingId: string;
  availabilitySlotId: string | null;
  studentId: string;
  studentName: string | null;
  lessonType: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  location: string;
};

export type CoachMessageThread = {
  id: string;
  coachId: string;
  coachReadAt: string | null;
  lastMessageAt: string;
  context: CoachMessageContext;
  messages: CoachMessage[];
};

export type CoachMessagingError =
  | 'invalid_message'
  | 'unauthorized'
  | 'not_found'
  | 'unknown';

type ThreadsResult =
  | { ok: true; data: CoachMessageThread[] }
  | { ok: false; error: CoachMessagingError };
type ThreadResult =
  | { ok: true; data: CoachMessageThread }
  | { ok: false; error: CoachMessagingError };
type MessageResult =
  | { ok: true; data: CoachMessage }
  | { ok: false; error: CoachMessagingError };

function mapMessage(row: MessageRow): CoachMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapMessagingError(code?: string): CoachMessagingError {
  if (code === '22023' || code === '23514') return 'invalid_message';
  if (code === '42501') return 'unauthorized';
  if (code === 'P0002') return 'not_found';
  return 'unknown';
}

function buildThread(
  thread: ThreadRow,
  booking: BookingRow,
  messages: MessageRow[],
  profile: StudentProfileRow | undefined
): CoachMessageThread {
  return {
    id: thread.id,
    coachId: thread.coach_id,
    coachReadAt: thread.coach_read_at,
    lastMessageAt: thread.last_message_at,
    context: {
      bookingId: booking.id,
      availabilitySlotId: booking.availability_slot_id,
      studentId: booking.student_id,
      studentName: profile?.full_name ?? null,
      lessonType: booking.lesson_type,
      status: booking.status,
      startsAt: booking.starts_at,
      endsAt: booking.ends_at,
      location: booking.location,
    },
    messages: messages.map(mapMessage),
  };
}

export async function getCoachMessageThreads(): Promise<ThreadsResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const threadsResult = await supabase
    .from('coach_message_threads')
    .select('*')
    .order('last_message_at', { ascending: false });

  if (threadsResult.error) {
    return { ok: false, error: mapMessagingError(threadsResult.error.code) };
  }

  const threads = threadsResult.data;
  if (threads.length === 0) return { ok: true, data: [] };

  const bookingIds = threads.map((thread) => thread.booking_id);
  const threadIds = threads.map((thread) => thread.id);
  const [bookingsResult, messagesResult] = await Promise.all([
    supabase.from('bookings').select('*').in('id', bookingIds),
    supabase
      .from('coach_messages')
      .select('*')
      .in('thread_id', threadIds)
      .order('created_at'),
  ]);

  if (bookingsResult.error || messagesResult.error) {
    return {
      ok: false,
      error: mapMessagingError(bookingsResult.error?.code ?? messagesResult.error?.code),
    };
  }

  const bookingsById = new Map(
    bookingsResult.data.map((booking) => [booking.id, booking])
  );
  const messagesByThreadId = new Map<string, MessageRow[]>();
  for (const message of messagesResult.data) {
    const current = messagesByThreadId.get(message.thread_id) ?? [];
    current.push(message);
    messagesByThreadId.set(message.thread_id, current);
  }

  const studentIds = Array.from(
    new Set(bookingsResult.data.map((booking) => booking.student_id))
  );
  const profilesResult = await supabase
    .from('student_profiles')
    .select('*')
    .in('user_id', studentIds);

  if (profilesResult.error) {
    return { ok: false, error: mapMessagingError(profilesResult.error.code) };
  }

  const profilesById = new Map(
    profilesResult.data.map((profile) => [profile.user_id, profile])
  );
  const data = threads.flatMap((thread) => {
    const booking = bookingsById.get(thread.booking_id);
    if (!booking) return [];

    return [
      buildThread(
        thread,
        booking,
        messagesByThreadId.get(thread.id) ?? [],
        profilesById.get(booking.student_id)
      ),
    ];
  });

  return { ok: true, data };
}

export async function markCoachMessageThreadRead(
  thread: CoachMessageThread
): Promise<ThreadResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const { data, error } = await supabase.rpc('mark_coach_message_thread_read', {
    p_thread_id: thread.id,
  });

  if (error || !data) {
    return { ok: false, error: mapMessagingError(error?.code) };
  }

  return {
    ok: true,
    data: {
      ...thread,
      coachReadAt: data.coach_read_at,
      lastMessageAt: data.last_message_at,
    },
  };
}

export async function sendCoachMessage(
  threadId: string,
  body: string
): Promise<MessageResult> {
  if (!supabase) return { ok: false, error: 'unknown' };

  const parsed = coachMessageReplySchema.safeParse({ threadId, body });
  if (!parsed.success) return { ok: false, error: 'invalid_message' };

  const { data, error } = await supabase.rpc('send_coach_message', {
    p_thread_id: parsed.data.threadId,
    p_body: parsed.data.body,
  });

  if (error || !data) {
    return { ok: false, error: mapMessagingError(error?.code) };
  }

  return { ok: true, data: mapMessage(data) };
}
