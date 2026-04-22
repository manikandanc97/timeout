'use client';

import api from '@/services/api';
import {
  ClipboardList,
} from 'lucide-react';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { useCallback, useEffect, useState } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { RegularizationRequest } from '@/types/attendance';
import { extractApiList, type ApiListEnvelope } from '@/lib/apiList';
import { AdminDashboardPanel } from './AdminDashboardPanel';
import {
  CompOffRow,
  PermissionRow,
  SLOT_COUNT,
  sortPendingAttendance,
  sortPendingCompOff,
  sortPendingLeaves,
} from './pendingRequests/pendingRequestsUtils';
import PendingRequestTabSwitch, { type PendingTab } from './pendingRequests/PendingRequestTabSwitch';
import PendingRejectModal from './pendingRequests/PendingRejectModal';
import PendingLeaveList from './pendingRequests/PendingLeaveList';
import PendingPermissionList from './pendingRequests/PendingPermissionList';
import PendingCompOffList from './pendingRequests/PendingCompOffList';
import PendingAttendanceList from './pendingRequests/PendingAttendanceList';

type BusyAction = 
  | { kind: 'leave'; id: number } 
  | { kind: 'compOff'; id: number }
  | { kind: 'attendance'; id: number };

type RejectModalTarget = 
  | { kind: 'leave'; id: number } 
  | { kind: 'compOff'; id: number }
  | { kind: 'attendance'; id: number };

export default function PendingLeaveRequests() {
  const [activeTab, setActiveTab] = useState<PendingTab>('LEAVE');
  const [pendingLeaves, setPendingLeaves] = useState<LeaveWithEmployee[]>([]);
  const [pendingLeaveTotal, setPendingLeaveTotal] = useState(0);
  
  const [pendingWFH, setPendingWFH] = useState<LeaveWithEmployee[]>([]);
  const [pendingWFHTotal, setPendingWFHTotal] = useState(0);

  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [permissionTotal, setPermissionTotal] = useState(0);

  const [compOffRows, setCompOffRows] = useState<CompOffRow[]>([]);
  const [compOffTotal, setCompOffTotal] = useState(0);

  const [attendanceRows, setAttendanceRows] = useState<RegularizationRequest[]>([]);
  const [attendanceTotal, setAttendanceTotal] = useState(0);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectModalTarget | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reloadLists = useCallback(async () => {
    const [leaveRes, holidayRes, permissionRes, compOffRes, attendanceRes] = await Promise.all([
      api.get<LeaveWithEmployee[] | ApiListEnvelope<LeaveWithEmployee>>('/leaves'),
      api.get<Holiday[]>('/holidays').catch(() => ({ data: [] as Holiday[] })),
      api
        .get<PermissionRow[] | ApiListEnvelope<PermissionRow>>('/leaves/permissions/requests')
        .catch(() => ({ data: [] as PermissionRow[] })),
      api
        .get<CompOffRow[] | ApiListEnvelope<CompOffRow>>('/leaves/comp-off-requests')
        .catch(() => ({ data: [] as CompOffRow[] })),
      api
        .get<{ data: RegularizationRequest[] }>('/attendance/regularize')
        .catch(() => ({ data: { data: [] } })),
    ]);

    const allPendingLeaves = sortPendingLeaves(extractApiList(leaveRes.data));
    
    // Separate regular leaves and WFH
    const regularLeaves = allPendingLeaves.filter(l => l.type !== 'WFH');
    const wfhRequests = allPendingLeaves.filter(l => l.type === 'WFH');

    setPendingLeaves(regularLeaves.slice(0, SLOT_COUNT));
    setPendingLeaveTotal(regularLeaves.length);

    setPendingWFH(wfhRequests.slice(0, SLOT_COUNT));
    setPendingWFHTotal(wfhRequests.length);

    setHolidays(Array.isArray(holidayRes.data) ? holidayRes.data : []);

    const permData = extractApiList(permissionRes.data);
    setPermissionRows(permData.slice(0, SLOT_COUNT));
    setPermissionTotal(permData.length);

    const compSorted = sortPendingCompOff(extractApiList(compOffRes.data));
    setCompOffRows(compSorted.slice(0, SLOT_COUNT));
    setCompOffTotal(compSorted.length);

    const attData = Array.isArray(attendanceRes.data?.data) ? attendanceRes.data.data : [];
    const attSorted = sortPendingAttendance(attData);
    setAttendanceRows(attSorted.slice(0, SLOT_COUNT));
    setAttendanceTotal(attSorted.length);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await reloadLists();
      } catch {
        setPendingLeaves([]);
        setPendingLeaveTotal(0);
        setPendingWFH([]);
        setPendingWFHTotal(0);
        setHolidays([]);
        setPermissionRows([]);
        setPermissionTotal(0);
        setCompOffRows([]);
        setCompOffTotal(0);
        setAttendanceRows([]);
        setAttendanceTotal(0);
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, [reloadLists]);

  useEffect(() => {
    return subscribeDashboardRefresh('adminPendingRequests', () => {
      void reloadLists();
    });
  }, [reloadLists]);

  async function approveOrReject(
    id: number,
    newStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    setBusyAction({ kind: 'leave', id });
    try {
      await api.put(`/leaves/${id}`, {
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
    id: number,
    newStatus: 'APPROVED' | 'REJECTED',
  ) {
    setBusyAction({ kind: 'compOff', id });
    try {
      await api.put(`/leaves/comp-off-requests/${id}`, { status: newStatus });
      await reloadLists();
    } catch {
      // silent
    } finally {
      setBusyAction(null);
    }
  }

  async function approveOrRejectAttendance(
    id: number,
    newStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    setBusyAction({ kind: 'attendance', id });
    try {
      await api.put(`/attendance/regularize/${id}`, {
        status: newStatus,
        ...(newStatus === 'REJECTED' ? { rejectionReason: rejectionReason?.trim() ?? '' } : {}),
      });
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

  const openRejectModal = (kind: 'leave' | 'compOff' | 'attendance', id: number) => {
    setRejectTarget({ kind, id });
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
    } else if (rejectTarget.kind === 'compOff') {
      void approveOrRejectCompOff(rejectTarget.id, 'REJECTED').finally(() => {
        setRejectTarget(null);
        setRejectReason('');
      });
    } else if (rejectTarget.kind === 'attendance') {
      void approveOrRejectAttendance(rejectTarget.id, 'REJECTED', trimmed).finally(() => {
        setRejectTarget(null);
        setRejectReason('');
      });
    }
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

  const Badge = ({ count, label, colorClass }: { count: number; label: string; colorClass: string }) => (
    <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${colorClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${colorClass.split(' ')[2]?.replace('text-', 'bg-') || 'bg-current'}`} />
      {count} {label}
    </span>
  );

  const getActiveBadge = () => {
    switch (activeTab) {
      case 'LEAVE':
        return <Badge count={pendingLeaveTotal} label='pending' colorClass='bg-warning-muted text-warning-muted-foreground ring-warning-muted-foreground/30' />;
      case 'WFH':
        return <Badge count={pendingWFHTotal} label='pending' colorClass='bg-amber-500/12 text-amber-800 ring-amber-500/25 dark:text-amber-200' />;
      case 'PERMISSION':
        return <Badge count={permissionTotal} label='total' colorClass='bg-sky-500/12 text-sky-800 ring-sky-500/25 dark:text-sky-200' />;
      case 'COMP_OFF':
        return <Badge count={compOffTotal} label='pending' colorClass='bg-indigo-500/12 text-indigo-800 ring-indigo-500/25 dark:text-indigo-200' />;
      case 'ATTENDANCE':
        return <Badge count={attendanceTotal} label='pending' colorClass='bg-emerald-500/12 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200' />;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardPanel
      title='Requests'
      subtitle='Leave / WFH / Permission / Comp off / Attendance'
      icon={ClipboardList}
      iconTileClass='bg-violet-500/15 dark:bg-violet-400/20'
      iconClass='text-violet-600'
      action={getActiveBadge()}
    >
      <PendingRequestTabSwitch activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'LEAVE' && (
        <PendingLeaveList
          rows={pendingLeaves}
          busyId={busyAction?.kind === 'leave' ? busyAction.id : null}
          holidays={holidays}
          onApprove={(id) => void approveOrReject(id, 'APPROVED')}
          onReject={(id) => openRejectModal('leave', id)}
        />
      )}

      {activeTab === 'WFH' && (
        <PendingLeaveList
          rows={pendingWFH}
          busyId={busyAction?.kind === 'leave' ? busyAction.id : null}
          holidays={holidays}
          onApprove={(id) => void approveOrReject(id, 'APPROVED')}
          onReject={(id) => openRejectModal('leave', id)}
        />
      )}

      {activeTab === 'PERMISSION' && (
        <PendingPermissionList rows={permissionRows} />
      )}

      {activeTab === 'COMP_OFF' && (
        <PendingCompOffList
          rows={compOffRows}
          busyId={busyAction?.kind === 'compOff' ? busyAction.id : null}
          onApprove={(id) => void approveOrRejectCompOff(id, 'APPROVED')}
          onReject={(id) => openRejectModal('compOff', id)}
        />
      )}

      {activeTab === 'ATTENDANCE' && (
        <PendingAttendanceList
          rows={attendanceRows}
          busyId={busyAction?.kind === 'attendance' ? busyAction.id : null}
          onApprove={(id) => void approveOrRejectAttendance(id, 'APPROVED')}
          onReject={(id) => openRejectModal('attendance', id)}
        />
      )}

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
