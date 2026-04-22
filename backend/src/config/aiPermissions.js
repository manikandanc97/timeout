/**
 * AI Role-Permission Map
 * Defines which roles are allowed to trigger which AI actions.
 * This is the single source of truth for RBAC enforcement in the AI engine.
 *
 * Roles (from Prisma enum): EMPLOYEE, MANAGER, ADMIN
 */

export const AI_ACTIONS = {
  // ─── Self-service actions (all roles) ───────────────────────────────────
  APPLY_LEAVE: 'APPLY_LEAVE',
  APPLY_PERMISSION: 'APPLY_PERMISSION',
  APPLY_COMP_OFF: 'APPLY_COMP_OFF',
  CHECK_LEAVE_BALANCE: 'CHECK_LEAVE_BALANCE',
  VIEW_MY_LEAVES: 'VIEW_MY_LEAVES',
  VIEW_PAYSLIP: 'VIEW_PAYSLIP',

  // ─── Knowledge queries (all roles) ──────────────────────────────────────
  LEAVE_POLICY_FAQ: 'LEAVE_POLICY_FAQ',
  ATTENDANCE_POLICY_FAQ: 'ATTENDANCE_POLICY_FAQ',
  PAYROLL_FAQ: 'PAYROLL_FAQ',
  HOLIDAY_LIST: 'HOLIDAY_LIST',
  GENERAL_HR_FAQ: 'GENERAL_HR_FAQ',

  // ─── Manager-level actions ───────────────────────────────────────────────
  VIEW_PENDING_REQUESTS: 'VIEW_PENDING_REQUESTS',
  APPROVE_LEAVE: 'APPROVE_LEAVE',
  REJECT_LEAVE: 'REJECT_LEAVE',
  APPROVE_PERMISSION: 'APPROVE_PERMISSION',
  REJECT_PERMISSION: 'REJECT_PERMISSION',
  APPROVE_COMP_OFF: 'APPROVE_COMP_OFF',
  REJECT_COMP_OFF: 'REJECT_COMP_OFF',
  VIEW_TEAM_SUMMARY: 'VIEW_TEAM_SUMMARY',

  // ─── Admin-only actions ──────────────────────────────────────────────────
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  ACTIVATE_EMPLOYEE: 'ACTIVATE_EMPLOYEE',
  DEACTIVATE_EMPLOYEE: 'DEACTIVATE_EMPLOYEE',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  VIEW_ALL_LEAVES: 'VIEW_ALL_LEAVES',
  VIEW_PAYROLL_SUMMARY: 'VIEW_PAYROLL_SUMMARY',
  VIEW_AI_AUDIT_LOGS: 'VIEW_AI_AUDIT_LOGS',
  UPDATE_AI_SETTINGS: 'UPDATE_AI_SETTINGS',

  // ─── WFH actions ────────────────────────────────────────────────────────────
  APPLY_WFH: 'APPLY_WFH',

  // ─── Attendance actions ──────────────────────────────────────────────────────
  PUNCH_IN: 'PUNCH_IN',
  PUNCH_OUT: 'PUNCH_OUT',
  VIEW_ATTENDANCE: 'VIEW_ATTENDANCE',
  REQUEST_REGULARIZATION: 'REQUEST_REGULARIZATION',
  APPROVE_REGULARIZATION: 'APPROVE_REGULARIZATION',
  REJECT_REGULARIZATION: 'REJECT_REGULARIZATION',
  VIEW_PENDING_REGULARIZATIONS: 'VIEW_PENDING_REGULARIZATIONS',
};

/** Roles that are allowed to perform each action */
export const ROLE_PERMISSIONS = {
  [AI_ACTIONS.APPLY_LEAVE]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPLY_PERMISSION]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPLY_COMP_OFF]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.CHECK_LEAVE_BALANCE]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.VIEW_MY_LEAVES]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.VIEW_PAYSLIP]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],

  [AI_ACTIONS.LEAVE_POLICY_FAQ]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.ATTENDANCE_POLICY_FAQ]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.PAYROLL_FAQ]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.HOLIDAY_LIST]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.GENERAL_HR_FAQ]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],

  [AI_ACTIONS.VIEW_PENDING_REQUESTS]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPROVE_LEAVE]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.REJECT_LEAVE]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPROVE_PERMISSION]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.REJECT_PERMISSION]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPROVE_COMP_OFF]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.REJECT_COMP_OFF]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.VIEW_TEAM_SUMMARY]: ['MANAGER', 'ADMIN'],

  [AI_ACTIONS.ADD_EMPLOYEE]: ['ADMIN'],
  [AI_ACTIONS.UPDATE_EMPLOYEE]: ['ADMIN'],
  [AI_ACTIONS.DELETE_EMPLOYEE]: ['ADMIN'],
  [AI_ACTIONS.ACTIVATE_EMPLOYEE]: ['ADMIN'],
  [AI_ACTIONS.DEACTIVATE_EMPLOYEE]: ['ADMIN'],
  [AI_ACTIONS.ASSIGN_ROLE]: ['ADMIN'],
  [AI_ACTIONS.VIEW_ALL_LEAVES]: ['ADMIN'],
  [AI_ACTIONS.VIEW_PAYROLL_SUMMARY]: ['ADMIN'],
  [AI_ACTIONS.VIEW_AI_AUDIT_LOGS]: ['ADMIN'],
  [AI_ACTIONS.UPDATE_AI_SETTINGS]: ['ADMIN'],

  // WFH
  [AI_ACTIONS.APPLY_WFH]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],

  // Attendance
  [AI_ACTIONS.PUNCH_IN]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.PUNCH_OUT]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.VIEW_ATTENDANCE]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.REQUEST_REGULARIZATION]: ['EMPLOYEE', 'MANAGER', 'ADMIN'],
  [AI_ACTIONS.APPROVE_REGULARIZATION]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.REJECT_REGULARIZATION]: ['MANAGER', 'ADMIN'],
  [AI_ACTIONS.VIEW_PENDING_REGULARIZATIONS]: ['MANAGER', 'ADMIN'],
};

/**
 * Actions that require explicit user confirmation before execution.
 * These are irreversible or high-impact operations.
 */
export const CONFIRMATION_REQUIRED_ACTIONS = new Set([
  AI_ACTIONS.DELETE_EMPLOYEE,
  AI_ACTIONS.DEACTIVATE_EMPLOYEE,
  AI_ACTIONS.REJECT_LEAVE,
  AI_ACTIONS.REJECT_PERMISSION,
  AI_ACTIONS.REJECT_COMP_OFF,
  AI_ACTIONS.REJECT_REGULARIZATION,
  AI_ACTIONS.APPLY_LEAVE,
  AI_ACTIONS.APPLY_PERMISSION,
  AI_ACTIONS.APPLY_COMP_OFF,
  AI_ACTIONS.APPLY_WFH,
  AI_ACTIONS.REQUEST_REGULARIZATION,
  AI_ACTIONS.ADD_EMPLOYEE,
  AI_ACTIONS.UPDATE_EMPLOYEE,
  AI_ACTIONS.ASSIGN_ROLE,
]);

/**
 * Actions that require a secondary SMTP OTP verification.
 * These are high-risk operations that modify core organizational structure.
 */
export const SENSITIVE_ACTIONS = new Set([
  AI_ACTIONS.DELETE_EMPLOYEE,
  AI_ACTIONS.ADD_EMPLOYEE,
  AI_ACTIONS.ASSIGN_ROLE,
  AI_ACTIONS.UPDATE_AI_SETTINGS,
]);

/**
 * Check if a role is allowed to perform an action.
 * @param {string} role - User's role (EMPLOYEE | MANAGER | ADMIN)
 * @param {string} action - Action constant from AI_ACTIONS
 * @returns {boolean}
 */
export const canPerformAction = (role, action) => {
  const allowed = ROLE_PERMISSIONS[action];
  if (!allowed) return false;
  return allowed.includes(role);
};

/** Required fields for each multi-step action */
export const ACTION_REQUIRED_FIELDS = {
  [AI_ACTIONS.APPLY_LEAVE]: ['leaveType', 'startDate', 'endDate', 'reason'],
  [AI_ACTIONS.APPLY_PERMISSION]: ['date', 'startTime', 'endTime', 'reason'],
  [AI_ACTIONS.APPLY_COMP_OFF]: ['workDate', 'reason'],
  [AI_ACTIONS.ADD_EMPLOYEE]: [
    'name', 'email', 'password', 'gender', 'designation',
    'teamId', 'joiningDate',
  ],
  [AI_ACTIONS.APPROVE_LEAVE]: ['leaveId'],
  [AI_ACTIONS.REJECT_LEAVE]: ['leaveId', 'rejectionReason'],
  [AI_ACTIONS.APPROVE_PERMISSION]: ['permissionId'],
  [AI_ACTIONS.REJECT_PERMISSION]: ['permissionId'],
  [AI_ACTIONS.APPROVE_COMP_OFF]: ['compOffId'],
  [AI_ACTIONS.REJECT_COMP_OFF]: ['compOffId'],
  [AI_ACTIONS.DEACTIVATE_EMPLOYEE]: ['employeeId'],
  [AI_ACTIONS.ACTIVATE_EMPLOYEE]: ['employeeId'],
  [AI_ACTIONS.DELETE_EMPLOYEE]: ['employeeId'],
  // WFH
  [AI_ACTIONS.APPLY_WFH]: ['startDate', 'endDate', 'reason', 'workAvailability'],
  // Attendance
  [AI_ACTIONS.REQUEST_REGULARIZATION]: ['date', 'reason', 'requestedCheckIn', 'requestedCheckOut'],
  [AI_ACTIONS.APPROVE_REGULARIZATION]: ['regularizationId'],
  [AI_ACTIONS.REJECT_REGULARIZATION]: ['regularizationId', 'rejectionReason'],
};

/** Human-friendly labels for field names used in questions */
export const FIELD_PROMPTS = {
  leaveType: 'What type of leave? (Annual / Sick / Comp-Off / Maternity / Paternity / WFH)',
  startDate: 'From which date? (YYYY-MM-DD)',
  endDate: 'To which date? (YYYY-MM-DD)',
  reason: 'What is the reason?',
  workAvailability: 'What are your work availability details for WFH?',
  date: 'For which date? (YYYY-MM-DD)',
  startTime: 'What time does it start? (HH:MM, 24-hour)',
  endTime: 'What time does it end? (HH:MM, 24-hour)',
  requestedCheckIn: 'What is your requested Check-in time? (HH:MM)',
  requestedCheckOut: 'What is your requested Check-out time? (HH:MM)',
  workDate: 'Which date did you work? (YYYY-MM-DD, must be a weekend)',
  name: "Employee's full name?",
  email: "Employee's email address?",
  password: 'Initial password for the employee?',
  gender: "Employee's gender? (Male / Female)",
  designation: "Employee's job title / designation?",
  teamId: 'Which team? (I can list available teams)',
  joiningDate: 'Joining date? (YYYY-MM-DD)',
  leaveId: 'Which leave request ID?',
  permissionId: 'Which permission request ID?',
  compOffId: 'Which comp-off request ID?',
  regularizationId: 'Which regularization request ID?',
  employeeId: 'Which employee? (name or ID)',
  rejectionReason: 'Reason for rejection?',
};
