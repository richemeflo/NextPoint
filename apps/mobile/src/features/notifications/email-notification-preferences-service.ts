import type { Tables } from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

import {
  defaultEmailNotificationPreferences,
  isValidReminderTime,
  type EmailNotificationPreferences,
} from './email-notification-preferences';

type EmailPreferenceRow = Tables<'notification_email_preferences'>;

function mapPreferences(row: EmailPreferenceRow): EmailNotificationPreferences {
  return {
    studentBookingConfirmed: row.student_booking_confirmed,
    studentBookingCancelled: row.student_booking_cancelled,
    coachStudentCancellation: row.coach_student_cancellation,
    coachWeeklyReminderEnabled: row.coach_weekly_reminder_enabled,
    coachWeeklyReminderIsoWeekday: row.coach_weekly_reminder_iso_weekday,
    coachWeeklyReminderTime: row.coach_weekly_reminder_time.slice(0, 5),
  };
}

export async function getEmailNotificationPreferences(userId: string) {
  if (!supabase) return { ok: false } as const;

  const { data, error } = await supabase
    .from('notification_email_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { ok: false } as const;
  return {
    ok: true,
    data: data ? mapPreferences(data) : defaultEmailNotificationPreferences,
  } as const;
}

export async function saveStudentEmailNotificationPreferences(
  preferences: Pick<
    EmailNotificationPreferences,
    'studentBookingConfirmed' | 'studentBookingCancelled'
  >
) {
  if (!supabase) return { ok: false } as const;

  const { data, error } = await supabase.rpc(
    'update_student_email_preferences',
    {
      p_booking_confirmed: preferences.studentBookingConfirmed,
      p_booking_cancelled: preferences.studentBookingCancelled,
    }
  );

  if (error || !data) return { ok: false } as const;
  return { ok: true, data: mapPreferences(data) } as const;
}

export async function saveCoachEmailNotificationPreferences(
  preferences: Pick<
    EmailNotificationPreferences,
    | 'coachStudentCancellation'
    | 'coachWeeklyReminderEnabled'
    | 'coachWeeklyReminderIsoWeekday'
    | 'coachWeeklyReminderTime'
  >
) {
  if (
    !supabase ||
    !Number.isInteger(preferences.coachWeeklyReminderIsoWeekday) ||
    preferences.coachWeeklyReminderIsoWeekday < 1 ||
    preferences.coachWeeklyReminderIsoWeekday > 7 ||
    !isValidReminderTime(preferences.coachWeeklyReminderTime)
  ) {
    return { ok: false } as const;
  }

  const { data, error } = await supabase.rpc('update_coach_email_preferences', {
    p_student_cancellation: preferences.coachStudentCancellation,
    p_weekly_reminder_enabled: preferences.coachWeeklyReminderEnabled,
    p_weekly_reminder_iso_weekday: preferences.coachWeeklyReminderIsoWeekday,
    p_weekly_reminder_time: preferences.coachWeeklyReminderTime,
  });

  if (error || !data) return { ok: false } as const;
  return { ok: true, data: mapPreferences(data) } as const;
}
