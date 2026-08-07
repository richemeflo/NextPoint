export function createAuthSessionTransitionGuard() {
  let active = true;
  let currentVersion = 0;

  return {
    begin() {
      currentVersion += 1;
      return currentVersion;
    },
    isCurrent(version: number) {
      return active && version === currentVersion;
    },
    deactivate() {
      active = false;
      currentVersion += 1;
    },
  };
}
