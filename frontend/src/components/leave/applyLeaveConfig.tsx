import type { LeaveBalance, LeaveType } from '@/types/leave';
import {
  Stethoscope,
  Baby,
  Umbrella,
  BriefcaseBusiness,
  Home,
} from 'lucide-react';
import type { ElementType } from 'react';

export const leaveTypeConfig: Record<
  LeaveType,
  {
    icon: ElementType;
    color: string;
    bg: string;
    border: string;
    ring: string;
    label: string;
    desc: string;
  }
> = {
  ANNUAL: {
    icon: Umbrella,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/12',
    border: 'border-cyan-500/30',
    ring: 'ring-cyan-500',
    label: 'Annual Leave',
    desc: 'Planned time off',
  },
  SICK: {
    icon: Stethoscope,
    color: 'text-rose-500',
    bg: 'bg-rose-500/12',
    border: 'border-rose-500/30',
    ring: 'ring-rose-400',
    label: 'Sick Leave',
    desc: 'Medical and wellness',
  },
  MATERNITY: {
    icon: Baby,
    color: 'text-pink-500',
    bg: 'bg-pink-500/12',
    border: 'border-pink-500/30',
    ring: 'ring-pink-400',
    label: 'Maternity Leave',
    desc: 'Parental care',
  },
  PATERNITY: {
    icon: Baby,
    color: 'text-violet-500',
    bg: 'bg-violet-500/12',
    border: 'border-violet-500/30',
    ring: 'ring-violet-400',
    label: 'Paternity Leave',
    desc: 'Parental care',
  },
  COMP_OFF: {
    icon: BriefcaseBusiness,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500/12',
    border: 'border-indigo-500/30',
    ring: 'ring-indigo-500',
    label: 'Comp Off',
    desc: 'Use weekend-work credits',
  },
  WFH: {
    icon: Home,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/12',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500',
    label: 'Work From Home',
    desc: 'Remote work request',
  },
};

export const balanceKeyMap: Partial<Record<LeaveType, keyof LeaveBalance>> = {
  ANNUAL: 'annual',
  SICK: 'sick',
  COMP_OFF: 'compOff',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
};
