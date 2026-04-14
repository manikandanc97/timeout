export type SettingsTabId =
  | 'general'
  | 'leavePolicy'
  | 'payroll'
  | 'roles';

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
};

export type RolePermission = {
  id: string;
  roleName: string;
  canApproveLeave: boolean;
  canManagePayroll: boolean;
  canExportReports: boolean;
  canManageEmployees: boolean;
};

export type GeneralSettings = {
  companyName: string;
  companyEmail: string;
  phoneNumber: string;
  officeAddress: string;
  timezone: string;
  currency: string;
  dateFormat: string;
};

export type LeavePolicySettings = {
  casualLeaveCount: string;
  sickLeaveCount: string;
  compOffEnabled: boolean;
  carryForwardEnabled: boolean;
  lopAfterLeaveLimit: boolean;
};

export type PayrollSettings = {
  salaryReleaseDay: string;
  workingDaysPerMonth: string;
  pfPercentage: string;
  taxPercentage: string;
  professionalTax: string;
  autoLopDeductionEnabled: boolean;
};

export type ThemePreferencesSettings = {
  darkMode: boolean;
  accentColor: string;
  notificationEmail: boolean;
  browserNotification: boolean;
};
