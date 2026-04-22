'use client';

import type { PayrollRow } from '@/types/payroll';

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

type Props = {
  row: PayrollRow;
  monthLabel: string;
  onClose: () => void;
  onDownload: (row: PayrollRow) => void;
};

export default function PayslipPreviewModal({ row, monthLabel, onClose, onDownload }: Props) {
  if (!row) return null;

  const hra = row.hra ?? 0;
  const bonus = row.bonus ?? 0;
  const pf = row.pf ?? 0;
  const tax = row.tax ?? 0;
  const professionalTax = row.professionalTax ?? 0;
  const lopDays = row.lopDays ?? 0;
  const lopAmount = row.lopAmount ?? 0;
  const grossEarnings = row.basicSalary + hra + (row.allowance ?? 0) + bonus;
  const totalDeductions = pf + tax + professionalTax + lopAmount;
  const computedNetSalary = Math.max(grossEarnings - totalDeductions, 0);

  const initials = (row.employeeName ?? '')
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusIsPaid = row.status === 'PAID';

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close payslip preview'
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl'>
        <div className='relative bg-linear-to-br from-primary-dark via-primary to-accent px-6 pb-8 pt-6 text-primary-foreground'>
          <div className='absolute -right-10 -top-10 h-40 w-40 rounded-full bg-card/5' />
          <div className='absolute -right-4 top-8 h-20 w-20 rounded-full bg-sidebar-hover' />

          <div className='relative flex items-start justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card-foreground/20 backdrop-blur-sm ring-2 ring-primary-foreground/30'>
                <span className='text-lg font-bold text-primary-foreground'>{initials}</span>
              </div>
              <div>
                <p className='text-sm font-semibold uppercase tracking-widest text-primary-foreground/60'>
                  Pay Slip
                </p>
                <h2 className='mt-0.5 text-xl font-bold leading-tight text-primary-foreground'>
                  {row.employeeName}
                </h2>
                <p className='mt-1 text-sm text-primary-foreground/70'>{monthLabel}</p>
              </div>
            </div>

            <div
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                statusIsPaid
                  ? 'bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/40'
                  : 'bg-amber-400/20 text-amber-100 ring-1 ring-amber-300/40'
              }`}
            >
              {statusIsPaid ? 'Paid' : 'Unpaid'}
            </div>
          </div>

          <div className='relative mt-6 rounded-2xl border border-primary-foreground/20 bg-card/15 px-5 py-4 backdrop-blur-sm'>
            <p className='text-xs font-semibold uppercase tracking-widest text-primary-foreground/60'>
              Net Salary
            </p>
            <p className='mt-1 text-3xl font-bold text-primary-foreground'>{rupee.format(computedNetSalary)}</p>
            {lopDays > 0 && (
              <p className='mt-1 text-xs text-amber-200'>
                Includes {lopDays} LOP day{lopDays !== 1 ? 's' : ''} deduction of{' '}
                {rupee.format(lopAmount)}
              </p>
            )}
          </div>
        </div>

        <div className='overflow-y-auto px-6 pb-6 pt-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl border border-border bg-muted/50 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <div className='h-1.5 w-4 rounded-full bg-emerald-500' />
                <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  Earnings
                </p>
              </div>
              <div className='space-y-2.5'>
                {[
                  { label: 'Basic salary', value: row.basicSalary },
                  { label: 'HRA', value: hra },
                  { label: 'Allowance', value: row.allowance ?? 0 },
                  { label: 'Bonus', value: bonus },
                ].map((item) => (
                  <div key={item.label} className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>{item.label}</span>
                    <span className='text-sm font-semibold text-card-foreground'>
                      {rupee.format(item.value)}
                    </span>
                  </div>
                ))}
                <div className='mt-2 border-t border-border pt-2.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-bold text-card-foreground'>Gross earnings</span>
                    <span className='text-sm font-bold text-emerald-700'>
                      {rupee.format(grossEarnings)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-border bg-muted/50 p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <div className='h-1.5 w-4 rounded-full bg-rose-500' />
                <p className='text-[11px] font-bold uppercase tracking-widest text-muted-foreground'>
                  Deductions
                </p>
              </div>
              <div className='space-y-2.5'>
                {[
                  { label: 'Provident fund', value: pf },
                  { label: 'Tax (TDS)', value: tax },
                  { label: 'Professional tax', value: professionalTax },
                  {
                    label: `LOP (${lopDays} day${lopDays !== 1 ? 's' : ''})`,
                    value: lopAmount,
                    highlight: lopDays > 0,
                  },
                ].map((item) => (
                  <div key={item.label} className='flex items-center justify-between'>
                    <span
                      className={`text-sm ${
                        item.highlight
                          ? 'font-medium text-danger-muted-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        item.highlight
                          ? 'text-danger-muted-foreground'
                          : 'text-card-foreground'
                      }`}
                    >
                      {item.value > 0 ? `- ${rupee.format(item.value)}` : rupee.format(0)}
                    </span>
                  </div>
                ))}
                <div className='mt-2 border-t border-border pt-2.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-bold text-card-foreground'>Total deductions</span>
                    <span className='text-sm font-bold text-danger-muted-foreground'>
                      - {rupee.format(totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='mt-4 flex items-center justify-between rounded-2xl bg-primary/5 px-5 py-4 ring-1 ring-primary/10'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-primary/60'>
                Take-home pay
              </p>
              <p className='mt-0.5 text-xl font-bold text-primary'>
                {rupee.format(computedNetSalary)}
              </p>
            </div>
            <div className='text-right text-xs text-muted-foreground'>
              <p>
                {grossEarnings > 0
                  ? `${Math.round((computedNetSalary / grossEarnings) * 100)}% of gross`
                  : '—'}
              </p>
              <p className='mt-0.5'>{monthLabel}</p>
            </div>
          </div>

          <div className='mt-5 flex items-center justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-card-foreground/90 transition-colors hover:bg-muted'
            >
              Close
            </button>
            <button
              type='button'
              onClick={() => onDownload(row)}
              className='flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary-dark'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='7 10 12 15 17 10' />
                <line x1='12' y1='15' x2='12' y2='3' />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
