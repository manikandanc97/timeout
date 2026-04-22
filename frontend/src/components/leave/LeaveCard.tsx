'use client';

/**
 * Single leave row on “My leaves”: shows details and, for pending requests,
 * edit (placeholder) and delete. Delete opens ConfirmModal before calling the API.
 */

import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';
import { CalendarDays, ChevronDown, ChevronUp, Clock3, FileText, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import LeaveStatusBadge from './LeaveStatusBadge';
import { TYPE_CONFIG } from './constants';
import { fmt, getLeaveEnd, getLeaveStart } from './utils';

type Props = {
  leave: Leave;
  deletingId: number | null;
  holidays?: Holiday[];
  /** Return true when delete succeeded so the confirmation modal can close */
  onDelete: (id: number) => Promise<boolean>;
  isReadOnly?: boolean;
};

export default function LeaveCard({
  leave,
  deletingId,
  onDelete,
  holidays = [],
  isReadOnly = false,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const isDeletingThis = deletingId === leave.id;
  const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
  const TypeIcon = typeCfg.icon;
  const start = getLeaveStart(leave);
  const end = getLeaveEnd(leave);
  const workingDays = workingDaysForLeaveRange(start, end, holidays);
  const isPending = leave.status === 'PENDING';
  const durationLabel =
    workingDays > 0
      ? `${workingDays} working ${workingDays === 1 ? 'day' : 'days'}`
      : 'Dates unavailable';

  return (
    <div
      className={`group relative flex flex-col gap-4 rounded-xl border border-border border-l-4 bg-card p-5 text-card-foreground shadow-sm transition-all duration-200 hover:bg-muted/40 hover:shadow-md md:flex-row ${typeCfg.accentBorder}`}
    >
      <div className='flex min-w-0 flex-1 items-start gap-3.5'>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${typeCfg.bg} ${typeCfg.border}`}
        >
          <TypeIcon size={18} className={typeCfg.text} />
        </div>

        <div className='flex flex-col flex-1 justify-center mt-0.5 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            {leave.user?.name && (
              <span className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80'>
                {leave.user.name} &bull;
              </span>
            )}
            <span className={`text-sm font-bold ${typeCfg.text}`}>
              {typeCfg.label}
            </span>
            <LeaveStatusBadge status={leave.status} />
          </div>
          <p className='mb-2 text-xs text-muted-foreground'>
            Req #{String(leave.id).padStart(3, '0')} &bull;{' '}
            {typeCfg.description}
          </p>

          {leave.reason && (
            <div className='flex items-start gap-1.5 mt-0.5'>
              <FileText
                size={14}
                className={`mt-0.5 shrink-0 ${typeCfg.text} opacity-70`}
              />
              <p className='line-clamp-2 text-[13px] leading-relaxed text-muted-foreground'>
                {leave.reason}
              </p>
            </div>
          )}

          {leave.status === 'REJECTED' && leave.rejectionReason && (
            <div className='mt-2'>
              <button
                type='button'
                onClick={() => setShowRejectionReason((prev) => !prev)}
                className='inline-flex items-center gap-1 rounded-md border border-danger-muted-foreground/30 bg-danger-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-danger-muted-foreground transition-colors hover:opacity-90'
              >
                Rejection reason
                {showRejectionReason ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showRejectionReason ? (
                <div className='mt-1.5 rounded-lg border border-danger-muted-foreground/20 bg-danger-muted px-2.5 py-2'>
                  <p className='text-[13px] leading-relaxed text-danger-muted-foreground'>
                    {leave.rejectionReason}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className='flex shrink-0 flex-col justify-between gap-3 border-t border-border pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0 md:items-end'>
        <div className='flex flex-wrap gap-2'>
          <div className='flex items-center gap-1.5 rounded-md border border-border bg-muted/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground'>
            <CalendarDays size={13} className='opacity-80' />
            <span>
              {fmt(start)} &rarr; {fmt(end)}
            </span>
          </div>

          <div className='flex items-center gap-1.5 rounded-md border border-border bg-muted/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground'>
            <Clock3 size={13} className='opacity-80' />
            <span>{durationLabel}</span>
          </div>
        </div>

        {!isReadOnly && isPending && (
          <div className='flex items-center self-start md:self-end gap-2 mt-1'>
            <Button
              type='button'
              unstyled
              onClick={() => toast('Leave editing is not wired up yet.')}
              className='inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-card p-1.5 text-muted-foreground shadow-xs transition-colors hover:bg-muted hover:text-card-foreground'
            >
              <Pencil size={14} />
            </Button>

            <Button
              type='button'
              unstyled
              onClick={() => setConfirmOpen(true)}
              disabled={isDeletingThis}
              className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger-muted-foreground/35 bg-card p-1.5 text-danger-muted-foreground shadow-xs transition-colors hover:bg-danger-muted disabled:cursor-not-allowed disabled:opacity-50'
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
