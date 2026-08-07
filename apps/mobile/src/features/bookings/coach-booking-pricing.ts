import {
  pricingDurations,
  pricingLessonTypes,
  type PricingDuration,
  type PricingLessonType,
} from '@nextpoint/shared';

type CoachBookingPricingRate = {
  durationMinutes: PricingDuration;
  isActive: boolean;
  lessonType: PricingLessonType;
  targetStudentIds: string[];
};

type CoachBookingPricingSelection = {
  durationMinutes: PricingDuration;
  lessonType: PricingLessonType;
};

export function getCoachBookingPricingOptions(
  rates: CoachBookingPricingRate[],
  selection: CoachBookingPricingSelection,
  primaryStudentId?: string
) {
  const applicableRates = rates.filter(
    (rate) =>
      rate.isActive &&
      (rate.targetStudentIds.length === 0 ||
        primaryStudentId === undefined ||
        rate.targetStudentIds.includes(primaryStudentId))
  );
  const lessonTypes = pricingLessonTypes.filter((lessonType) =>
    applicableRates.some((rate) => rate.lessonType === lessonType)
  );
  const lessonType = lessonTypes.includes(selection.lessonType)
    ? selection.lessonType
    : (lessonTypes[0] ?? selection.lessonType);
  const durationMinutes = pricingDurations.filter((duration) =>
    applicableRates.some(
      (rate) =>
        rate.lessonType === lessonType && rate.durationMinutes === duration
    )
  );
  const selectedDuration = durationMinutes.includes(selection.durationMinutes)
    ? selection.durationMinutes
    : (durationMinutes[0] ?? selection.durationMinutes);

  return {
    durationMinutes,
    hasMatchingRate: durationMinutes.length > 0,
    lessonTypes,
    selection: {
      durationMinutes: selectedDuration,
      lessonType,
    },
  };
}
