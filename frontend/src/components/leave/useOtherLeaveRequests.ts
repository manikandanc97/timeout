import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { formatPersonName } from '@/lib/personName';
import type { CompOffRequestWithEmployee, PermissionRequestWithEmployee } from '@/types/leave';
import type { RegularizationRequest } from '@/types/attendance';
import { computeRequestStatusSummary, LEAVE_REQUESTS_PAGE_SIZE } from './leaveRequestsPageUtils';

type Params = {
  initialPermissionRequests: PermissionRequestWithEmployee[];
  initialCompOffRequests: CompOffRequestWithEmployee[];
  initialRegularizationRequests: RegularizationRequest[];
};

export function useOtherLeaveRequests({ initialPermissionRequests, initialCompOffRequests, initialRegularizationRequests }: Params) {
  const [permissionRows, setPermissionRows] = useState(initialPermissionRequests);
  const [compOffRows, setCompOffRows] = useState(initialCompOffRequests);
  const [regularizationRows, setRegularizationRows] = useState(initialRegularizationRequests);
  const [otherBusyKey, setOtherBusyKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'WFH' | 'PERMISSION' | 'COMP_OFF' | 'REGULARIZATION'>('LEAVE');
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

  const regularizationFiltered = useMemo(() => {
    const q = otherSearch.trim().toLowerCase();
    return regularizationRows.filter((row) => {
      const name = formatPersonName(row.user?.name).toLowerCase();
      const email = (row.user?.email ?? '').toLowerCase();
      const reason = (row.reason ?? '').toLowerCase();
      const matchesSearch = q.length === 0 || name.includes(q) || email.includes(q) || reason.includes(q);
      const rowDate = new Date(row.date);
      const fromOk = !otherDateFrom || rowDate >= new Date(`${otherDateFrom}T00:00:00`);
      const toOk = !otherDateTo || rowDate <= new Date(`${otherDateTo}T23:59:59`);
      return matchesSearch && fromOk && toOk;
    });
  }, [regularizationRows, otherDateFrom, otherDateTo, otherSearch]);

  const otherFiltered = activeTab === 'PERMISSION' ? permissionFiltered : activeTab === 'COMP_OFF' ? compOffFiltered : regularizationFiltered;
  const otherPageCount = Math.max(1, Math.ceil(otherFiltered.length / LEAVE_REQUESTS_PAGE_SIZE));
  const safeOtherPage = Math.min(otherPage, otherPageCount);
  const otherSlice = otherFiltered.slice((safeOtherPage - 1) * LEAVE_REQUESTS_PAGE_SIZE, safeOtherPage * LEAVE_REQUESTS_PAGE_SIZE);
  const hasOtherFilters = otherSearch.trim().length > 0 || otherDateFrom.length > 0 || otherDateTo.length > 0;
  const permissionSummary = useMemo(() => computeRequestStatusSummary(permissionRows), [permissionRows]);
  const compOffSummary = useMemo(() => computeRequestStatusSummary(compOffRows), [compOffRows]);
  const regularizationSummary = useMemo(() => computeRequestStatusSummary(regularizationRows), [regularizationRows]);

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

  const updateRegularizationStatus = async (requestId: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    const key = `regularization-${requestId}`;
    setOtherBusyKey(key);
    try {
      await api.put(`/attendance/regularize/${requestId}`, { status, rejectionReason });
      setRegularizationRows((prev) => prev.map((row) => (row.id === requestId ? { ...row, status } : row)));
      toast.success(status === 'APPROVED' ? 'Regularization approved.' : 'Regularization rejected.');
    } catch {
      toast.error('Could not update regularization request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  const refetchOtherFeeds = useCallback(async () => {
    const [permRes, compRes, regRes] = await Promise.all([
      api.get<PermissionRequestWithEmployee[]>('/leaves/permissions/requests').catch(() => ({ data: [] as PermissionRequestWithEmployee[] })),
      api.get<CompOffRequestWithEmployee[]>('/leaves/comp-off-requests').catch(() => ({ data: [] as CompOffRequestWithEmployee[] })),
      api.get<{ data: RegularizationRequest[] }>('/attendance/regularize').catch(() => ({ data: { data: [] as RegularizationRequest[] } })),
    ]);
    setPermissionRows(Array.isArray(permRes.data) ? permRes.data : []);
    setCompOffRows(Array.isArray(compRes.data) ? compRes.data : []);
    setRegularizationRows(Array.isArray(regRes.data?.data) ? regRes.data.data : []);
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
    regularizationSummary,
    clearOtherFilters,
    updatePermissionStatus,
    updateCompOffStatus,
    updateRegularizationStatus,
    refetchOtherFeeds,
  };
}
