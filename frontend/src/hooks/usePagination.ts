import { useMemo, useState } from 'react';

type UsePaginationOptions<T> = {
  items: T[];
  pageSize: number;
};

export function usePagination<T>({
  items,
  pageSize,
}: UsePaginationOptions<T>) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  const safePage = Math.min(page, pageCount);
  const pageSlice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  return {
    page,
    setPage,
    pageCount,
    safePage,
    pageSlice,
  };
}
