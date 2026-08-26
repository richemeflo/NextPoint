import type {
  AvailabilityRange,
  AvailabilitySlot,
} from '@/features/scheduling/availability-service';

export function canOfferAvailabilitySeriesScope(
  range: Pick<AvailabilityRange, 'recurrenceType'> | null,
  rangeSlots: Pick<AvailabilitySlot, 'status'>[]
) {
  return (
    range !== null &&
    range.recurrenceType !== 'none' &&
    rangeSlots.length > 0 &&
    rangeSlots.every((slot) => slot.status === 'available')
  );
}
