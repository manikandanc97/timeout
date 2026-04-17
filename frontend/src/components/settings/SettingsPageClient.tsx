'use client';

import api from '@/services/api';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { SETTINGS_TABS } from '@/components/settings/settingsMockData';
import {
  adminResponseToSnapshot,
  FALLBACK_GENERAL_SETTINGS,
  FALLBACK_LEAVE_POLICY_SETTINGS,
  FALLBACK_PAYROLL_SETTINGS,
  FALLBACK_ROLE_PERMISSIONS,
  FALLBACK_THEME_PREFERENCES,
  formSnapshotFromState,
  type AdminSettingsFormSnapshot,
  type AdminSettingsResponse,
} from '@/components/settings/settingsAdminForm';
import type {
  SettingsTabId,
} from '@/components/settings/settingsTypes';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const GeneralSettingsPanel = dynamic(
  () => import('@/components/settings/panels/GeneralSettingsPanel'),
);
const LeavePolicySettingsPanel = dynamic(
  () => import('@/components/settings/panels/LeavePolicySettingsPanel'),
);
const PayrollSettingsPanel = dynamic(
  () => import('@/components/settings/panels/PayrollSettingsPanel'),
);
const RolesPermissionsPanel = dynamic(
  () => import('@/components/settings/panels/RolesPermissionsPanel'),
);

function getApiErrorMessage(error: unknown, fallback: string) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? fallback
  );
}

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

  const applySettingsToState = useCallback((data: AdminSettingsResponse) => {
    const snapshot = adminResponseToSnapshot(data);
    setGeneralSettings(snapshot.generalSettings);
    setLeavePolicySettings(snapshot.leavePolicySettings);
    setPayrollSettings(snapshot.payrollSettings);
    setRolePermissions(snapshot.rolePermissions);
    setThemePreferences(snapshot.themePreferences);
    return snapshot;
  }, []);

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

  const loadSettings = useCallback(async () => {
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
      toast.error(getApiErrorMessage(error, 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, [applySettingsToState, canManageSettings]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleReset = async () => {
    if (!canManageSettings || submitting) return;
    setSubmitting(true);
    try {
      const response = await api.post<AdminSettingsResponse>('/organization/admin-settings/reset');
      const snap = applySettingsToState(response.data);
      setBaseline(snap);
      toast.success('Settings reset to default values');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to reset settings'));
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
      toast.error(getApiErrorMessage(error, 'Failed to save settings'));
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

  const renderTabContent = () => {
    if (activeTab === 'general') {
      return <GeneralSettingsPanel value={generalSettings} onChange={setGeneralSettings} />;
    }
    if (activeTab === 'leavePolicy') {
      return (
        <LeavePolicySettingsPanel value={leavePolicySettings} onChange={setLeavePolicySettings} />
      );
    }
    if (activeTab === 'payroll') {
      return <PayrollSettingsPanel value={payrollSettings} onChange={setPayrollSettings} />;
    }
    if (activeTab === 'roles') {
      return <RolesPermissionsPanel value={rolePermissions} onChange={setRolePermissions} />;
    }
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
