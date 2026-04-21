export const DEFAULT_ADMIN_SETTINGS = {
  leavePolicySettings: {
    casualLeaveCount: 12,
    sickLeaveCount: 8,
    compOffEnabled: true,
    carryForwardEnabled: true,
    lopAfterLeaveLimit: true,
  },
  payrollSettings: {
    salaryReleaseDay: 30,
    workingDaysPerMonth: 22,
    pfPercentage: 12,
    taxPercentage: 10,
    professionalTax: 200,
    autoLopDeductionEnabled: true,
  },
  rolePermissions: [
    {
      id: 'admin',
      roleName: 'Admin',
      canApproveLeave: true,
      canManagePayroll: true,
      canExportReports: true,
      canManageEmployees: true,
    },
    {
      id: 'hr',
      roleName: 'HR',
      canApproveLeave: true,
      canManagePayroll: true,
      canExportReports: true,
      canManageEmployees: true,
    },
    {
      id: 'manager',
      roleName: 'Manager',
      canApproveLeave: true,
      canManagePayroll: false,
      canExportReports: true,
      canManageEmployees: false,
    },
    {
      id: 'employee',
      roleName: 'Employee',
      canApproveLeave: false,
      canManagePayroll: false,
      canExportReports: false,
      canManageEmployees: false,
    },
  ],
  themePreferences: {
    darkMode: false,
    accentColor: 'blue',
    notificationEmail: true,
    browserNotification: false,
  },
  smtpSettings: {
    host: '',
    port: 587,
    user: '',
    pass: '',
    secure: false,
    fromEmail: '',
  },
  alertPreferences: {
    leaveRequests: true,
    payrollPaid: true,
    employeeUpdates: true,
  },
};

export const DEFAULT_ORG_SETTINGS = {
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
};

const toTrimmedString = (value, fallback = '') => {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const toPositiveInt = (value, fallback) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.round(num));
};

const toPercent = (value, fallback) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Number(num)));
};

const toBoolean = (value, fallback) => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

export function sanitizeAdminSettings(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  const leave = source.leavePolicySettings ?? {};
  const payroll = source.payrollSettings ?? {};
  const theme = source.themePreferences ?? {};
  const roleRows = Array.isArray(source.rolePermissions) ? source.rolePermissions : [];

  const rolePermissions =
    roleRows.length > 0
      ? roleRows.map((row) => ({
          id: toTrimmedString(row.id, 'role'),
          roleName: toTrimmedString(row.roleName, 'Role'),
          canApproveLeave: toBoolean(
            row.canApproveLeave,
            DEFAULT_ADMIN_SETTINGS.rolePermissions[0].canApproveLeave,
          ),
          canManagePayroll: toBoolean(
            row.canManagePayroll,
            DEFAULT_ADMIN_SETTINGS.rolePermissions[0].canManagePayroll,
          ),
          canExportReports: toBoolean(
            row.canExportReports,
            DEFAULT_ADMIN_SETTINGS.rolePermissions[0].canExportReports,
          ),
          canManageEmployees: toBoolean(
            row.canManageEmployees,
            DEFAULT_ADMIN_SETTINGS.rolePermissions[0].canManageEmployees,
          ),
        }))
      : DEFAULT_ADMIN_SETTINGS.rolePermissions;

  return {
    leavePolicySettings: {
      casualLeaveCount: toPositiveInt(
        leave.casualLeaveCount,
        DEFAULT_ADMIN_SETTINGS.leavePolicySettings.casualLeaveCount,
      ),
      sickLeaveCount: toPositiveInt(
        leave.sickLeaveCount,
        DEFAULT_ADMIN_SETTINGS.leavePolicySettings.sickLeaveCount,
      ),
      compOffEnabled: toBoolean(
        leave.compOffEnabled,
        DEFAULT_ADMIN_SETTINGS.leavePolicySettings.compOffEnabled,
      ),
      carryForwardEnabled: toBoolean(
        leave.carryForwardEnabled,
        DEFAULT_ADMIN_SETTINGS.leavePolicySettings.carryForwardEnabled,
      ),
      lopAfterLeaveLimit: toBoolean(
        leave.lopAfterLeaveLimit,
        DEFAULT_ADMIN_SETTINGS.leavePolicySettings.lopAfterLeaveLimit,
      ),
    },
    payrollSettings: {
      salaryReleaseDay: toPositiveInt(
        payroll.salaryReleaseDay,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.salaryReleaseDay,
      ),
      workingDaysPerMonth: toPositiveInt(
        payroll.workingDaysPerMonth,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.workingDaysPerMonth,
      ),
      pfPercentage: toPercent(
        payroll.pfPercentage,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.pfPercentage,
      ),
      taxPercentage: toPercent(
        payroll.taxPercentage,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.taxPercentage,
      ),
      professionalTax: toPositiveInt(
        payroll.professionalTax,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.professionalTax,
      ),
      autoLopDeductionEnabled: toBoolean(
        payroll.autoLopDeductionEnabled,
        DEFAULT_ADMIN_SETTINGS.payrollSettings.autoLopDeductionEnabled,
      ),
    },
    rolePermissions,
    themePreferences: {
      darkMode: toBoolean(theme.darkMode, DEFAULT_ADMIN_SETTINGS.themePreferences.darkMode),
      accentColor: toTrimmedString(
        theme.accentColor,
        DEFAULT_ADMIN_SETTINGS.themePreferences.accentColor,
      ),
      notificationEmail: toBoolean(
        theme.notificationEmail,
        DEFAULT_ADMIN_SETTINGS.themePreferences.notificationEmail,
      ),
      browserNotification: toBoolean(
        theme.browserNotification,
        DEFAULT_ADMIN_SETTINGS.themePreferences.browserNotification,
      ),
    },
    smtpSettings: {
      host: toTrimmedString(source.smtpSettings?.host, DEFAULT_ADMIN_SETTINGS.smtpSettings.host),
      port: toPositiveInt(source.smtpSettings?.port, DEFAULT_ADMIN_SETTINGS.smtpSettings.port),
      user: toTrimmedString(source.smtpSettings?.user, DEFAULT_ADMIN_SETTINGS.smtpSettings.user),
      pass: toTrimmedString(source.smtpSettings?.pass, DEFAULT_ADMIN_SETTINGS.smtpSettings.pass),
      secure: toBoolean(source.smtpSettings?.secure, DEFAULT_ADMIN_SETTINGS.smtpSettings.secure),
      fromEmail: toTrimmedString(source.smtpSettings?.fromEmail, DEFAULT_ADMIN_SETTINGS.smtpSettings.fromEmail),
    },
    alertPreferences: {
      leaveRequests: toBoolean(source.alertPreferences?.leaveRequests, DEFAULT_ADMIN_SETTINGS.alertPreferences.leaveRequests),
      payrollPaid: toBoolean(source.alertPreferences?.payrollPaid, DEFAULT_ADMIN_SETTINGS.alertPreferences.payrollPaid),
      employeeUpdates: toBoolean(source.alertPreferences?.employeeUpdates, DEFAULT_ADMIN_SETTINGS.alertPreferences.employeeUpdates),
    },
  };
}

