import type { StudentSex } from '@nextpoint/shared';

export type StudentListFilters = {
  query: string;
  level: number | null;
  minAge: number;
  maxAge: number;
  sex: StudentSex | null;
};

export type StudentListItem = {
  fullName: string;
  padelLevel: number;
  age: number;
  sex: StudentSex;
};

export const padelLevels = Array.from({ length: 10 }, (_, index) => index + 1);

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();
}

export function filterAssociatedStudents<T extends StudentListItem>(
  students: T[],
  filters: StudentListFilters
) {
  const normalizedQuery = normalizeSearch(filters.query);

  return students.filter((student) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      normalizeSearch(student.fullName).includes(normalizedQuery);
    const matchesLevel =
      filters.level === null || student.padelLevel === filters.level;
    const matchesAge =
      student.age >= filters.minAge && student.age <= filters.maxAge;
    const matchesSex = filters.sex === null || student.sex === filters.sex;

    return matchesQuery && matchesLevel && matchesAge && matchesSex;
  });
}
