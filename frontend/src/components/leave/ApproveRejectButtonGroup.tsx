'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

const approveBtnClass =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-success-muted px-2 py-1 text-xs font-semibold text-success-muted-foreground ring-1 ring-success-muted-foreground/25 transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5';

const rejectBtnClass =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-danger-muted px-2 py-1 text-xs font-semibold text-danger-muted-foreground ring-1 ring-danger-muted-foreground/30 transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-2.5';

const groupClass =
  'flex min-w-0 flex-wrap items-center gap-1.5 sm:flex-nowrap sm:gap-2';

type Props = {
  disabled?: boolean;
  onApprove: () => void;
  onReject: () => void;
  /** Extra classes on the outer wrapper (e.g. dashboard layout). */
  className?: string;
};

/**
 * Shared Approve / Reject styling for leave, permission, comp off, and dashboard moderation rows.
 */
export default function ApproveRejectButtonGroup({
  disabled = false,
  onApprove,
  onReject,
  className = '',
}: Props) {
  return (
    <div className={`${groupClass} ${className}`.trim()}>
      <button type='button' disabled={disabled} onClick={onApprove} className={approveBtnClass}>
        <CheckCircle2 size={13} className='shrink-0' aria-hidden />
        Approve
      </button>
      <button type='button' disabled={disabled} onClick={onReject} className={rejectBtnClass}>
        <XCircle size={13} className='shrink-0' aria-hidden />
        Reject
      </button>
    </div>
  );
}
