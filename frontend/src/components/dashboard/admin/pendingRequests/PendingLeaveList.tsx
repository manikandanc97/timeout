'use client';

import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import { formatPersonName } from '@/lib/personName';
import type { Holiday } from '@/types/holiday';
import type { LeaveWithEmployee } from '@/types/leave';
import InitialsAvatar from './InitialsAvatar';
import {
  formatDate,
  getLeaveDaysLabel,
  LEAVE_TYPE_COLORS,
  leaveTypeLabel,
  requestListClass,
  SLOT_MIN_H,
} from './pendingRequestsUtils';
import { ClipboardList } from 'lucide-react';

type Props = {
  rows: LeaveWithEmployee[];
  busyId: number | null;
  holidays: Holiday[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

export default function PendingLeaveList({
  rows,
  busyId,
  holidays,
  onApprove,
  onReject,
}: Props) {
  return (
    <ul className={requestListClass} aria-label='Pending leave requests'>
      {rows.length === 0 ? (
        <li className='flex flex-1 flex-col items-center justify-center gap-2 px-2 py-8 text-center'>
          <ClipboardList size={18} strokeWidth={1.5} className='text-muted-foreground' aria-hidden />
          <p className='max-w-xs text-sm leading-relaxed text-muted-foreground'>
            No pending leave requests. New submissions will appear here.
          </p>
        </li>
      ) : null}
      {rows.map((row) => {
        const name = formatPersonName(row.user?.name) || 'Unknown';
        const typeColors = LEAVE_TYPE_COLORS[row.type] ?? {
          bg: 'bg-muted',
          text: 'text-muted-foreground',
        };
        const daysLabel = getLeaveDaysLabel(row, holidays);

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
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeColors.bg} ${typeColors.text}`}>
                    {leaveTypeLabel(row.type)}
                  </span>
                </div>
                <p className='mt-0.5 text-muted-foreground text-xs'>
                  {formatDate(row.startDate)} → {formatDate(row.endDate)}
                  <span className='mx-1.5 text-muted-foreground/70'>•</span>
                  <span>{daysLabel}</span>
                </p>
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
