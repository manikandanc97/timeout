'use client';

import type { LeaveStatus } from '@/types/leave';

const STATUS_BADGE_CONFIG = {
  APPROVED: {
    label: 'Approved',
    bg: 'bg-success-muted',
    text: 'text-success-muted-foreground',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-danger-muted',
    text: 'text-danger-muted-foreground',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-warning-muted',
    text: 'text-warning-muted-foreground',
  },
} as const;

type Props = {
  status: LeaveStatus | string;
  className?: string;
};

const LeaveStatusBadge = ({ status, className = '' }: Props) => {
  const normalizedStatus = status?.toUpperCase() as keyof typeof STATUS_BADGE_CONFIG;
  const config =
    STATUS_BADGE_CONFIG[normalizedStatus] ?? STATUS_BADGE_CONFIG.PENDING;

  return (
    <span
      className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold leading-none ${config.bg} ${config.text} ${className}`.trim()}
    >
      {config.label}
    </span>
  );
};

export { STATUS_BADGE_CONFIG };

export default LeaveStatusBadge;
