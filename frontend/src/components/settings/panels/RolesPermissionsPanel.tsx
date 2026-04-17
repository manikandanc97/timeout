'use client';

import SettingsToggle from '@/components/settings/SettingsToggle';
import type { RolePermission } from '@/components/settings/settingsTypes';

type Props = {
  value: RolePermission[];
  onChange: (next: RolePermission[]) => void;
};

export default function RolesPermissionsPanel({ value, onChange }: Props) {
  const updateRole = (roleId: string, field: keyof RolePermission, checked: boolean) => {
    onChange(
      value.map((entry) => (entry.id === roleId ? { ...entry, [field]: checked } : entry)),
    );
  };

  return (
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
          {value.map((role) => (
            <tr key={role.id} className='border-b border-border bg-card/95 hover:bg-muted/70'>
              <td className='px-4 py-3 font-medium text-card-foreground'>{role.roleName}</td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canApproveLeave}
                  onChange={(next) => updateRole(role.id, 'canApproveLeave', next)}
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canManagePayroll}
                  onChange={(next) => updateRole(role.id, 'canManagePayroll', next)}
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canExportReports}
                  onChange={(next) => updateRole(role.id, 'canExportReports', next)}
                />
              </td>
              <td className='px-4 py-3'>
                <SettingsToggle
                  checked={role.canManageEmployees}
                  onChange={(next) => updateRole(role.id, 'canManageEmployees', next)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
