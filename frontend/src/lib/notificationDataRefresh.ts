import type { AppNotification } from '@/types/notification';
import {
  requestDashboardRefresh,
  type DashboardRefreshScope,
} from '@/lib/dashboardRealtimeBus';

/**
 * Maps a persisted notification to dashboard refresh scopes for the current user.
 * Only scopes relevant to this session should be subscribed in each component.
 */
function getRefreshScopesForNotification(
  n: AppNotification,
  userRole?: string | null,
): DashboardRefreshScope[] {
  const role = String(userRole ?? '').toUpperCase();
  const isModerator = role === 'ADMIN' || role === 'MANAGER' || role === 'HR';

  switch (n.type) {
    case 'LEAVE_APPLIED':
      if (!isModerator) return [];
      return [
        'adminDashboardStats',
        'adminPendingRequests',
        'leaveRequestsPage',
      ];
    case 'LEAVE_CANCELLED':
      if (!isModerator) return [];
      return ['adminDashboardStats', 'adminPendingRequests', 'leaveRequestsPage'];
    case 'PERMISSION_APPLIED':
    case 'COMP_OFF_APPLIED':
      if (!isModerator) return [];
      return ['adminPendingRequests', 'leaveRequestsPage'];
    case 'LEAVE_APPROVED':
    case 'LEAVE_REJECTED':
      return ['employeeDashboard', 'employeeLeavesPage'];
    case 'PERMISSION_APPROVED':
    case 'PERMISSION_REJECTED':
    case 'COMP_OFF_APPROVED':
    case 'COMP_OFF_REJECTED':
      return ['leaveRequestsPage'];
    case 'SALARY_STRUCTURE_UPDATED':
      return ['payrollSummary', 'employeePayslips'];
    case 'EMPLOYEE_DEACTIVATED':
    case 'EMPLOYEE_REACTIVATED':
    case 'EMPLOYEE_UPDATED':
    case 'EMPLOYEE_ADDED':
    case 'ORG_STRUCTURE_UPDATED':
    case 'HOLIDAY_CREATED':
    case 'HOLIDAY_UPDATED':
    case 'HOLIDAY_DELETED':
    case 'LEAVE_POLICY_UPDATED':
    case 'ADMIN_SETTINGS_UPDATED':
      return isModerator ? ['adminDashboardStats'] : [];
    case 'PAYROLL_UPDATED':
      return ['payrollSummary'];
    case 'PAYSLIP_PAID':
      return ['employeePayslips'];
    default:
      return [];
  }
}

/** Fire refresh scopes from a notification (used by Socket handler). */
export function refreshDashboardForNotification(
  n: AppNotification,
  userRole?: string | null,
) {
  const scopes = getRefreshScopesForNotification(n, userRole);
  if (scopes.length) requestDashboardRefresh(scopes);
}
