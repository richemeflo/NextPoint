import assert from 'node:assert/strict';
import test from 'node:test';

import {
  pricingRateReadModelSchema,
  pricingRateSchema,
  selectApplicablePricingRate,
  toPricingRateInput,
} from './pricing-rate';

const validPricingRateReadModel = {
  id: '10000000-0000-4000-8000-000000000001',
  coachId: '10000000-0000-4000-8000-000000000002',
  label: 'Cours individuel',
  amountCents: 4500,
  currency: 'EUR',
  durationMinutes: 60,
  lessonType: 'individual',
  isActive: true,
  applicabilityContexts: ['weekend'],
  targetStudentIds: ['10000000-0000-4000-8000-000000000003'],
  updatedAt: '2026-08-07T10:00:00+02:00',
} as const;

test('pricing read models validate Supabase values at runtime', () => {
  assert.equal(
    pricingRateReadModelSchema.safeParse(validPricingRateReadModel).success,
    true
  );
  assert.equal(
    pricingRateReadModelSchema.safeParse({
      ...validPricingRateReadModel,
      currency: 'USD',
      durationMinutes: 45,
      lessonType: 'unexpected',
    }).success,
    false
  );
});

test('pricingRateSchema accepts individual, duo and group rates', () => {
  for (const lessonType of ['individual', 'duo', 'group'] as const) {
    for (const durationMinutes of ['60', '90'] as const) {
      const result = pricingRateSchema.safeParse({
        label: 'Cours standard',
        amountEuros: '45,50',
        durationMinutes,
        lessonType,
        isActive: true,
        applicabilityContexts: ['weekend'],
        targetStudentIds: [],
      });

      assert.equal(result.success, true);
    }
  }
});

test('pricingRateSchema rejects invalid labels, prices, durations and targets', () => {
  const result = pricingRateSchema.safeParse({
    label: '',
    amountEuros: '-4',
    durationMinutes: '45',
    lessonType: 'private',
    isActive: true,
    applicabilityContexts: ['peak_hours'],
    targetStudentIds: ['not-a-uuid'],
  });

  assert.equal(result.success, false);
});

test('toPricingRateInput converts decimal euros to minor units', () => {
  const input = toPricingRateInput({
    label: '  Tarif week-end  ',
    amountEuros: '55,90',
    durationMinutes: '90',
    lessonType: 'group',
    isActive: false,
    applicabilityContexts: ['weekend', 'public_holiday'],
    targetStudentIds: [],
  });

  assert.deepEqual(input, {
    label: 'Tarif week-end',
    amountCents: 5590,
    currency: 'EUR',
    durationMinutes: 90,
    lessonType: 'group',
    isActive: false,
    applicabilityContexts: ['weekend', 'public_holiday'],
    targetStudentIds: [],
  });
});

test('selectApplicablePricingRate uses active type, duration and criteria', () => {
  const common = {
    currency: 'EUR' as const,
    lessonType: 'individual' as const,
    durationMinutes: 60 as const,
    isActive: true,
    targetStudentIds: [],
  };
  const rates = [
    {
      ...common,
      id: 'general',
      label: 'Tarif général',
      amountCents: 4500,
      applicabilityContexts: [],
    },
    {
      ...common,
      id: 'weekend',
      label: 'Tarif week-end',
      amountCents: 5000,
      applicabilityContexts: ['weekend' as const],
    },
    {
      ...common,
      id: 'inactive',
      label: 'Tarif inactif',
      amountCents: 100,
      isActive: false,
      applicabilityContexts: [],
    },
  ];

  assert.equal(
    selectApplicablePricingRate(rates, {
      lessonType: 'individual',
      durationMinutes: 60,
      isWeekend: true,
    })?.id,
    'weekend'
  );
  assert.equal(
    selectApplicablePricingRate(rates, {
      lessonType: 'group',
      durationMinutes: 60,
    }),
    null
  );
});

test('selectApplicablePricingRate prioritizes an explicitly targeted student', () => {
  const selected = selectApplicablePricingRate(
    [
      {
        id: 'general',
        label: 'Tarif général',
        amountCents: 4500,
        currency: 'EUR',
        durationMinutes: 90,
        lessonType: 'group',
        isActive: true,
        applicabilityContexts: [],
        targetStudentIds: [],
      },
      {
        id: 'targeted',
        label: 'Tarif ciblé',
        amountCents: 4000,
        currency: 'EUR',
        durationMinutes: 90,
        lessonType: 'group',
        isActive: true,
        applicabilityContexts: [],
        targetStudentIds: ['44a05daf-7d65-4b74-8d9f-093d0ee3f678'],
      },
    ],
    {
      lessonType: 'group',
      durationMinutes: 90,
      studentId: '44a05daf-7d65-4b74-8d9f-093d0ee3f678',
    }
  );

  assert.equal(selected?.id, 'targeted');
});
