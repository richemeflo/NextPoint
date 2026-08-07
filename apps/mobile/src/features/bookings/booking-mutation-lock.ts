export type BookingMutationLock = { current: boolean };

export function acquireBookingMutationLock(lock: BookingMutationLock) {
  if (lock.current) return false;

  lock.current = true;
  return true;
}

export function releaseBookingMutationLock(lock: BookingMutationLock) {
  lock.current = false;
}
