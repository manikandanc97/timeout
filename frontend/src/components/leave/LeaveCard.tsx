'use client';

/**
 * Single leave row on “My leaves”: shows details and, for pending requests,
 * edit (placeholder) and delete. Delete opens ConfirmModal before calling the API.
 */

import type { Leave } from '@/types/leave';
import { CalendarDays, Clock3, FileText, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import LeaveStatusBadge from './LeaveStatusBadge';
import { TYPE_CONFIG } from './constants';
import { countDays, fmt, getLeaveEnd, getLeaveStart } from './utils';

type Props = {
  leave: Leave;
  deletingId: number | null;
  /** Return true when delete succeeded so the confirmation modal can close */
  onDelete: (id: number) => Promise<boolean>;
};

export default function LeaveCard({ leave, deletingId, onDelete }: Props) {
  // Controls the “Are you sure?” dialog for this card only
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDeletingThis = deletingId === leave.id;
  const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
  const TypeIcon = typeCfg.icon;
  const start = getLeaveStart(leave);
  const end = getLeaveEnd(leave);
  const days = countDays(start, end);
  const isPending = leave.status === 'PENDING';
  const durationLabel =
    days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : 'Dates unavailable';

  return (
    <div className='group relative flex md:flex-row flex-col gap-4 bg-white hover:bg-gray-50/50 shadow-sm hover:shadow-md p-5 border border-gray-100 rounded-xl transition-all duration-200'>
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${typeCfg.accent} rounded-l-xl opacity-80`}
      />

      <div className='flex flex-1 items-start gap-3.5 pl-1 min-w-0'>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${typeCfg.bg} ${typeCfg.border}`}
        >
          <TypeIcon size={18} className={typeCfg.text} />
        </div>

        <div className='flex flex-col flex-1 justify-center mt-0.5 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span className={`text-sm font-bold ${typeCfg.text}`}>
              {typeCfg.label}
            </span>
            <LeaveStatusBadge status={leave.status} />
          </div>
          <p className='mb-2 text-gray-500 text-xs'>
            Req #{String(leave.id).padStart(3, '0')} &bull;{' '}
            {typeCfg.description}
          </p>

          {leave.reason && (
            <div className='flex items-start gap-1.5 mt-0.5'>
              <FileText
                size={14}
                className={`mt-0.5 shrink-0 ${typeCfg.text} opacity-70`}
              />
              <p className='text-[13px] text-gray-600 line-clamp-2 leading-relaxed'>
                {leave.reason}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col justify-between md:items-end gap-3 pt-3 md:pt-0 md:pl-5 border-gray-100 border-t md:border-t-0 md:border-l shrink-0'>
        <div className='flex flex-wrap gap-2'>
          <div className='flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 border border-gray-100 rounded-md font-medium text-gray-600 text-xs'>
            <CalendarDays size={13} className='text-gray-400' />
            <span>
              {fmt(start)} &rarr; {fmt(end)}
            </span>
          </div>

          <div className='flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1.5 border border-gray-100 rounded-md font-medium text-gray-600 text-xs'>
            <Clock3 size={13} className='text-gray-400' />
            <span>{durationLabel}</span>
          </div>
        </div>

        {isPending && (
          <div className='flex items-center self-start md:self-end gap-2 mt-1'>
            <Button
              type='button'
              unstyled
              onClick={() => toast.info('Leave editing is not wired up yet.')}
              className='inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 shadow-xs transition-colors hover:border-gray-300 hover:bg-gray-50'
            >
              <Pencil size={14} />
            </Button>

            <Button
              type='button'
              unstyled
              onClick={() => setConfirmOpen(true)}
              disabled={isDeletingThis}
              className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white p-1.5 text-red-500 shadow-xs transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isDeletingThis ? (
                <span className='inline-block border-2 border-red-600/30 border-t-red-600 rounded-full w-3.5 h-3.5 animate-spin' />
              ) : (
                <X size={14} strokeWidth={2.5} />
              )}
            </Button>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title='Confirm Delete'
        message='Are you sure you want to delete this leave request?'
        cancelLabel='Cancel'
        confirmLabel='Delete'
        isProcessing={isDeletingThis}
        onCancel={() => {
          if (!isDeletingThis) setConfirmOpen(false);
        }}
        onConfirm={async () => {
          const ok = await onDelete(leave.id);
          if (ok) setConfirmOpen(false);
        }}
      />
    </div>
  );
}
