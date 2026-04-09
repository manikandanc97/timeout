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

export const countDays = (from?: string, to?: string) => {
  const start = new Date(from ?? '');
  const end = new Date(to ?? '');

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1,
  );
};

export const getLeaveStart = (leave: Leave) => leave.fromDate ?? leave.startDate ?? '';
export const getLeaveEnd = (leave: Leave) => leave.toDate ?? leave.endDate ?? '';
