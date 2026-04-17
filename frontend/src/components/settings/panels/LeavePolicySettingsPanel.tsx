'use client';

import SettingsToggle from '@/components/settings/SettingsToggle';
import type { LeavePolicySettings } from '@/components/settings/settingsTypes';
import Input from '@/components/ui/Input';

type Props = {
  value: LeavePolicySettings;
  onChange: (next: LeavePolicySettings) => void;
};

export default function LeavePolicySettingsPanel({ value, onChange }: Props) {
  const updateField = <K extends keyof LeavePolicySettings>(
    field: K,
    fieldValue: LeavePolicySettings[K],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <Input
        id='casualLeaveCount'
        type='number'
        label='Casual Leave Count'
        value={value.casualLeaveCount}
        onChange={(e) => updateField('casualLeaveCount', e.target.value)}
      />
      <Input
        id='sickLeaveCount'
        type='number'
        label='Sick Leave Count'
        value={value.sickLeaveCount}
        onChange={(e) => updateField('sickLeaveCount', e.target.value)}
      />

      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Comp Off Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Allow comp-off usage for eligible employees.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={value.compOffEnabled}
            onChange={(next) => updateField('compOffEnabled', next)}
          />
        </div>
      </div>

      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Carry Forward Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Carry unused leaves to next leave cycle.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={value.carryForwardEnabled}
            onChange={(next) => updateField('carryForwardEnabled', next)}
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
            checked={value.lopAfterLeaveLimit}
            onChange={(next) => updateField('lopAfterLeaveLimit', next)}
          />
        </div>
      </div>
    </div>
  );
}
