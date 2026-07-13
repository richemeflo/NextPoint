import type { SupportedLocale } from '../../i18n/translations';

export function formatCoachStatsHours(
  completedMinutes: number,
  locale: SupportedLocale
) {
  const hours = completedMinutes / 60;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(hours)} h`;
}

export function formatCoachStatsRevenue(
  amountCents: number,
  locale: SupportedLocale,
  currency: 'EUR'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}
