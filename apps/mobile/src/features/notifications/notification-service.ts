import type {
  NotificationLinkType,
  NotificationType,
  PushPermissionStatus,
  PushProvider,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type NotificationRow = Tables<'notifications'>;
type PushPreferenceRow = Tables<'notification_push_preferences'>;

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  linkType: NotificationLinkType | null;
  linkId: string | null;
  bookingId: string | null;
};

export type PushPreference = {
  permissionStatus: PushPermissionStatus;
  provider: PushProvider;
  updatedAt: string;
};

export type PushPreferenceInput = {
  permissionStatus: PushPermissionStatus;
  provider: PushProvider;
  deviceId?: string | null;
  token?: string | null;
};

export type NotificationsResult =
  | { ok: true; data: AppNotification[] }
  | { ok: false };
export type PushPreferenceResult =
  | { ok: true; data: PushPreference | null }
  | { ok: false };
export type NotificationMutationResult =
  | { ok: true; data: AppNotification }
  | { ok: false };
export type PushPreferenceMutationResult =
  | { ok: true; data: PushPreference }
  | { ok: false };

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
    linkType: row.link_type,
    linkId: row.link_id,
    bookingId: row.booking_id,
  };
}

function mapPushPreference(row: PushPreferenceRow): PushPreference {
  return {
    permissionStatus: row.permission_status,
    provider: row.provider,
    updatedAt: row.updated_at,
  };
}

export async function getNotifications(limit = 50): Promise<NotificationsResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { ok: false };
  return { ok: true, data: data.map(mapNotification) };
}

export async function getPushPreference(): Promise<PushPreferenceResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('notification_push_preferences')
    .select('*')
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapPushPreference(data) : null };
}

export async function updatePushPreference(
  input: PushPreferenceInput
): Promise<PushPreferenceMutationResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc(
    'update_push_notification_preference',
    {
      p_permission_status: input.permissionStatus,
      p_provider: input.provider,
      p_device_id: input.deviceId ?? '',
      p_token: input.token ?? '',
    }
  );

  if (error || !data) return { ok: false };
  return { ok: true, data: mapPushPreference(data) };
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationMutationResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('mark_notification_read', {
    p_notification_id: notificationId,
  });

  if (error || !data) return { ok: false };
  return { ok: true, data: mapNotification(data) };
}

export async function markAllNotificationsRead(): Promise<
  { ok: true; count: number } | { ok: false }
> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('mark_all_notifications_read');

  if (error || typeof data !== 'number') return { ok: false };
  return { ok: true, count: data };
}

export async function processPendingPushNotifications(): Promise<void> {
  if (!supabase) return;

  await supabase.functions
    .invoke('send-pending-push-notifications')
    .catch(() => null);
}
