'use client';

import { Clock3 } from 'lucide-react';
import { formatPersonName } from '@/lib/personName';
import { formatDate, formatMinutes, requestListClass, SLOT_MIN_H, type PermissionRow } from './pendingRequestsUtils';

type Props = {
  rows: PermissionRow[];
};

export default function PendingPermissionList({ rows }: Props) {
  return (
    <ul className={requestListClass} aria-label='Permission requests'>
      {rows.length === 0 ? (
        <li className='flex flex-1 flex-col items-center justify-center gap-2 px-2 py-8 text-center'>
          <Clock3 size={18} strokeWidth={1.5} className='text-muted-foreground' aria-hidden />
          <p className='max-w-xs text-sm leading-relaxed text-muted-foreground'>No permission requests yet.</p>
        </li>
      ) : null}
      {rows.map((row) => (
        <li key={row.id} className={`flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3 ${SLOT_MIN_H}`}>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <p className='text-sm font-semibold text-card-foreground'>{formatPersonName(row.user?.name) || 'Unknown'}</p>
              <span className='rounded-md bg-sky-500/12 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:bg-sky-400/18 dark:text-sky-200'>
                Permission
              </span>
            </div>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {formatDate(row.date)} • {formatMinutes(row.durationMinutes)}
            </p>
            <p className='mt-1 line-clamp-1 text-xs text-muted-foreground'>{row.reason}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
