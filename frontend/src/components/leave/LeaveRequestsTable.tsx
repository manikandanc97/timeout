import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge';
import { TYPE_CONFIG } from '@/components/leave/constants';
import { fmt, getLeaveEnd, getLeaveStart } from '@/components/leave/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import type { Holiday } from '@/types/holiday';
import type { LeaveWithEmployee } from '@/types/leave';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';
import { CheckCircle2, XCircle } from 'lucide-react';
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
    <div className='min-h-0 flex-1 overflow-auto'>
      <table className='min-h-full w-full min-w-[720px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
            <th className='px-4 py-3.5 text-left'>Employee</th>
            <th className='px-4 py-3.5 text-left'>Leave type</th>
            <th className='px-4 py-3.5 text-left'>From</th>
            <th className='px-4 py-3.5 text-left'>To</th>
            <th className='px-4 py-3.5 text-left'>Days</th>
            <th className='px-4 py-3.5 text-left'>Reason</th>
            <th className='px-4 py-3.5 text-left'>Status</th>
            <th className='px-4 py-3.5 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
              >
                No leave requests match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const typeCfg = TYPE_CONFIG[row.type] ?? TYPE_CONFIG.ANNUAL;
              const isBusy = busyId === row.id;
              const name = row.user?.name ?? '—';
              return (
                <tr
                  key={row.id}
                  className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                >
                  <td className='px-4 py-2 text-left align-top font-medium text-gray-900'>
                    <span>{name}</span>
                  </td>
                  <td className='px-4 py-2 text-left align-top'>
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                    >
                      {typeCfg.label}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-4 py-2 text-left align-top text-gray-700'>
                    {fmt(getLeaveStart(row))}
                  </td>
                  <td className='whitespace-nowrap px-4 py-2 text-left align-top text-gray-700'>
                    {fmt(getLeaveEnd(row))}
                  </td>
                  <td className='whitespace-nowrap px-4 py-2 text-left align-top text-gray-700'>
                    {workingDaysForLeaveRange(
                      getLeaveStart(row),
                      getLeaveEnd(row),
                      holidays,
                    )}{' '}
                    day(s)
                  </td>
                  <td className='max-w-[220px] px-4 py-2 text-left align-top text-gray-600'>
                    <span className='line-clamp-2 text-left' title={row.reason}>
                      {row.reason || '—'}
                    </span>
                  </td>
                  <td className='px-4 py-2 text-left align-top'>
                    <LeaveStatusBadge status={row.status} />
                  </td>
                  <td className='px-4 py-2 text-right align-top'>
                    {canModerate && row.status === 'PENDING' ? (
                      <div className='flex justify-end gap-2'>
                        <button
                          type='button'
                          disabled={isBusy}
                          onClick={() => onApproveReject(row.id, 'APPROVED')}
                          className='inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <CheckCircle2 size={13} />
                          Approve
                        </button>
                        <button
                          type='button'
                          disabled={isBusy}
                          onClick={() => openRejectModal(row.id)}
                          className='inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className='text-xs text-gray-400'>—</span>
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
          className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-red-300 focus:ring-2 focus:ring-red-100'
        />
        {!rejectReason.trim() ? (
          <p className='mt-2 text-xs text-rose-600'>Rejection reason is required.</p>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
