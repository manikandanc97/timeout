'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { usePagination } from '@/hooks/usePagination';
import api from '@/services/api';
import type { Holiday } from '@/types/holiday';
import { getApiErrorMessage } from '@/utils/apiError';
import { startOfLocalCalendarDay } from '@/utils/leave/leaveHelpers';

import { HOLIDAYS_PAGE_SIZE } from './constants';

export function useHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Holiday[]>('/holidays');
      setHolidays(Array.isArray(res.data) ? res.data : []);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not load holidays'));
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return holidays;
    return holidays.filter((h) => h.name.toLowerCase().includes(q));
  }, [holidays, searchTerm]);

  const { page, setPage, pageCount, safePage, pageSlice } = usePagination({
    items: filteredRows,
    pageSize: HOLIDAYS_PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, setPage]);

  const summary = useMemo(() => {
    const todayStart = startOfLocalCalendarDay(new Date());
    const total = holidays.length;
    const upcoming = holidays.filter(
      (h) => startOfLocalCalendarDay(new Date(h.date)) >= todayStart,
    ).length;
    const y = todayStart.getFullYear();
    const m = todayStart.getMonth();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
    const thisMonth = holidays.filter((h) => {
      const d = startOfLocalCalendarDay(new Date(h.date));
      return d >= monthStart && d <= monthEnd;
    }).length;
    return { total, upcoming, thisMonth };
  }, [holidays]);

  const hasActiveFilters = searchTerm.trim().length > 0;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    holidays,
    loading,
    load,
    searchTerm,
    setSearchTerm,
    filteredRows,
    pageSlice,
    page,
    setPage,
    pageCount,
    safePage,
    pageSize: HOLIDAYS_PAGE_SIZE,
    summary,
    hasActiveFilters,
    clearFilters,
  };
}
