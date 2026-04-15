'use client';

import api from '@/services/api';
import SettingsTabs from '@/components/settings/SettingsTabs';
import SettingsToggle from '@/components/settings/SettingsToggle';
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  SETTINGS_TABS,
  TIMEZONE_OPTIONS,
} from '@/components/settings/settingsMockData';
import type {
  GeneralSettings,
  LeavePolicySettings,
  PayrollSettings,
  RolePermission,
  SettingsTabId,
  ThemePreferencesSettings,
} from '@/components/settings/settingsTypes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { Settings2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type AdminSettingsFormSnapshot = {
  generalSettings: GeneralSettings;
  leavePolicySettings: LeavePolicySettings;
  payrollSettings: PayrollSettings;
  rolePermissions: RolePermission[];
  themePreferences: ThemePreferencesSettings;
};

function adminResponseToSnapshot(data: AdminSettingsResponse): AdminSettingsFormSnapshot {
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

function formSnapshotFromState(
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

const FALLBACK_GENERAL_SETTINGS: GeneralSettings = {
  companyName: '',
  companyEmail: '',
  phoneNumber: '',
  officeAddress: '',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
};

const FALLBACK_LEAVE_POLICY_SETTINGS: LeavePolicySettings = {
  casualLeaveCount: '12',
  sickLeaveCount: '8',
  compOffEnabled: true,
  carryForwardEnabled: true,
  lopAfterLeaveLimit: true,
};

const FALLBACK_PAYROLL_SETTINGS: PayrollSettings = {
  salaryReleaseDay: '30',
  workingDaysPerMonth: '22',
  pfPercentage: '12',
  taxPercentage: '10',
  professionalTax: '200',
  autoLopDeductionEnabled: true,
};

const FALLBACK_ROLE_PERMISSIONS: RolePermission[] = [
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

const FALLBACK_THEME_PREFERENCES: ThemePreferencesSettings = {
  darkMode: false,
  accentColor: 'blue',
  notificationEmail: true,
  browserNotification: false,
};

type AdminSettingsResponse = {
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

export default function SettingsPageClient() {
  const { user } = useAuth();
  const canManageSettings = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [generalSettings, setGeneralSettings] = useState(FALLBACK_GENERAL_SETTINGS);
  const [leavePolicySettings, setLeavePolicySettings] = useState(FALLBACK_LEAVE_POLICY_SETTINGS);
  const [payrollSettings, setPayrollSettings] = useState(FALLBACK_PAYROLL_SETTINGS);
  const [rolePermissions, setRolePermissions] = useState(FALLBACK_ROLE_PERMISSIONS);
  const [themePreferences, setThemePreferences] = useState(FALLBACK_THEME_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [baseline, setBaseline] = useState<AdminSettingsFormSnapshot | null>(null);

  const applySettingsToState = (data: AdminSettingsResponse) => {
    const snap = adminResponseToSnapshot(data);
    setGeneralSettings(snap.generalSettings);
    setLeavePolicySettings(snap.leavePolicySettings);
    setPayrollSettings(snap.payrollSettings);
    setRolePermissions(snap.rolePermissions);
    setThemePreferences(snap.themePreferences);
    return snap;
  };

  const isDirty = useMemo(() => {
    if (baseline === null) return false;
    const current = formSnapshotFromState(
      generalSettings,
      leavePolicySettings,
      payrollSettings,
      rolePermissions,
      themePreferences,
    );
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    baseline,
    generalSettings,
    leavePolicySettings,
    payrollSettings,
    rolePermissions,
    themePreferences,
  ]);

  const loadSettings = async () => {
    if (!canManageSettings) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get<AdminSettingsResponse>('/organization/admin-settings');
      const snap = applySettingsToState(response.data);
      setBaseline(snap);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load settings';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, [canManageSettings]);

  const handleReset = async () => {
    if (!canManageSettings || submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post<AdminSettingsResponse>('/organization/admin-settings/reset');
      const snap = applySettingsToState(response.data);
      setBaseline(snap);
      toast.success('Settings reset to default values');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to reset settings';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!canManageSettings || submitting || !isDirty) return;
    setSubmitting(true);
    try {
      await api.put('/organization/admin-settings', {
        generalSettings,
        leavePolicySettings: {
          casualLeaveCount: Number(leavePolicySettings.casualLeaveCount || 0),
          sickLeaveCount: Number(leavePolicySettings.sickLeaveCount || 0),
          compOffEnabled: leavePolicySettings.compOffEnabled,
          carryForwardEnabled: leavePolicySettings.carryForwardEnabled,
          lopAfterLeaveLimit: leavePolicySettings.lopAfterLeaveLimit,
        },
        payrollSettings: {
          salaryReleaseDay: Number(payrollSettings.salaryReleaseDay || 0),
          workingDaysPerMonth: Number(payrollSettings.workingDaysPerMonth || 0),
          pfPercentage: Number(payrollSettings.pfPercentage || 0),
          taxPercentage: Number(payrollSettings.taxPercentage || 0),
          professionalTax: Number(payrollSettings.professionalTax || 0),
          autoLopDeductionEnabled: payrollSettings.autoLopDeductionEnabled,
        },
        rolePermissions,
        themePreferences,
      });
      setBaseline(
        formSnapshotFromState(
          generalSettings,
          leavePolicySettings,
          payrollSettings,
          rolePermissions,
          themePreferences,
        ),
      );
      toast.success('Settings saved successfully');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save settings';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManageSettings) {
    return (
      <section className='rounded-3xl border border-warning-muted-foreground/25 bg-warning-muted p-6 text-warning-muted-foreground shadow-sm'>
        <h2 className='text-lg font-semibold'>Settings access restricted</h2>
        <p className='mt-1 text-sm text-warning-muted-foreground/90'>
          You do not have permission to view or update admin settings.
        </p>
      </section>
    );
  }

  const renderGeneralSettings = () => (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
      <Input
        id='companyName'
        type='text'
        label='Company Name'
        value={generalSettings.companyName}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            companyName: e.target.value,
          }))
        }
      />
      <Input
        id='companyEmail'
        type='email'
        label='Company Email'
        value={generalSettings.companyEmail}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            companyEmail: e.target.value,
          }))
        }
      />
      <Input
        id='phoneNumber'
        type='tel'
        label='Phone Number'
        value={generalSettings.phoneNumber}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            phoneNumber: e.target.value,
          }))
        }
      />
      <Input
        id='officeAddress'
        type='text'
        label='Office Address'
        value={generalSettings.officeAddress}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            officeAddress: e.target.value,
          }))
        }
      />
      <Select
        id='timezone'
        label='Timezone'
        value={generalSettings.timezone}
        options={TIMEZONE_OPTIONS}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            timezone: e.target.value,
          }))
        }
      />
      <Select
        id='currency'
        label='Currency'
        value={generalSettings.currency}
        options={CURRENCY_OPTIONS}
        onChange={(e) =>
          setGeneralSettings((prev) => ({
            ...prev,
            currency: e.target.value,
          }))
        }
      />
      <div className='sm:col-span-2'>
        <Select
          id='dateFormat'
          label='Date Format'
          value={generalSettings.dateFormat}
          options={DATE_FORMAT_OPTIONS}
          onChange={(e) =>
            setGeneralSettings((prev) => ({
              ...prev,
              dateFormat: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );

  const renderLeavePolicySettings = () => (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <Input
        id='casualLeaveCount'
        type='number'
        label='Casual Leave Count'
        value={leavePolicySettings.casualLeaveCount}
        onChange={(e) =>
          setLeavePolicySettings((prev) => ({
            ...prev,
            casualLeaveCount: e.target.value,
          }))
        }
      />
      <Input
        id='sickLeaveCount'
        type='number'
        label='Sick Leave Count'
        value={leavePolicySettings.sickLeaveCount}
        onChange={(e) =>
          setLeavePolicySettings((prev) => ({
            ...prev,
            sickLeaveCount: e.target.value,
          }))
        }
      />

      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Comp Off Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Allow comp-off usage for eligible employees.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={leavePolicySettings.compOffEnabled}
            onChange={(next) =>
              setLeavePolicySettings((prev) => ({
                ...prev,
                compOffEnabled: next,
              }))
            }
          />
        </div>
      </div>

      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Carry Forward Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Carry unused leaves to next leave cycle.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={leavePolicySettings.carryForwardEnabled}
            onChange={(next) =>
              setLeavePolicySettings((prev) => ({
                ...prev,
                carryForwardEnabled: next,
              }))
            }
          />
        </div>
      </div>

      <div className='rounded-xl border border-border bg-muted/70 p-3 sm:col-span-2'>
        <p className='text-sm font-medium text-card-foreground'>LOP After Leave Limit</p>
        <p className='mt-1 text-xs text-muted-foreground'>
          Apply loss of pay automatically once leave balance is exceeded.
        </p>
        <div className='mt-3'>
          <SettingsToggle
            checked={leavePolicySettings.lopAfterLeaveLimit}
            onChange={(next) =>
              setLeavePolicySettings((prev) => ({
                ...prev,
                lopAfterLeaveLimit: next,
              }))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderPayrollSettings = () => (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <Input
        id='salaryReleaseDay'
        type='number'
        label='Salary Release Day'
        value={payrollSettings.salaryReleaseDay}
        onChange={(e) =>
          setPayrollSettings((prev) => ({
            ...prev,
            salaryReleaseDay: e.target.value,
          }))
        }
      />
      <Input
        id='workingDaysPerMonth'
        type='number'
        label='Working Days Per Month'
        value={payrollSettings.workingDaysPerMonth}
        onChange={(e) =>
          setPayrollSettings((prev) => ({
            ...prev,
            workingDaysPerMonth: e.target.value,
          }))
        }
      />
      <Input
        id='pfPercentage'
        type='number'
        label='PF Percentage'
        value={payrollSettings.pfPercentage}
        onChange={(e) =>
          setPayrollSettings((prev) => ({
            ...prev,
            pfPercentage: e.target.value,
          }))
        }
      />
      <Input
        id='taxPercentage'
        type='number'
        label='Tax Percentage'
        value={payrollSettings.taxPercentage}
        onChange={(e) =>
          setPayrollSettings((prev) => ({
            ...prev,
            taxPercentage: e.target.value,
          }))
        }
      />
      <Input
        id='professionalTax'
        type='number'
        label='Professional Tax'
        value={payrollSettings.professionalTax}
        onChange={(e) =>
          setPayrollSettings((prev) => ({
            ...prev,
            professionalTax: e.target.value,
          }))
        }
      />
      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Auto LOP Deduction Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Auto-calculate LOP deduction during payroll run.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={payrollSettings.autoLopDeductionEnabled}
            onChange={(next) =>
              setPayrollSettings((prev) => ({
                ...prev,
                autoLopDeductionEnabled: next,
              }))
            }
          />
        </div>
      </div>
    </div>
  );

  const renderRolesAndPermissions = () => (
    <div className='overflow-x-auto rounded-xl border border-border bg-muted/40'>
      <table className='w-full min-w-[760px] border-collapse text-left text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            <th className='px-4 py-3'>Role Name</th>
            <th className='px-4 py-3'>Can Approve Leave</th>
            <th className='px-4 py-3'>Can Manage Payroll</th>
            <th className='px-4 py-3'>Can Export Reports</th>
            <th className='px-4 py-3'>Can Manage Employees</th>
          </tr>
        </thead>
        <tbody>
          {rolePermissions.map((role) => (
            <tr key={role.id} className='border-b border-border bg-card/95 hover:bg-muted/70'>
              <td className='px-4 py-3 font-medium text-card-foreground'>{role.roleName}</td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canApproveLeave}
                  onChange={(next) =>
                    setRolePermissions((prev) =>
                      prev.map((entry) =>
                        entry.id === role.id ? { ...entry, canApproveLeave: next } : entry,
                      ),
                    )
                  }
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canManagePayroll}
                  onChange={(next) =>
                    setRolePermissions((prev) =>
                      prev.map((entry) =>
                        entry.id === role.id ? { ...entry, canManagePayroll: next } : entry,
                      ),
                    )
                  }
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canExportReports}
                  onChange={(next) =>
                    setRolePermissions((prev) =>
                      prev.map((entry) =>
                        entry.id === role.id ? { ...entry, canExportReports: next } : entry,
                      ),
                    )
                  }
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canManageEmployees}
                  onChange={(next) =>
                    setRolePermissions((prev) =>
                      prev.map((entry) =>
                        entry.id === role.id ? { ...entry, canManageEmployees: next } : entry,
                      ),
                    )
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'general') return renderGeneralSettings();
    if (activeTab === 'leavePolicy') return renderLeavePolicySettings();
    if (activeTab === 'payroll') return renderPayrollSettings();
    if (activeTab === 'roles') return renderRolesAndPermissions();
    return null;
  };

  return (
    <section className='hrm-shell-page'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

      <div className='relative z-10 flex flex-col gap-4 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <Settings2 size={20} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Administration
              </p>
              <h1 className='text-2xl font-bold leading-tight text-card-foreground'>Settings</h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Manage company, leave, payroll, and roles in one place.
              </p>
            </div>
          </div>
        </div>

        <SettingsTabs tabs={SETTINGS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <section className='hrm-shell-inner min-h-[420px]'>
          <div className='flex-1'>
            {loading ? (
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className='h-20 animate-pulse rounded-xl border border-border bg-muted/80'
                  />
                ))}
              </div>
            ) : (
              renderTabContent()
            )}
          </div>

          <div className='sticky bottom-0 mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card/95 pt-4'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl!'
              onClick={() => void handleReset()}
              disabled={loading || submitting}
            >
              {submitting ? 'Please wait...' : 'Reset to Default'}
            </Button>
            <Button
              type='button'
              variant='primary'
              className='rounded-xl!'
              onClick={() => void handleSave()}
              disabled={loading || submitting || !isDirty}
            >
              {submitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </section>
      </div>
    </section>
  );
}
