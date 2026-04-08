export const LEAVE_BALANCE_LABELS = {
  ANNUAL_LEAVE: 'Annual',
  SICK_LEAVE: 'Sick',
  MATERNITY_LEAVE: 'Maternity',
  PATERNITY_LEAVE: 'Paternity',
} as const;

export type LeaveBalanceLabelKey = keyof typeof LEAVE_BALANCE_LABELS;
