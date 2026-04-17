import type {
  GeneralSettings,
  LeavePolicySettings,
  PayrollSettings,
  RolePermission,
  ThemePreferencesSettings,
} from '@/components/settings/settingsTypes';

export type AdminSettingsFormSnapshot = {
  generalSettings: GeneralSettings;
  leavePolicySettings: LeavePolicySettings;
  payrollSettings: PayrollSettings;
  rolePermissions: RolePermission[];
  themePreferences: ThemePreferencesSettings;
};

export type AdminSettingsResponse = {
  generalSettings: {
    companyName: string;
    companyEmail: string;
    phoneNumber: string;
    officeAddress: string;
    timezone: string;
    currency: string;
    dateFormat: string;
  };
  leavePolicySettings: {
    casualLeaveCount: number;
    sickLeaveCount: number;
    compOffEnabled: boolean;
    carryForwardEnabled: boolean;
    lopAfterLeaveLimit: boolean;
  };
  payrollSettings: {
    salaryReleaseDay: number;
    workingDaysPerMonth: number;
    pfPercentage: number;
    taxPercentage: number;
    professionalTax: number;
    autoLopDeductionEnabled: boolean;
  };
  rolePermissions: RolePermission[];
  themePreferences: ThemePreferencesSettings;
};

export const FALLBACK_GENERAL_SETTINGS: GeneralSettings = {
  companyName: '',
  companyEmail: '',
  phoneNumber: '',
  officeAddress: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
};

export const FALLBACK_LEAVE_POLICY_SETTINGS: LeavePolicySettings = {
  casualLeaveCount: '12',
  sickLeaveCount: '8',
  compOffEnabled: true,
  carryForwardEnabled: true,
  lopAfterLeaveLimit: true,
};

export const FALLBACK_PAYROLL_SETTINGS: PayrollSettings = {
  salaryReleaseDay: '30',
  workingDaysPerMonth: '22',
  pfPercentage: '12',
  taxPercentage: '10',
  professionalTax: '200',
  autoLopDeductionEnabled: true,
};

export const FALLBACK_ROLE_PERMISSIONS: RolePermission[] = [
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
];

export const FALLBACK_THEME_PREFERENCES: ThemePreferencesSettings = {
  darkMode: false,
  accentColor: 'blue',
  notificationEmail: true,
  browserNotification: false,
};

export function adminResponseToSnapshot(data: AdminSettingsResponse): AdminSettingsFormSnapshot {
  return {
    generalSettings: {
      companyName: data.generalSettings.companyName ?? '',
      companyEmail: data.generalSettings.companyEmail ?? '',
      phoneNumber: data.generalSettings.phoneNumber ?? '',
      officeAddress: data.generalSettings.officeAddress ?? '',
      timezone: data.generalSettings.timezone ?? 'Asia/Kolkata',
      currency: data.generalSettings.currency ?? 'INR',
      dateFormat: data.generalSettings.dateFormat ?? 'DD/MM/YYYY',
    },
    leavePolicySettings: {
      casualLeaveCount: String(data.leavePolicySettings.casualLeaveCount ?? 0),
      sickLeaveCount: String(data.leavePolicySettings.sickLeaveCount ?? 0),
      compOffEnabled: Boolean(data.leavePolicySettings.compOffEnabled),
      carryForwardEnabled: Boolean(data.leavePolicySettings.carryForwardEnabled),
      lopAfterLeaveLimit: Boolean(data.leavePolicySettings.lopAfterLeaveLimit),
    },
    payrollSettings: {
      salaryReleaseDay: String(data.payrollSettings.salaryReleaseDay ?? 0),
      workingDaysPerMonth: String(data.payrollSettings.workingDaysPerMonth ?? 0),
      pfPercentage: String(data.payrollSettings.pfPercentage ?? 0),
      taxPercentage: String(data.payrollSettings.taxPercentage ?? 0),
      professionalTax: String(data.payrollSettings.professionalTax ?? 0),
      autoLopDeductionEnabled: Boolean(data.payrollSettings.autoLopDeductionEnabled),
    },
    rolePermissions: Array.isArray(data.rolePermissions)
      ? data.rolePermissions.map((r) => ({ ...r }))
      : [],
    themePreferences: {
      darkMode: Boolean(data.themePreferences.darkMode),
      accentColor: data.themePreferences.accentColor ?? 'blue',
      notificationEmail: Boolean(data.themePreferences.notificationEmail),
      browserNotification: Boolean(data.themePreferences.browserNotification),
    },
  };
}

export function formSnapshotFromState(
  generalSettings: GeneralSettings,
  leavePolicySettings: LeavePolicySettings,
  payrollSettings: PayrollSettings,
  rolePermissions: RolePermission[],
  themePreferences: ThemePreferencesSettings,
): AdminSettingsFormSnapshot {
  return {
    generalSettings: { ...generalSettings },
    leavePolicySettings: { ...leavePolicySettings },
    payrollSettings: { ...payrollSettings },
    rolePermissions: rolePermissions.map((r) => ({ ...r })),
    themePreferences: { ...themePreferences },
  };
}
