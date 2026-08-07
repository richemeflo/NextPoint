export type PricingStudentSearchOption = {
  value: string;
  label: string;
  description?: string;
};

function normalizeStudentName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();
}

export function filterPricingStudentOptions(
  options: PricingStudentSearchOption[],
  query: string
) {
  const normalizedQuery = normalizeStudentName(query);
  if (normalizedQuery.length === 0) return [];

  return options.filter((option) =>
    normalizeStudentName(option.label).includes(normalizedQuery)
  );
}
