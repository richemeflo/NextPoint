import { useSyncExternalStore } from 'react';

let unreadCount = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => unreadCount;
const getServerSnapshot = () => 0;

export function setNotificationUnreadCount(count: number) {
  const nextCount = Math.max(0, Math.trunc(count));
  if (nextCount === unreadCount) return;

  unreadCount = nextCount;
  listeners.forEach((listener) => listener());
}

export function decrementNotificationUnreadCount() {
  setNotificationUnreadCount(unreadCount - 1);
}

export function formatNotificationUnreadCount(count: number) {
  return count > 99 ? '99+' : String(count);
}

export function useNotificationUnreadCount() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
