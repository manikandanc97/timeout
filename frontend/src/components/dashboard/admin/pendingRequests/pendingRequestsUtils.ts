import type { Holiday } from '@/types/holiday';
import type { LeaveWithEmployee } from '@/types/leave';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';

export const SLOT_COUNT = 3;
export const SLOT_MIN_H = 'min-h-[5.75rem] sm:min-h-[5.25rem]';
const REQUEST_LIST_MIN_H =
  'min-h-[calc(3*5.75rem+2*0.5rem)] sm:min-h-[calc(3*5.25rem+2*0.5rem)]';
export const requestListClass = `flex flex-col gap-2 ${REQUEST_LIST_MIN_H}`;

export const LEAVE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  ANNUAL: { bg: 'bg-sky-500/12 dark:bg-sky-400/18', text: 'text-sky-800 dark:text-sky-200' },
  SICK: { bg: 'bg-rose-500/12 dark:bg-rose-400/18', text: 'text-rose-800 dark:text-rose-200' },
  MATERNITY: { bg: 'bg-pink-500/12 dark:bg-pink-400/18', text: 'text-pink-800 dark:text-pink-200' },
  PATERNITY: { bg: 'bg-violet-500/12 dark:bg-violet-400/18', text: 'text-violet-800 dark:text-violet-200' },
};

export type PermissionRow = {
  id: number;
  date: string;
  durationMinutes: number;
  reason: string;
  user?: { name?: string | null } | null;
};

export type CompOffRow = {
  id: number;
  workDate: string;
  reason: string;
  createdAt: string;
  status?: string;
  user?: { name?: string | null } | null;
};

export function leaveTypeLabel(type: string) {
  const lower = type.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1) + ' leave';
}

export function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export function sortPendingLeaves(rows: LeaveWithEmployee[]) {
  return rows
    .filter((row) => row.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

export function sortPendingCompOff(rows: CompOffRow[]) {
  return rows
    .filter((r) => r.status == null || r.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
}

export function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function getLeaveDaysLabel(row: LeaveWithEmployee, holidays: Holiday[]) {
  const workingDays = workingDaysForLeaveRange(row.startDate, row.endDate, holidays);
  return `${workingDays} working ${workingDays === 1 ? 'day' : 'days'}`;
}
