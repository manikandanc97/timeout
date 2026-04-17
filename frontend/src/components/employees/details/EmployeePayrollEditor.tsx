'use client';

import Button from '@/components/ui/Button';

type SalaryForm = {
  basicSalary: string;
  hra: string;
  allowance: string;
  bonus: string;
  pf: string;
  tax: string;
  professionalTax: string;
  effectiveFrom: string;
};

type SalaryStructureDto = {
  effectiveFrom: string;
  isActive: boolean;
};

type Props = {
  salaryForm: SalaryForm;
  isAdmin: boolean;
  saving: boolean;
  computedNetSalary: number;
  payoutDate: Date | null;
  activeSalary: SalaryStructureDto | null;
  onFieldChange: (field: keyof SalaryForm, value: string) => void;
  onSave: () => void;
};

const PAYROLL_FIELDS: Array<[keyof SalaryForm, string]> = [
  ['basicSalary', 'Basic Salary'],
  ['hra', 'HRA'],
  ['allowance', 'Allowance'],
  ['bonus', 'Bonus'],
  ['pf', 'PF'],
  ['tax', 'Tax'],
  ['professionalTax', 'Professional Tax'],
];

export default function EmployeePayrollEditor({
  salaryForm,
  isAdmin,
  saving,
  computedNetSalary,
  payoutDate,
  activeSalary,
  onFieldChange,
  onSave,
}: Props) {
  return (
    <div className='mt-4 space-y-3'>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {PAYROLL_FIELDS.map(([key, label]) => (
          <label key={key} className='text-sm'>
            <span className='mb-1 block text-xs uppercase text-muted-foreground'>{label}</span>
            <input
              type='number'
              value={salaryForm[key]}
              disabled={!isAdmin}
              onChange={(e) => onFieldChange(key, e.target.value)}
              className='w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary'
            />
          </label>
        ))}
        <label className='text-sm'>
          <span className='mb-1 block text-xs uppercase text-muted-foreground'>Salary Month</span>
          <input
            type='month'
            value={salaryForm.effectiveFrom}
            disabled={!isAdmin}
            onChange={(e) => onFieldChange('effectiveFrom', e.target.value)}
            className='w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary'
          />
          {payoutDate ? (
            <p className='mt-1 text-xs text-muted-foreground'>
              Salary payout date: {payoutDate.toLocaleDateString('en-GB')}
            </p>
          ) : null}
        </label>
        <div className='rounded-lg border border-border bg-muted p-3'>
          <p className='text-xs uppercase text-indigo-700'>Net Salary</p>
          <p className='mt-1 text-lg font-bold text-indigo-900'>Rs. {computedNetSalary.toLocaleString('en-IN')}</p>
          {activeSalary ? (
            <p className='mt-1 text-xs text-indigo-700'>Active from {activeSalary.effectiveFrom.slice(0, 10)}</p>
          ) : null}
        </div>
      </div>
      {isAdmin ? (
        <div className='flex justify-end'>
          <Button type='button' onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Payroll'}
          </Button>
        </div>
      ) : (
        <p className='text-xs text-muted-foreground'>Only admin can edit salary structure in payroll tab.</p>
      )}
    </div>
  );
}
