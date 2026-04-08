export const LEAVE_BALANCE_LABELS = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
} as const;

export type LeaveBalanceLabelKey = keyof typeof LEAVE_BALANCE_LABELS;
