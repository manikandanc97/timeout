import { Baby, Stethoscope, Umbrella, CalendarClock, Home } from 'lucide-react';
import type { ElementType } from 'react';
import type { LeaveType, LeaveStatus } from '@/types/leave';

export type FilterValue<T extends string> = 'ALL' | T;

export const TYPE_CONFIG: Record<
  LeaveType,
  {
    label: string;
    description: string;
    icon: ElementType;
    bg: string;
    text: string;
    border: string;
    accentBorder: string;
  }
> = {
  ANNUAL: {
    label: 'Annual Leave',
    description: 'Planned time away from work',
    icon: Umbrella,
    bg: 'bg-cyan-500/12',
    text: 'text-cyan-700',
    border: 'border-cyan-500/25',
    accentBorder: 'border-l-cyan-500',
  },
  SICK: {
    label: 'Sick Leave',
    description: 'Health, recovery, and care',
    icon: Stethoscope,
    bg: 'bg-rose-500/12',
    text: 'text-rose-700',
    border: 'border-rose-500/25',
    accentBorder: 'border-l-rose-500',
  },
  COMP_OFF: {
    label: 'Comp Off',
    description: 'Time-off using weekend work credits',
    icon: CalendarClock,
    bg: 'bg-indigo-500/12',
    text: 'text-indigo-700',
    border: 'border-indigo-500/25',
    accentBorder: 'border-l-indigo-500',
  },
  MATERNITY: {
    label: 'Maternity Leave',
    description: 'Parental support and care',
    icon: Baby,
    bg: 'bg-pink-500/12',
    text: 'text-pink-700',
    border: 'border-pink-500/25',
    accentBorder: 'border-l-pink-500',
  },
  PATERNITY: {
    label: 'Paternity Leave',
    description: 'Parental support and care',
    icon: Baby,
    bg: 'bg-violet-500/12',
    text: 'text-violet-700',
    border: 'border-violet-500/25',
    accentBorder: 'border-l-violet-500',
  },
  WFH: {
    label: 'Work From Home',
    description: 'Remote work request',
    icon: Home,
    bg: 'bg-emerald-500/12',
    text: 'text-emerald-700',
    border: 'border-emerald-500/25',
    accentBorder: 'border-l-emerald-500',
  },
};

export const TYPE_FILTER_OPTIONS: Array<{ value: LeaveType; label: string }> = [
  { value: 'ANNUAL', label: TYPE_CONFIG.ANNUAL.label },
  { value: 'SICK', label: TYPE_CONFIG.SICK.label },
  { value: 'COMP_OFF', label: TYPE_CONFIG.COMP_OFF.label },
  { value: 'MATERNITY', label: TYPE_CONFIG.MATERNITY.label },
  { value: 'PATERNITY', label: TYPE_CONFIG.PATERNITY.label },
  { value: 'WFH', label: TYPE_CONFIG.WFH.label },
];

/** Same rules as Apply Leave: maternity only for female, paternity only for male. */
export function typeFilterOptionsForGender(
  gender: string | undefined | null,
): Array<{ value: LeaveType; label: string }> {
  return TYPE_FILTER_OPTIONS.filter((opt) => {
    if (opt.value === 'MATERNITY') return gender === 'FEMALE';
    if (opt.value === 'PATERNITY') return gender === 'MALE';
    return true;
  });
}

export const STATUS_FILTER_OPTIONS: Array<{
  value: FilterValue<LeaveStatus>;
  label: string;
}> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const STATUS_SUMMARY_CONFIG: Record<
  LeaveStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
  },
};
