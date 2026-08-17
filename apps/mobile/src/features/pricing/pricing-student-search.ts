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

export function updateStudentSelection(
  values: string[],
  value: string,
  maxSelected?: number
) {
  if (values.includes(value)) {
    return values.filter((candidate) => candidate !== value);
  }

  if (maxSelected === 1) return [value];
  if (maxSelected !== undefined && values.length >= maxSelected) return values;

  return [...values, value];
}
