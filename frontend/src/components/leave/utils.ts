import type { Leave } from '@/types/leave';

export const fmt = (d?: string) => {
  if (!d) return 'Date unavailable';
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getLeaveStart = (leave: Leave) =>
  leave.startDate ?? leave.startDate ?? '';
export const getLeaveEnd = (leave: Leave) =>
  leave.endDate ?? leave.endDate ?? '';
