export type NotificationType =
  | 'LEAVE_APPLIED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'LEAVE_CANCELLED'
  | 'PERMISSION_APPLIED'
  | 'PERMISSION_APPROVED'
  | 'PERMISSION_REJECTED'
  | 'COMP_OFF_APPLIED'
  | 'COMP_OFF_APPROVED'
  | 'COMP_OFF_REJECTED'
  | 'EMPLOYEE_ADDED'
  | 'EMPLOYEE_UPDATED'
  | 'EMPLOYEE_DEACTIVATED'
  | 'EMPLOYEE_REACTIVATED'
  | 'SALARY_STRUCTURE_UPDATED'
  | 'HOLIDAY_CREATED'
  | 'HOLIDAY_UPDATED'
  | 'HOLIDAY_DELETED'
  | 'LEAVE_POLICY_UPDATED'
  | 'ADMIN_SETTINGS_UPDATED'
  | 'ORG_STRUCTURE_UPDATED'
  | 'PAYROLL_UPDATED'
  | 'PAYSLIP_PAID'
  | 'ATTENDANCE_REGULARIZATION_APPLIED'
  | 'ATTENDANCE_REGULARIZATION_APPROVED'
  | 'ATTENDANCE_REGULARIZATION_REJECTED'
  | 'WFH_APPLIED';

export type AppNotification = {
  id: number;
  userId: number;
  organizationId: number;
  type: NotificationType;
  title: string;
  body: string | null;
  readAt: string | null;
  leaveId: number | null;
  createdAt: string;
};
