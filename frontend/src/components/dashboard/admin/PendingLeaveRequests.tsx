'use client';

import api from '@/services/api';
import {
  ClipboardList,
} from 'lucide-react';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { useCallback, useEffect, useState } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import { AdminDashboardPanel } from './AdminDashboardPanel';
import {
  CompOffRow,
  PermissionRow,
  SLOT_COUNT,
  sortPendingCompOff,
  sortPendingLeaves,
} from './pendingRequests/pendingRequestsUtils';
import PendingRequestTabSwitch from './pendingRequests/PendingRequestTabSwitch';
import PendingRejectModal from './pendingRequests/PendingRejectModal';
import PendingLeaveList from './pendingRequests/PendingLeaveList';
import PendingPermissionList from './pendingRequests/PendingPermissionList';
import PendingCompOffList from './pendingRequests/PendingCompOffList';

type BusyAction = { kind: 'leave'; id: number } | { kind: 'compOff'; id: number };

type RejectModalTarget = { kind: 'leave'; id: number } | { kind: 'compOff'; id: number };

export default function PendingLeaveRequests() {
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'PERMISSION' | 'COMP_OFF'>(
    'LEAVE',
  );
  const [pendingList, setPendingList] = useState<LeaveWithEmployee[]>([]);
  const [pendingLeaveTotal, setPendingLeaveTotal] = useState(0);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [permissionTotal, setPermissionTotal] = useState(0);
  const [compOffRows, setCompOffRows] = useState<CompOffRow[]>([]);
  const [compOffTotal, setCompOffTotal] = useState(0);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectModalTarget | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reloadLists = useCallback(async () => {
    const [leaveRes, holidayRes, permissionRes, compOffRes] = await Promise.all([
      api.get<LeaveWithEmployee[]>('/leaves'),
      api.get<Holiday[]>('/holidays').catch(() => ({ data: [] as Holiday[] })),
      api
        .get<PermissionRow[]>('/leaves/permissions/requests')
        .catch(() => ({ data: [] as PermissionRow[] })),
      api
        .get<CompOffRow[]>('/leaves/comp-off-requests')
        .catch(() => ({ data: [] as CompOffRow[] })),
    ]);

    const sortedLeaves = sortPendingLeaves(leaveRes.data);
    setPendingList(sortedLeaves.slice(0, SLOT_COUNT));
    setPendingLeaveTotal(sortedLeaves.length);
    setHolidays(Array.isArray(holidayRes.data) ? holidayRes.data : []);

    const permData = Array.isArray(permissionRes.data) ? permissionRes.data : [];
    setPermissionRows(permData.slice(0, SLOT_COUNT));
    setPermissionTotal(permData.length);

    const compSorted = sortPendingCompOff(
      Array.isArray(compOffRes.data) ? compOffRes.data : [],
    );
    setCompOffRows(compSorted.slice(0, SLOT_COUNT));
    setCompOffTotal(compSorted.length);
  }, []);

  useEffect(() => {
    async function loadPendingLeaves() {
      setLoading(true);
      try {
        await reloadLists();
      } catch {
        setPendingList([]);
        setPendingLeaveTotal(0);
        setHolidays([]);
        setPermissionRows([]);
        setPermissionTotal(0);
        setCompOffRows([]);
        setCompOffTotal(0);
      } finally {
        setLoading(false);
      }
    }
    void loadPendingLeaves();
  }, [reloadLists]);

  useEffect(() => {
    return subscribeDashboardRefresh('adminPendingRequests', () => {
      void reloadLists();
    });
  }, [reloadLists]);

  async function approveOrReject(
    leaveId: number,
    newStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    setBusyAction({ kind: 'leave', id: leaveId });
    try {
      await api.put(`/leaves/${leaveId}`, {
        status: newStatus,
        ...(newStatus === 'REJECTED'
          ? { rejectionReason: rejectionReason?.trim() ?? '' }
          : {}),
      });
      await reloadLists();
    } catch {
      // silent
    } finally {
      setBusyAction(null);
    }
  }

  async function approveOrRejectCompOff(
    compOffId: number,
    newStatus: 'APPROVED' | 'REJECTED',
  ) {
    setBusyAction({ kind: 'compOff', id: compOffId });
    try {
      await api.put(`/leaves/comp-off-requests/${compOffId}`, { status: newStatus });
      await reloadLists();
    } catch {
      // silent
    } finally {
      setBusyAction(null);
    }
  }

  const isRejectingCurrent =
    rejectTarget !== null &&
    busyAction !== null &&
    busyAction.kind === rejectTarget.kind &&
    busyAction.id === rejectTarget.id;

  const openRejectModal = (kind: 'leave' | 'compOff', id: number) => {
    setRejectTarget(kind === 'leave' ? { kind: 'leave', id } : { kind: 'compOff', id });
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isRejectingCurrent) return;
    setRejectTarget(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectTarget === null) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) return;
    if (rejectTarget.kind === 'leave') {
      void approveOrReject(rejectTarget.id, 'REJECTED', trimmed).finally(() => {
        setRejectTarget(null);
        setRejectReason('');
      });
      return;
    }
    void approveOrRejectCompOff(rejectTarget.id, 'REJECTED').finally(() => {
      setRejectTarget(null);
      setRejectReason('');
    });
  };

  if (loading) {
    return (
      <AdminDashboardPanel
        title='Requests'
        subtitle={`Last ${SLOT_COUNT} pending`}
        icon={ClipboardList}
        iconTileClass='bg-violet-500/15 dark:bg-violet-400/20'
        iconClass='text-violet-600'
      >
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='bg-muted rounded-xl h-14 animate-pulse' />
          ))}
        </div>
      </AdminDashboardPanel>
    );
  }

  const leaveBadge = (
    <span className='flex items-center gap-1.5 rounded-full bg-warning-muted px-2.5 py-1 text-[11px] font-semibold text-warning-muted-foreground ring-1 ring-warning-muted-foreground/30'>
      <span className='h-1.5 w-1.5 rounded-full bg-warning-muted-foreground/80' />
      {pendingLeaveTotal} pending
    </span>
  );

  const permissionBadge = (
    <span className='rounded-full bg-sky-500/12 px-2.5 py-1 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-500/25 dark:bg-sky-400/18 dark:text-sky-200 dark:ring-sky-400/35'>
      {permissionTotal} total
    </span>
  );

  const compOffBadge = (
    <span className='rounded-full bg-indigo-500/12 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 ring-1 ring-indigo-500/25 dark:bg-indigo-400/18 dark:text-indigo-200 dark:ring-indigo-400/35'>
      {compOffTotal} pending
    </span>
  );

  return (
    <AdminDashboardPanel
      title='Requests'
      subtitle='Leave / Permission / Comp off'
      icon={ClipboardList}
      iconTileClass='bg-violet-500/15 dark:bg-violet-400/20'
      iconClass='text-violet-600'
      action={
        activeTab === 'LEAVE'
          ? leaveBadge
          : activeTab === 'PERMISSION'
            ? permissionBadge
            : compOffBadge
      }
    >
      <PendingRequestTabSwitch activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'LEAVE' ? (
        <PendingLeaveList
          rows={pendingList}
          busyId={busyAction?.kind === 'leave' ? busyAction.id : null}
          holidays={holidays}
          onApprove={(id) => void approveOrReject(id, 'APPROVED')}
          onReject={(id) => openRejectModal('leave', id)}
        />
      ) : null}

      {activeTab === 'PERMISSION' ? (
        <PendingPermissionList rows={permissionRows} />
      ) : null}

      {activeTab === 'COMP_OFF' ? (
        <PendingCompOffList
          rows={compOffRows}
          busyId={busyAction?.kind === 'compOff' ? busyAction.id : null}
          onApprove={(id) => void approveOrRejectCompOff(id, 'APPROVED')}
          onReject={(id) => openRejectModal('compOff', id)}
        />
      ) : null}

      <PendingRejectModal
        rejectTarget={rejectTarget}
        rejectReason={rejectReason}
        isRejectingCurrent={isRejectingCurrent}
        onReasonChange={setRejectReason}
        onCancel={closeRejectModal}
        onConfirm={confirmReject}
      />
    </AdminDashboardPanel>
  );
}
