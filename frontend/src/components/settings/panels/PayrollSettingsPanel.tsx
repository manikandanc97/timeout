'use client';

import SettingsToggle from '@/components/settings/SettingsToggle';
import type { PayrollSettings } from '@/components/settings/settingsTypes';
import Input from '@/components/ui/Input';

type Props = {
  value: PayrollSettings;
  onChange: (next: PayrollSettings) => void;
};

export default function PayrollSettingsPanel({ value, onChange }: Props) {
  const updateField = <K extends keyof PayrollSettings>(field: K, fieldValue: PayrollSettings[K]) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      <Input
        id='salaryReleaseDay'
        type='number'
        label='Salary Release Day'
        value={value.salaryReleaseDay}
        onChange={(e) => updateField('salaryReleaseDay', e.target.value)}
      />
      <Input
        id='workingDaysPerMonth'
        type='number'
        label='Working Days Per Month'
        value={value.workingDaysPerMonth}
        onChange={(e) => updateField('workingDaysPerMonth', e.target.value)}
      />
      <Input
        id='pfPercentage'
        type='number'
        label='PF Percentage'
        value={value.pfPercentage}
        onChange={(e) => updateField('pfPercentage', e.target.value)}
      />
      <Input
        id='taxPercentage'
        type='number'
        label='Tax Percentage'
        value={value.taxPercentage}
        onChange={(e) => updateField('taxPercentage', e.target.value)}
      />
      <Input
        id='professionalTax'
        type='number'
        label='Professional Tax'
        value={value.professionalTax}
        onChange={(e) => updateField('professionalTax', e.target.value)}
      />
      <div className='rounded-xl border border-border bg-muted/70 p-3'>
        <p className='text-sm font-medium text-card-foreground'>Auto LOP Deduction Enabled</p>
        <p className='mt-1 text-xs text-muted-foreground'>Auto-calculate LOP deduction during payroll run.</p>
        <div className='mt-3'>
          <SettingsToggle
            checked={value.autoLopDeductionEnabled}
            onChange={(next) => updateField('autoLopDeductionEnabled', next)}
          />
        </div>
      </div>
    </div>
  );
}
