import Button from '@/components/ui/Button';
import { formatPersonName } from '@/lib/personName';
import type { PayrollRow } from '@/types/payroll';
import { Download, Eye, RotateCcw } from 'lucide-react';

type Props = {
  loading: boolean;
  visibleRows: PayrollRow[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: 'ALL' | 'PAID' | 'UNPAID';
  setStatusFilter: (value: 'ALL' | 'PAID' | 'UNPAID') => void;
  sortBy: 'NAME_ASC' | 'NAME_DESC' | 'STATUS' | 'MONTH_NEWEST' | 'MONTH_OLDEST';
  setSortBy: (value: 'NAME_ASC' | 'NAME_DESC' | 'STATUS' | 'MONTH_NEWEST' | 'MONTH_OLDEST') => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  showAmounts: boolean;
  setShowAmounts: (next: boolean) => void;
  bulkMarkingPaid: boolean;
  bulkMarkPaidEligibleCount: number;
  canMarkPaid: boolean;
  onMarkAllAsPaid: () => void;
  onMarkAsPaid: (row: PayrollRow) => void;
  onOpenEditPayroll: (row: PayrollRow) => void;
  onOpenPayslip: (row: PayrollRow) => void;
  onDownloadPayslip: (row: PayrollRow) => void;
  formatTableAmount: (value: number) => JSX.Element;
  isAdmin: boolean;
};

export default function PayrollTableSection(props: Props) {
  return (
    <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
      <div className='flex flex-wrap items-center justify-end gap-2'>
        <input type='text' value={props.searchTerm} onChange={(e) => props.setSearchTerm(e.target.value)} placeholder='Search employee' className='h-10 w-52 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:border-primary' />
        <select value={props.statusFilter} onChange={(e) => props.setStatusFilter(e.target.value as 'ALL' | 'PAID' | 'UNPAID')} className='h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'>
          <option value='ALL'>All</option><option value='PAID'>Paid</option><option value='UNPAID'>Unpaid</option>
        </select>
        <select value={props.sortBy} onChange={(e) => props.setSortBy(e.target.value as Props['sortBy'])} className='h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'>
          <option value='NAME_ASC'>Name (A-Z)</option><option value='NAME_DESC'>Name (Z-A)</option><option value='STATUS'>Status</option><option value='MONTH_NEWEST'>Month (Newest)</option><option value='MONTH_OLDEST'>Month (Oldest)</option>
        </select>
        <button type='button' aria-label='Clear all filters' disabled={!props.hasActiveFilters} onClick={props.onClearFilters} className='inline-flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground'><RotateCcw size={14} />Clear</button>
        <Button type='button' variant='outline' className='h-10 rounded-xl! px-3! text-sm!' onClick={() => props.setShowAmounts(!props.showAmounts)}>{props.showAmounts ? 'Hide Amounts' : 'Show Amounts'}</Button>
        <Button type='button' variant='primary' className='h-10 rounded-xl! px-3! text-sm!' disabled={props.bulkMarkingPaid || props.loading || props.bulkMarkPaidEligibleCount === 0 || !props.canMarkPaid} onClick={props.onMarkAllAsPaid}>{props.bulkMarkingPaid ? 'Marking...' : 'Mark Paid All'}</Button>
      </div>
      <div className='flex min-h-124 w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/35'>
        <div className='w-full min-w-0 overflow-x-auto'>
          <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
            <thead className='sticky top-0 z-10'><tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'><th className='px-4 py-3.5 text-left'>Employee Name</th><th className='px-4 py-3.5 text-left'>Basic</th><th className='px-4 py-3.5 text-left'>Allowance</th><th className='px-4 py-3.5 text-left'>LOP</th><th className='px-4 py-3.5 text-left'>Deductions</th><th className='px-4 py-3.5 text-left'>Net Salary</th><th className='px-4 py-3.5 text-left'>Status</th><th className='px-4 py-3.5 text-right'>Action</th></tr></thead>
            <tbody>
              {props.loading ? (
                <tr><td colSpan={8} className='px-4 py-16 text-center text-sm text-muted-foreground'>Loading payroll...</td></tr>
              ) : props.visibleRows.length === 0 ? (
                <tr><td colSpan={8} className='px-4 py-16 text-center text-sm text-muted-foreground'>No employees match the selected filters.</td></tr>
              ) : (
                props.visibleRows.map((row) => {
                  const isDeactivated = row.employeeActive === false;
                  return (
                    <tr key={row.id} className='border-b border-border/60 transition-colors hover:bg-muted/50'>
                      <td className='px-4 py-2 text-left align-top font-medium text-card-foreground'>{formatPersonName(row.employeeName) || 'Employee'}</td>
                      <td className='px-4 py-2 text-left align-top text-muted-foreground'>{props.formatTableAmount(row.basicSalary)}</td>
                      <td className='px-4 py-2 text-left align-top text-muted-foreground'>{props.formatTableAmount(row.allowance)}</td>
                      <td className='px-4 py-2 text-left align-top text-danger-muted-foreground'><span>{row.lopDays ?? 0} day(s)</span></td>
                      <td className='px-4 py-2 text-left align-top text-muted-foreground'><span>{props.formatTableAmount(row.deductions)}</span></td>
                      <td className='px-4 py-2 text-left align-top font-semibold text-card-foreground'>{props.formatTableAmount(row.netSalary)}</td>
                      <td className='px-4 py-2 text-left align-top'>{row.status}</td>
                      <td className='px-4 py-2 text-right align-top'>
                        <div className='flex justify-end gap-1'>
                          <Button type='button' variant='outline' className='rounded-md! px-2! py-1.5! text-xs!' disabled={row.payrollAdded === false || isDeactivated} onClick={() => props.onOpenPayslip(row)}><span className='flex items-center gap-1'><Eye size={14} />View payslip</span></Button>
                          <Button type='button' variant='outline' className='rounded-md! px-2! py-1.5! text-xs!' disabled={row.payrollAdded === false || isDeactivated || !props.isAdmin} onClick={() => props.onOpenEditPayroll(row)}>Edit</Button>
                          <Button type='button' variant='outline' className='rounded-md! px-2! py-1.5! text-xs!' disabled={row.status === 'PAID' || !props.canMarkPaid || row.payrollAdded === false || isDeactivated} onClick={() => props.onMarkAsPaid(row)}>Mark paid</Button>
                          <Button type='button' variant='outline' className='rounded-md! px-2! py-1.5! text-xs!' disabled={row.payrollAdded === false || isDeactivated} onClick={() => props.onDownloadPayslip(row)}><span className='flex items-center gap-1'><Download size={14} />PDF</span></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
