import type { LeavePolicyIconKey } from '@/types/leavePolicy';

export const LEAVE_POLICY_ICON_OPTIONS: { value: LeavePolicyIconKey; label: string }[] = [
  { value: 'BookOpen', label: 'Book' },
  { value: 'CalendarClock', label: 'Calendar' },
  { value: 'FileCheck', label: 'Checklist' },
  { value: 'Users', label: 'People' },
  { value: 'Scale', label: 'Scale / rules' },
];
