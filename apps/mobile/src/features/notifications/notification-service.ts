import type {
  NotificationLinkType,
  NotificationType,
  PushPermissionStatus,
  PushProvider,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';
import {
  buildNotificationCursorFilter,
  getNotificationCursor,
  notificationPageSize,
  type NotificationCursor,
} from '@/features/notifications/notification-pagination';

type NotificationRow = Tables<'notifications'>;
type PushPreferenceRow = Tables<'notification_push_preferences'>;

type NotificationBookingSchedule = {
  startsAt: string;
  endsAt: string;
};

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
  bookingStartsAt: string | null;
  bookingEndsAt: string | null;
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

export type NotificationsPage = {
  data: AppNotification[];
  hasMore: boolean;
  nextCursor: NotificationCursor | null;
};
export type NotificationsPageResult =
  | { ok: true; data: NotificationsPage }
  | { ok: false };
export type UnreadNotificationCountResult =
  | { ok: true; count: number }
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

function mapNotification(
  row: NotificationRow,
  bookingSchedule?: NotificationBookingSchedule
): AppNotification {
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
    bookingStartsAt: bookingSchedule?.startsAt ?? null,
    bookingEndsAt: bookingSchedule?.endsAt ?? null,
  };
}

function mapPushPreference(row: PushPreferenceRow): PushPreference {
  return {
    permissionStatus: row.permission_status,
    provider: row.provider,
    updatedAt: row.updated_at,
  };
}

export async function getNotificationsPage({
  cursor = null,
  limit = notificationPageSize,
}: {
  cursor?: NotificationCursor | null;
  limit?: number;
} = {}): Promise<NotificationsPageResult> {
  if (!supabase) return { ok: false };

  const pageLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageLimit + 1);

  if (cursor) {
    query = query.or(buildNotificationCursorFilter(cursor));
  }

  const { data, error } = await query;

  if (error) return { ok: false };
  const pageRows = data.slice(0, pageLimit);
  const notificationIdsWithBooking = pageRows
    .filter((row) => row.booking_id)
    .map((row) => row.id);
  const bookingSchedules = new Map<string, NotificationBookingSchedule>();

  if (notificationIdsWithBooking.length > 0) {
    const { data: scheduleRows, error: scheduleError } = await supabase.rpc(
      'get_notification_booking_schedules',
      { p_notification_ids: notificationIdsWithBooking }
    );

    if (scheduleError) return { ok: false };
    for (const row of scheduleRows) {
      bookingSchedules.set(row.notification_id, {
        startsAt: row.starts_at,
        endsAt: row.ends_at,
      });
    }
  }

  const notifications = pageRows.map((row) =>
    mapNotification(row, bookingSchedules.get(row.id))
  );
  return {
    ok: true,
    data: {
      data: notifications,
      hasMore: data.length > pageLimit,
      nextCursor: getNotificationCursor(notifications),
    },
  };
}

export async function getUnreadNotificationCount(): Promise<
  UnreadNotificationCountResult
> {
  if (!supabase) return { ok: false };

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);

  if (error || typeof count !== 'number') return { ok: false };
  return { ok: true, count };
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

export async function deleteNotification(
  notificationId: string
): Promise<{ ok: true; id: string } | { ok: false }> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('delete_notification', {
    p_notification_id: notificationId,
  });

  if (error || data !== notificationId) return { ok: false };
  return { ok: true, id: data };
}
