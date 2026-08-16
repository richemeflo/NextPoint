export const notificationPageSize = 50;

export type NotificationCursor = {
  createdAt: string;
  id: string;
};

type CursorNotification = NotificationCursor;

export function buildNotificationCursorFilter(cursor: NotificationCursor) {
  return `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`;
}

export function getNotificationCursor(
  notifications: CursorNotification[]
): NotificationCursor | null {
  const lastNotification = notifications.at(-1);
  return lastNotification
    ? { createdAt: lastNotification.createdAt, id: lastNotification.id }
    : null;
}

export function mergeNotificationPages<Notification extends { id: string }>(
  current: Notification[],
  next: Notification[]
) {
  const knownIds = new Set(current.map((notification) => notification.id));
  return [
    ...current,
    ...next.filter((notification) => !knownIds.has(notification.id)),
  ];
}
