'use client';

import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import { BriefcaseBusiness } from 'lucide-react';
import { formatPersonName } from '@/lib/personName';
import InitialsAvatar from './InitialsAvatar';
import { formatDate, requestListClass, SLOT_MIN_H, type CompOffRow } from './pendingRequestsUtils';

type Props = {
  rows: CompOffRow[];
  busyId: number | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
};

export default function PendingCompOffList({ rows, busyId, onApprove, onReject }: Props) {
  return (
    <ul className={requestListClass} aria-label='Pending comp off requests'>
      {rows.length === 0 ? (
        <li className='flex flex-1 flex-col items-center justify-center gap-2 px-2 py-8 text-center'>
          <BriefcaseBusiness size={18} strokeWidth={1.5} className='text-muted-foreground' aria-hidden />
          <p className='max-w-xs text-sm leading-relaxed text-muted-foreground'>No pending comp off requests.</p>
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
                  <span className='rounded-md bg-indigo-500/12 px-2 py-0.5 text-[11px] font-semibold text-indigo-800 dark:bg-indigo-400/18 dark:text-indigo-200'>
                    Comp off
                  </span>
                </div>
                <p className='mt-0.5 text-muted-foreground text-xs line-clamp-1'>
                  Worked on {formatDate(row.workDate)}
                  <span className='mx-1.5 text-muted-foreground/70'>•</span>
                  <span>{row.reason}</span>
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
