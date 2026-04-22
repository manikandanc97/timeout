import Button from '@/components/ui/Button';

type EditForm = {
  yearlyGrossSalary: string;
  basicSalary: string;
  hra: string;
  allowance: string;
  bonus: string;
  pf: string;
  tax: string;
  professionalTax: string;
  lopDays: string;
  lopAmount: string;
};

type Props = {
  open: boolean;
  title?: string;
  editLoading: boolean;
  editSaving: boolean;
  form: EditForm;
  onChange: (key: keyof EditForm, value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

const FIELDS: Array<keyof EditForm> = [
  'yearlyGrossSalary',
  'basicSalary',
  'hra',
  'allowance',
  'bonus',
  'pf',
  'tax',
  'professionalTax',
  'lopDays',
  'lopAmount',
];

const FIELD_LABELS: Record<keyof EditForm, string> = {
  yearlyGrossSalary: 'Yearly Gross Salary',
  basicSalary: 'Basic Salary',
  hra: 'HRA',
  allowance: 'Allowance',
  bonus: 'Bonus',
  pf: 'PF',
  tax: 'Tax',
  professionalTax: 'Professional Tax',
  lopDays: 'LOP Days',
  lopAmount: 'LOP Amount',
};

export default function PayrollEditModal({
  open,
  title = 'Edit payroll details',
  editLoading,
  editSaving,
  form,
  onChange,
  onClose,
  onSave,
}: Props) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close payroll editor'
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div className='relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xl'>
        <h3 className='text-lg font-bold'>{title}</h3>
        <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          {FIELDS.map((field) => (
            <label key={field} className='text-sm'>
              <span className='mb-1 block text-xs uppercase text-muted-foreground'>
                {FIELD_LABELS[field]}
              </span>
              <input
                type='number'
                value={form[field]}
                onChange={(e) => onChange(field, e.target.value)}
                disabled={editLoading}
                className='w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'
              />
            </label>
          ))}
        </div>
        <div className='mt-5 flex justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={editSaving || editLoading}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={onSave}
            disabled={editSaving || editLoading}
          >
            {editLoading ? 'Loading...' : editSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
