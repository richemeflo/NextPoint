export const studentListPageSize = 10;

export type StudentListPage<T> = {
  currentPage: number;
  items: T[];
  totalPages: number;
};

export function getStudentListPage<T>(
  items: T[],
  requestedPage: number,
  pageSize = studentListPageSize
): StudentListPage<T> {
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const normalizedPage = Number.isFinite(requestedPage)
    ? Math.trunc(requestedPage)
    : 1;
  const currentPage = Math.min(Math.max(normalizedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * safePageSize;

  return {
    currentPage,
    items: items.slice(startIndex, startIndex + safePageSize),
    totalPages,
  };
}
