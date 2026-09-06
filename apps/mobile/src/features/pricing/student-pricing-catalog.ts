import type { PricingRate } from './pricing-service';

const temporalContexts = new Set(['weekend', 'public_holiday']);

function getPricingScope(rate: PricingRate) {
  const temporalScope = rate.applicabilityContexts
    .filter((context) => temporalContexts.has(context))
    .sort()
    .join(',');

  return [
    rate.coachId,
    rate.lessonType,
    rate.durationMinutes,
    temporalScope,
  ].join(':');
}

export function selectStudentPricingCatalog(rates: PricingRate[]) {
  const minimumRates = new Map<string, PricingRate>();

  for (const rate of rates) {
    const scope = getPricingScope(rate);
    const current = minimumRates.get(scope);
    const isMoreSpecific =
      current &&
      rate.amountCents === current.amountCents &&
      rate.applicabilityContexts.length > current.applicabilityContexts.length;

    if (!current || rate.amountCents < current.amountCents || isMoreSpecific) {
      minimumRates.set(scope, rate);
    }
  }

  return [...minimumRates.values()];
}
