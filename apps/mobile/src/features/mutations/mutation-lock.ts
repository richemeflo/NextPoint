export type MutationLock = { current: boolean };

export function acquireMutationLock(lock: MutationLock) {
  if (lock.current) return false;

  lock.current = true;
  return true;
}

export function releaseMutationLock(lock: MutationLock) {
  lock.current = false;
}
