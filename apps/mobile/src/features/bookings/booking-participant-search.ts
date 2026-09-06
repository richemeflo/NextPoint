export const minimumPartnerSearchLength = 2;

export function normalizePartnerSearchQuery(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

export function isPartnerSearchReady(value: string) {
  const tokens = normalizePartnerSearchQuery(value).split(' ').filter(Boolean);
  return (
    tokens.length > 0 &&
    tokens.every((token) => token.length >= minimumPartnerSearchLength)
  );
}
