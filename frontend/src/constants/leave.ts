export const LEAVE_BALANCE_LABELS = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
} as const;

export type LeaveBalanceLabelKey = keyof typeof LEAVE_BALANCE_LABELS;

export const LEAVE_TYPE_CONFIG = {
  ANNUAL: {
    label: 'Annual Leave',
    accentClass: 'bg-cyan-500',
    iconBgClass: 'bg-cyan-50',
    iconBorderClass: 'border-cyan-200',
    iconColorClass: 'text-cyan-600',
    labelColorClass: 'text-cyan-600',
  },
  SICK: {
    label: 'Sick Leave',
    accentClass: 'bg-rose-500',
    iconBgClass: 'bg-rose-50',
    iconBorderClass: 'border-rose-200',
    iconColorClass: 'text-rose-600',
    labelColorClass: 'text-rose-600',
  },
  MATERNITY: {
    label: 'Maternity Leave',
    accentClass: 'bg-pink-500',
    iconBgClass: 'bg-pink-50',
    iconBorderClass: 'border-pink-200',
    iconColorClass: 'text-pink-600',
    labelColorClass: 'text-pink-600',
  },
  PATERNITY: {
    label: 'Paternity Leave',
    accentClass: 'bg-violet-500',
    iconBgClass: 'bg-violet-50',
    iconBorderClass: 'border-violet-200',
    iconColorClass: 'text-violet-600',
    labelColorClass: 'text-violet-600',
  },
} as const;

export type LeaveTypeConfigKey = keyof typeof LEAVE_TYPE_CONFIG;

export const LEAVE_STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
] as const;

export const LEAVE_TYPE_BASE_OPTIONS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Annual Leave', value: 'ANNUAL' },
  { label: 'Sick Leave', value: 'SICK' },
] as const;

export const LEAVE_TYPE_GENDER_OPTIONS = {
  FEMALE: { label: 'Maternity Leave', value: 'MATERNITY' },
  MALE: { label: 'Paternity Leave', value: 'PATERNITY' },
} as const;

export const SUMMARY_CHIP_CONFIG = [
  {
    key: 'total' as const,
    label: 'Total',
    filterValue: 'ALL' as const,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
    hoverClass: 'hover:bg-gray-200',
    activeRing: 'ring-gray-400',
  },
  {
    key: 'approved' as const,
    label: 'Approved',
    filterValue: 'APPROVED' as const,
    bgClass: 'bg-green-100',
    textClass: 'text-emerald-700',
    hoverClass: 'hover:bg-green-200',
    activeRing: 'ring-emerald-400',
  },
  {
    key: 'pending' as const,
    label: 'Pending',
    filterValue: 'PENDING' as const,
    bgClass: 'bg-orange-100',
    textClass: 'text-amber-700',
    hoverClass: 'hover:bg-orange-200',
    activeRing: 'ring-amber-400',
  },
  {
    key: 'rejected' as const,
    label: 'Rejected',
    filterValue: 'REJECTED' as const,
    bgClass: 'bg-red-100',
    textClass: 'text-rose-700',
    hoverClass: 'hover:bg-red-200',
    activeRing: 'ring-rose-400',
  },
] as const;
