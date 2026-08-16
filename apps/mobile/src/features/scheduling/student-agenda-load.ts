type LoadResult = { ok: boolean };

export function isStudentAgendaDependencyReady<T extends LoadResult>(
  result: T
): result is T & { ok: true } {
  return result.ok;
}
