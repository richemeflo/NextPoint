export type PasswordAttemptStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type PasswordAttemptState = {
  version: 1;
  failedAttempts: number;
  blockedUntil: number | null;
};

const storageKey = 'nextpoint.password-attempt-lockout.v1';
const attemptsPerStage = 5;
const maximumLockDurationMs = 24 * 60 * 60 * 1_000;
const initialLockDurationsMs = [
  5 * 60 * 1_000,
  15 * 60 * 1_000,
  30 * 60 * 1_000,
  60 * 60 * 1_000,
  2 * 60 * 60 * 1_000,
] as const;

function parseState(value: string | null): PasswordAttemptState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PasswordAttemptState>;
    if (
      parsed.version !== 1 ||
      !Number.isSafeInteger(parsed.failedAttempts) ||
      !parsed.failedAttempts ||
      parsed.failedAttempts < 1 ||
      (parsed.blockedUntil !== null &&
        (typeof parsed.blockedUntil !== 'number' ||
          !Number.isSafeInteger(parsed.blockedUntil) ||
          parsed.blockedUntil < 0))
    ) {
      return null;
    }

    return parsed as PasswordAttemptState;
  } catch {
    return null;
  }
}

export function getPasswordLockDurationMs(failedAttempts: number) {
  if (
    failedAttempts < attemptsPerStage ||
    failedAttempts % attemptsPerStage !== 0
  ) {
    return 0;
  }

  const stage = failedAttempts / attemptsPerStage;
  const configuredDuration = initialLockDurationsMs[stage - 1];
  if (configuredDuration) return configuredDuration;

  const doublingCount = stage - initialLockDurationsMs.length;
  return Math.min(
    initialLockDurationsMs.at(-1)! * 2 ** doublingCount,
    maximumLockDurationMs
  );
}

export async function getPasswordAttemptBlockRemainingMs(
  storage: PasswordAttemptStorage,
  now = Date.now()
) {
  const state = parseState(await storage.getItem(storageKey));
  if (!state?.blockedUntil || state.blockedUntil <= now) return 0;
  return state.blockedUntil - now;
}

export async function recordFailedPasswordAttempt(
  storage: PasswordAttemptStorage,
  now = Date.now()
) {
  const previousState = parseState(await storage.getItem(storageKey));
  const failedAttempts = (previousState?.failedAttempts ?? 0) + 1;
  const lockDurationMs = getPasswordLockDurationMs(failedAttempts);
  const blockedUntil = lockDurationMs > 0 ? now + lockDurationMs : null;

  await storage.setItem(
    storageKey,
    JSON.stringify({ version: 1, failedAttempts, blockedUntil })
  );

  return lockDurationMs;
}

export function resetFailedPasswordAttempts(storage: PasswordAttemptStorage) {
  return storage.removeItem(storageKey);
}
