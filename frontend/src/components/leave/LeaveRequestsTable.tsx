import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge';
import { TYPE_CONFIG } from '@/components/leave/constants';
import { fmt, getLeaveEnd, getLeaveStart } from '@/components/leave/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Holiday } from '@/types/holiday';
import type { LeaveWithEmployee } from '@/types/leave';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';
import { formatPersonName } from '@/lib/personName';
import { useState } from 'react';

type Props = {
  rows: LeaveWithEmployee[];
  holidays: Holiday[];
  canModerate: boolean;
  busyId: number | null;
  onApproveReject: (
    leaveId: number,
    status: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) => void;
};

export default function LeaveRequestsTable({
  rows,
  holidays,
  canModerate,
  busyId,
  onApproveReject,
}: Props) {
  const [rejectLeaveId, setRejectLeaveId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const isRejectingCurrent = rejectLeaveId !== null && busyId === rejectLeaveId;

  const openRejectModal = (leaveId: number) => {
    setRejectLeaveId(leaveId);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isRejectingCurrent) return;
    setRejectLeaveId(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectLeaveId === null) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) return;
    onApproveReject(rejectLeaveId, 'REJECTED', trimmed);
    setRejectLeaveId(null);
    setRejectReason('');
  };

  return (
    <div className='w-full min-w-0 overflow-x-auto'>
      <table className='w-full min-w-4xl table-fixed border-collapse text-left text-sm'>
        <colgroup>
          <col className='w-[12%]' />
          <col className='w-[14%]' />
          <col className='w-[10%]' />
          <col className='w-[10%]' />
          <col className='w-[8%]' />
          <col className='w-[28%]' />
          <col className='w-[18%]' />
        </colgroup>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>Employee</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>Leave type</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>From</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>To</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>Days</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>Reason</th>
            <th className='px-3 py-3.5 text-left align-middle sm:px-4'>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className='px-3 py-16 text-center align-middle text-sm text-muted-foreground sm:px-4 sm:py-24'
              >
                No leave requests match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const typeCfg = TYPE_CONFIG[row.type] ?? TYPE_CONFIG.ANNUAL;
              const isBusy = busyId === row.id;
              const name = formatPersonName(row.user?.name) || '—';
              return (
                <tr
                  key={row.id}
                  className='border-b border-border/60 transition-colors hover:bg-muted/50'
                >
                  <td className='min-w-0 px-3 py-2.5 text-left align-middle text-sm font-medium text-card-foreground sm:px-4'>
                    <span className='block truncate' title={name}>
                      {name}
                    </span>
                  </td>
                  <td className='min-w-0 px-3 py-2.5 text-left align-middle sm:px-4'>
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold leading-none ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                    >
                      {typeCfg.label}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-3 py-2.5 text-left align-middle text-sm text-muted-foreground sm:px-4'>
                    {fmt(getLeaveStart(row))}
                  </td>
                  <td className='whitespace-nowrap px-3 py-2.5 text-left align-middle text-sm text-muted-foreground sm:px-4'>
                    {fmt(getLeaveEnd(row))}
                  </td>
                  <td className='whitespace-nowrap px-3 py-2.5 text-left align-middle text-sm text-muted-foreground sm:px-4'>
                    {workingDaysForLeaveRange(
                      getLeaveStart(row),
                      getLeaveEnd(row),
                      holidays,
                    )}{' '}
                    day(s)
                  </td>
                  <td className='min-w-0 px-3 py-2.5 text-left align-middle text-sm text-muted-foreground sm:px-4'>
                    <span className='line-clamp-2 wrap-break-word text-left' title={row.reason}>
                      {row.reason || '—'}
                    </span>
                  </td>
                  <td className='min-w-0 px-3 py-2.5 text-left align-middle sm:px-4'>
                    {canModerate && row.status === 'PENDING' ? (
                      <ApproveRejectButtonGroup
                        disabled={isBusy}
                        onApprove={() => onApproveReject(row.id, 'APPROVED')}
                        onReject={() => openRejectModal(row.id)}
                      />
                    ) : (
                      <LeaveStatusBadge status={row.status} className='shrink-0' />
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <ConfirmModal
        open={rejectLeaveId !== null}
        title='Reject leave request'
        message='Please provide a reason. This will be shown to the employee.'
        cancelLabel='Cancel'
        confirmLabel='Reject'
        isProcessing={isRejectingCurrent}
        onCancel={closeRejectModal}
        onConfirm={confirmReject}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder='Enter rejection reason'
          className='w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring'
        />
        {!rejectReason.trim() ? (
          <p className='mt-2 text-xs text-rose-600'>Rejection reason is required.</p>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
