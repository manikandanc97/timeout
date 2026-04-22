'use client';

import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { formatPersonName } from '@/lib/personName';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatCurrencyINR } from '@/utils/formatters';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type PayrollSummary = {
  totalEmployees?: number;
  payrollProcessed?: number;
  pendingPayroll?: number;
  totalSalaryPaid?: number;
  currentMonth?: string;
};

export function usePayrollPage(canView: boolean) {
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [summaryData, setSummaryData] = useState({
    totalEmployees: '0',
    payrollProcessed: '0',
    pendingPayroll: '0',
    totalSalaryPaid: formatCurrencyINR(0),
    currentMonth: '',
  });
  const [bulkMarkingPaid, setBulkMarkingPaid] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'NAME_DESC' | 'STATUS' | 'MONTH_NEWEST' | 'MONTH_OLDEST'>('NAME_ASC');

  const loadPayroll = useCallback(() => {
    if (!canView) return Promise.resolve();
    setLoading(true);
    return api
      .get<{
        payroll: PayrollRow[];
        summary?: PayrollSummary;
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(`/payroll?month=${selectedMonth}&year=${selectedYear}&page=${pagination.page}`)
      .then((res) => {
        setRows(Array.isArray(res.data?.payroll) ? res.data.payroll : []);

        const summary = res.data?.summary ?? {};
        setSummaryData({
          totalEmployees: String(summary.totalEmployees ?? 0),
          payrollProcessed: String(summary.payrollProcessed ?? 0),
          pendingPayroll: String(summary.pendingPayroll ?? 0),
          totalSalaryPaid: formatCurrencyINR(Number(summary.totalSalaryPaid ?? 0)),
          currentMonth: String(summary.currentMonth ?? ''),
        });

        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((error: unknown) => toast.error(getApiErrorMessage(error, 'Failed to load payroll')))
      .finally(() => setLoading(false));
  }, [canView, selectedMonth, selectedYear, pagination.page]);

  const generateMonthlyPayroll = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/payroll/generate', { month: selectedMonth, year: selectedYear });
      toast.success(res.data?.message || 'Payroll generated successfully');
      await loadPayroll();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to generate payroll'));
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayroll();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPayroll]);

  useEffect(() => {
    return subscribeDashboardRefresh('payrollSummary', () => {
      void loadPayroll();
    });
  }, [loadPayroll]);

  const visibleRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const displayName = formatPersonName(row.employeeName) || row.employeeName || '';
      const matchesSearch = query.length === 0 || displayName.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'ALL' ? true : statusFilter === 'PAID' ? row.status === 'PAID' : row.status !== 'PAID';
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const aName = formatPersonName(a.employeeName) || a.employeeName || '';
      const bName = formatPersonName(b.employeeName) || b.employeeName || '';

      if (sortBy === 'NAME_ASC') {
        return aName.localeCompare(bName);
      }
      if (sortBy === 'NAME_DESC') {
        return bName.localeCompare(aName);
      }
      if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
      const aMonthKey = a.year * 100 + a.month;
      const bMonthKey = b.year * 100 + b.month;
      if (sortBy === 'MONTH_OLDEST') return aMonthKey - bMonthKey;
      return bMonthKey - aMonthKey;
    });
  }, [rows, searchTerm, statusFilter, sortBy]);

  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== 'ALL' || sortBy !== 'NAME_ASC';
  const bulkMarkPaidEligibleCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.payrollAdded !== false &&
          row.employeeActive !== false &&
          row.status !== 'PAID' &&
          row.status !== 'NOT_ADDED',
      ).length,
    [rows],
  );

  return {
    rows,
    setRows,
    loading,
    generating,
    generateMonthlyPayroll,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    bulkMarkingPaid,
    setBulkMarkingPaid,
    showAmounts,
    setShowAmounts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    loadPayroll,
    summary: summaryData,
    visibleRows,
    hasActiveFilters,
    bulkMarkPaidEligibleCount,
    pagination,
    setPage: (page: number) => setPagination((prev) => ({ ...prev, page })),
  };
}
