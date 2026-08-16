export type OptionGroupNavigationKey =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'End'
  | 'Home';

export function getOptionGroupKeyboardTarget(
  enabledOptions: readonly boolean[],
  currentIndex: number,
  key: string
) {
  const enabledIndices = enabledOptions.flatMap((enabled, index) =>
    enabled ? [index] : []
  );
  if (enabledIndices.length === 0) return null;

  if (key === 'Home') return enabledIndices[0];
  if (key === 'End') return enabledIndices.at(-1) ?? null;

  const direction =
    key === 'ArrowRight' || key === 'ArrowDown'
      ? 1
      : key === 'ArrowLeft' || key === 'ArrowUp'
        ? -1
        : 0;
  if (direction === 0) return null;

  const currentEnabledIndex = enabledIndices.indexOf(currentIndex);
  if (currentEnabledIndex === -1) {
    return direction === 1 ? enabledIndices[0] : enabledIndices.at(-1) ?? null;
  }

  return enabledIndices[
    (currentEnabledIndex + direction + enabledIndices.length) %
      enabledIndices.length
  ];
}
