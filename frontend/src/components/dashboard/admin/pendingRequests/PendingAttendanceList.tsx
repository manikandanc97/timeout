'use client';

import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import { formatPersonName } from '@/lib/personName';
import type { RegularizationRequest } from '@/types/attendance';
import InitialsAvatar from './InitialsAvatar';
import {
  formatDate,
  requestListClass,
  SLOT_MIN_H,
} from './pendingRequestsUtils';
import { ClipboardList, Clock } from 'lucide-react';

type Props = {
  rows: RegularizationRequest[];
  busyId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

export default function PendingAttendanceList({
  rows,
  busyId,
  onApprove,
  onReject,
}: Props) {
  return (
    <ul className={requestListClass} aria-label='Pending attendance regularization requests'>
      {rows.length === 0 ? (
        <li className='flex flex-1 flex-col items-center justify-center gap-2 px-2 py-8 text-center'>
          <ClipboardList size={18} strokeWidth={1.5} className='text-muted-foreground' aria-hidden />
          <p className='max-w-xs text-sm leading-relaxed text-muted-foreground'>
            No pending regularization requests. New submissions will appear here.
          </p>
        </li>
      ) : null}
      {rows.map((row) => {
        const name = formatPersonName(row.user?.name) || 'Unknown';
        
        return (
          <li
            key={row.id}
            className={`group flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-muted/70 hover:bg-muted p-3 rounded-xl transition-colors duration-150 ${SLOT_MIN_H}`}
          >
            <div className='flex items-center gap-3 min-w-0'>
              <InitialsAvatar name={name} />
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <p className='font-semibold text-card-foreground text-sm'>{name}</p>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/12 text-emerald-800 dark:text-emerald-200`}>
                    Regularization
                  </span>
                </div>
                <div className='mt-1 flex items-center gap-2 text-muted-foreground text-[11px]'>
                  <span className='font-medium'>{formatDate(row.date)}</span>
                  <span className='text-muted-foreground/50'>•</span>
                  <div className='flex items-center gap-1'>
                    <Clock size={10} />
                    <span>{row.requestedCheckIn || '--:--'}</span>
                    <span>→</span>
                    <span>{row.requestedCheckOut || '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='shrink-0 pl-11 sm:pl-0'>
              <ApproveRejectButtonGroup
                disabled={busyId === row.id}
                onApprove={() => onApprove(row.id)}
                onReject={() => onReject(row.id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
