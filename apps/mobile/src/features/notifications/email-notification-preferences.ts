export type EmailNotificationPreferences = {
  studentBookingConfirmed: boolean;
  studentBookingCancelled: boolean;
  coachStudentCancellation: boolean;
  coachWeeklyReminderEnabled: boolean;
  coachWeeklyReminderIsoWeekday: number;
  coachWeeklyReminderTime: string;
};

export const defaultEmailNotificationPreferences: EmailNotificationPreferences = {
  studentBookingConfirmed: false,
  studentBookingCancelled: false,
  coachStudentCancellation: false,
  coachWeeklyReminderEnabled: false,
  coachWeeklyReminderIsoWeekday: 5,
  coachWeeklyReminderTime: '18:00',
};

export function isValidReminderTime(value: string) {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
