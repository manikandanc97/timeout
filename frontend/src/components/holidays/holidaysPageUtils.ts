import { HOLIDAYS_PAGE_SIZE } from './constants';

export function holidaysPageCount(filteredLength: number) {
  return Math.max(1, Math.ceil(filteredLength / HOLIDAYS_PAGE_SIZE));
}

export function holidaysPageSlice<T>(
  filtered: T[],
  safePage: number,
  pageSize: number = HOLIDAYS_PAGE_SIZE,
) {
  const start = (safePage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}
