export type CoachStatsError =
  | 'unauthorized'
  | 'invalid_period'
  | 'unavailable'
  | 'invalid_response'
  | 'unknown';

export function normalizeCoachStatsError(code: string | undefined): CoachStatsError {
  if (code === '42501') return 'unauthorized';
  if (code === '22023') return 'invalid_period';
  if (code?.startsWith('PGRST')) return 'unavailable';
  return 'unknown';
}
