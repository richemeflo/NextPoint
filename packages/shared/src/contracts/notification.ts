import { z } from 'zod';

export const notificationTypes = [
  'booking_requested',
  'booking_approved',
  'booking_refused',
  'booking_cancelled',
  'booking_modified',
] as const;

export const notificationLinkTypes = ['booking'] as const;
export const notificationReadStates = ['read', 'unread'] as const;
export const pushPermissionStatuses = [
  'granted',
  'denied',
  'undetermined',
  'unavailable',
] as const;
export const pushProviders = ['expo', 'web', 'none'] as const;

export const notificationTitleMaxLength = 120;
export const notificationBodyMaxLength = 500;

export type NotificationType = (typeof notificationTypes)[number];
export type NotificationLinkType = (typeof notificationLinkTypes)[number];
export type NotificationReadState = (typeof notificationReadStates)[number];
export type PushPermissionStatus = (typeof pushPermissionStatuses)[number];
export type PushProvider = (typeof pushProviders)[number];

export type NotificationReadCandidate = {
  recipientId: string;
  actorId: string;
  readAt: string | null;
};

export type NotificationLinkCandidate = {
  linkType: NotificationLinkType | null;
  linkId: string | null;
};

export const pushPreferenceSchema = z.object({
  permissionStatus: z.enum(pushPermissionStatuses),
  provider: z.enum(pushProviders),
  deviceId: z.string().trim().max(120).nullable().optional(),
  token: z.string().trim().min(1).max(512).nullable().optional(),
});

export const notificationMarkReadSchema = z.object({
  notificationId: z.uuid(),
});

export type PushPreferenceInput = z.infer<typeof pushPreferenceSchema>;
export type NotificationMarkReadInput = z.infer<typeof notificationMarkReadSchema>;

export function getNotificationReadState(
  readAt: string | null
): NotificationReadState {
  return readAt ? 'read' : 'unread';
}

export function canMarkNotificationRead(
  candidate: NotificationReadCandidate
): boolean {
  return candidate.recipientId === candidate.actorId;
}

export function resolveNotificationLink(
  candidate: NotificationLinkCandidate,
  role: 'coach' | 'eleve'
) {
  if (candidate.linkType !== 'booking' || !candidate.linkId) {
    return null;
  }

  return role === 'coach' ? '/coach' : '/eleve/planning';
}
