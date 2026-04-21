import api from './api';

export interface AdminSettings {
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
  rolePermissions: Array<{
    id: string;
    roleName: string;
    canApproveLeave: boolean;
    canManagePayroll: boolean;
    canExportReports: boolean;
    canManageEmployees: boolean;
  }>;
  themePreferences: {
    darkMode: boolean;
    accentColor: string;
    notificationEmail: boolean;
    browserNotification: boolean;
  };
  smtpSettings: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    fromEmail: string;
  };
  alertPreferences: {
    leaveRequests: boolean;
    payrollPaid: boolean;
    employeeUpdates: boolean;
  };
}

/**
 * Get all organization / admin settings.
 */
export const getAdminSettings = async (): Promise<AdminSettings> => {
  const response = await api.get('/organization/admin-settings');
  return response.data;
};

/**
 * Update organization / admin settings.
 */
export const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
  const response = await api.put('/organization/admin-settings', settings);
  return response.data;
};

/**
 * Reset all admin settings to defaults.
 */
export const resetAdminSettings = async () => {
  const response = await api.post('/organization/admin-settings/reset');
  return response.data;
};
