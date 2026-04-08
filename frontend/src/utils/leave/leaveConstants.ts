export const LEAVE_POLICY = {
  ANNUAL_LEAVE: 'Annual leave policy text',
  SICK_LEAVE: 'Sick leave policy text',
  MATERNITY_LEAVE: 'Maternity leave policy text',
  PATERNITY_LEAVE: 'Paternity leave policy text',
} as const;

export const LEAVE_BALANCE_LABELS = {
  ANNUAL_LEAVE: 'Annual',
  SICK_LEAVE: 'Sick',
  MATERNITY_LEAVE: 'Maternity',
  PATERNITY_LEAVE: 'Paternity',
} as const;

export type LeavePolicyKey = keyof typeof LEAVE_POLICY;
