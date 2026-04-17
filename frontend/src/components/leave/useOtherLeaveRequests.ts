import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { formatPersonName } from '@/lib/personName';
import type { CompOffRequestWithEmployee, PermissionRequestWithEmployee } from '@/types/leave';
import { computeRequestStatusSummary, LEAVE_REQUESTS_PAGE_SIZE } from './leaveRequestsPageUtils';

type Params = {
  initialPermissionRequests: PermissionRequestWithEmployee[];
  initialCompOffRequests: CompOffRequestWithEmployee[];
};

export function useOtherLeaveRequests({ initialPermissionRequests, initialCompOffRequests }: Params) {
  const [permissionRows, setPermissionRows] = useState(initialPermissionRequests);
  const [compOffRows, setCompOffRows] = useState(initialCompOffRequests);
  const [otherBusyKey, setOtherBusyKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'PERMISSION' | 'COMP_OFF'>('LEAVE');
  const [otherSearch, setOtherSearch] = useState('');
  const [otherDateFrom, setOtherDateFrom] = useState('');
  const [otherDateTo, setOtherDateTo] = useState('');
  const [otherPage, setOtherPage] = useState(1);

  const permissionFiltered = useMemo(() => {
    const q = otherSearch.trim().toLowerCase();
    return permissionRows.filter((row) => {
      const name = formatPersonName(row.user?.name).toLowerCase();
      const email = (row.user?.email ?? '').toLowerCase();
      const reason = (row.reason ?? '').toLowerCase();
      const matchesSearch = q.length === 0 || name.includes(q) || email.includes(q) || reason.includes(q);
      const rowDate = new Date(row.date);
      const fromOk = !otherDateFrom || rowDate >= new Date(`${otherDateFrom}T00:00:00`);
      const toOk = !otherDateTo || rowDate <= new Date(`${otherDateTo}T23:59:59`);
      return matchesSearch && fromOk && toOk;
    });
  }, [permissionRows, otherDateFrom, otherDateTo, otherSearch]);

  const compOffFiltered = useMemo(() => {
    const q = otherSearch.trim().toLowerCase();
    return compOffRows.filter((row) => {
      const name = formatPersonName(row.user?.name).toLowerCase();
      const email = (row.user?.email ?? '').toLowerCase();
      const reason = (row.reason ?? '').toLowerCase();
      const matchesSearch = q.length === 0 || name.includes(q) || email.includes(q) || reason.includes(q);
      const rowDate = new Date(row.workDate);
      const fromOk = !otherDateFrom || rowDate >= new Date(`${otherDateFrom}T00:00:00`);
      const toOk = !otherDateTo || rowDate <= new Date(`${otherDateTo}T23:59:59`);
      return matchesSearch && fromOk && toOk;
    });
  }, [compOffRows, otherDateFrom, otherDateTo, otherSearch]);

  const otherFiltered = activeTab === 'PERMISSION' ? permissionFiltered : compOffFiltered;
  const otherPageCount = Math.max(1, Math.ceil(otherFiltered.length / LEAVE_REQUESTS_PAGE_SIZE));
  const safeOtherPage = Math.min(otherPage, otherPageCount);
  const otherSlice = otherFiltered.slice((safeOtherPage - 1) * LEAVE_REQUESTS_PAGE_SIZE, safeOtherPage * LEAVE_REQUESTS_PAGE_SIZE);
  const hasOtherFilters = otherSearch.trim().length > 0 || otherDateFrom.length > 0 || otherDateTo.length > 0;
  const permissionSummary = useMemo(() => computeRequestStatusSummary(permissionRows), [permissionRows]);
  const compOffSummary = useMemo(() => computeRequestStatusSummary(compOffRows), [compOffRows]);

  const clearOtherFilters = () => {
    setOtherSearch('');
    setOtherDateFrom('');
    setOtherDateTo('');
    setOtherPage(1);
  };

  const updatePermissionStatus = async (requestId: number, status: 'APPROVED' | 'REJECTED') => {
    const key = `permission-${requestId}`;
    setOtherBusyKey(key);
    try {
      await api.put(`/leaves/permissions/requests/${requestId}`, { status });
      setPermissionRows((prev) => prev.map((row) => (row.id === requestId ? { ...row, status } : row)));
      toast.success(status === 'APPROVED' ? 'Permission request approved.' : 'Permission request rejected.');
    } catch {
      toast.error('Could not update permission request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  const updateCompOffStatus = async (requestId: number, status: 'APPROVED' | 'REJECTED') => {
    const key = `compoff-${requestId}`;
    setOtherBusyKey(key);
    try {
      const { data } = await api.put<{ leaveBalance?: { compOff: number } }>(`/leaves/comp-off-requests/${requestId}`, { status });
      setCompOffRows((prev) => prev.map((row) => (row.id === requestId ? { ...row, status } : row)));
      if (status === 'APPROVED' && data?.leaveBalance != null) {
        toast.success(`Comp off approved. Employee comp off balance is now ${data.leaveBalance.compOff} day(s).`);
      } else {
        toast.success(status === 'APPROVED' ? 'Comp off request approved.' : 'Comp off request rejected.');
      }
    } catch {
      toast.error('Could not update comp off request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  const refetchOtherFeeds = useCallback(async () => {
    const [permRes, compRes] = await Promise.all([
      api.get<PermissionRequestWithEmployee[]>('/leaves/permissions/requests').catch(() => ({ data: [] as PermissionRequestWithEmployee[] })),
      api.get<CompOffRequestWithEmployee[]>('/leaves/comp-off-requests').catch(() => ({ data: [] as CompOffRequestWithEmployee[] })),
    ]);
    setPermissionRows(Array.isArray(permRes.data) ? permRes.data : []);
    setCompOffRows(Array.isArray(compRes.data) ? compRes.data : []);
  }, []);

  return {
    activeTab,
    setActiveTab,
    otherSearch,
    setOtherSearch,
    otherDateFrom,
    setOtherDateFrom,
    otherDateTo,
    setOtherDateTo,
    otherPage,
    setOtherPage,
    otherBusyKey,
    otherSlice,
    otherFilteredLength: otherFiltered.length,
    otherPageCount,
    safeOtherPage,
    hasOtherFilters,
    permissionSummary,
    compOffSummary,
    clearOtherFilters,
    updatePermissionStatus,
    updateCompOffStatus,
    refetchOtherFeeds,
  };
}
