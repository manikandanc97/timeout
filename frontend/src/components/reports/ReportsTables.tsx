import { formatPersonName } from '@/lib/personName';
import type { OrganizationEmployee } from '@/types/employee';
import type { LeaveWithEmployee } from '@/types/leave';
import type { PayrollRow } from '@/types/payroll';
import { formatCurrencyINR, formatDateShort } from '@/utils/formatters';
import ReportTableSection from './ReportTableSection';
import { monthLabel } from './useReportsData';
import Skeleton from '@/components/ui/Skeleton';

type Props = {
  loading: boolean;
  leaves: LeaveWithEmployee[];
  employeeById: Map<number, OrganizationEmployee>;
  employeeByName: Map<string, OrganizationEmployee>;
  filteredPayroll: PayrollRow[];
  filteredLeaves: LeaveWithEmployee[];
  filteredEmployees: OrganizationEmployee[];
};

export default function ReportsTables({
  loading,
  leaves,
  employeeById,
  employeeByName,
  filteredPayroll,
  filteredLeaves,
  filteredEmployees,
}: Props) {
  if (loading) {
    return (
      <>
        <ReportTableSkeleton
          title='Payroll Report Table'
          subtitle='Monthly payroll status and salary breakdown for selected filters.'
          columnWidths={['w-28', 'w-24', 'w-22', 'w-24', 'w-18', 'w-20', 'w-22', 'w-16', 'w-20']}
          rows={5}
        />
        <ReportTableSkeleton
          title='Leave Report Table'
          subtitle='Leave requests with approval status and LOP details.'
          columnWidths={['w-28', 'w-24', 'w-20', 'w-20', 'w-18', 'w-16', 'w-18']}
          rows={5}
        />
        <ReportTableSkeleton
          title='Employee Summary Table'
          subtitle='Department-wise employee overview with leave and salary snapshot.'
          columnWidths={['w-28', 'w-24', 'w-18', 'w-20', 'w-16', 'w-20', 'w-24']}
          rows={5}
        />
      </>
    );
  }

  return (
    <>
      <ReportTableSection
        title='Payroll Report Table'
        subtitle='Monthly payroll status and salary breakdown for selected filters.'
        columns={['Employee Name', 'Department', 'Month', 'Basic Salary', 'LOP Days', 'Deductions', 'Net Salary', 'Status', 'Paid Date']}
        rows={filteredPayroll.map((row) => {
          const employee = employeeById.get(row.userId);
          return [
            <span key='employee' className='font-medium text-card-foreground'>{formatPersonName(row.employeeName) || 'Employee'}</span>,
            employee?.team?.department?.name ?? 'Unassigned',
            monthLabel(row.month, row.year),
            formatCurrencyINR(row.basicSalary),
            row.lopDays ?? 0,
            formatCurrencyINR(row.deductions),
            <span key='salary' className='font-semibold text-card-foreground'>{formatCurrencyINR(row.netSalary)}</span>,
            row.status,
            row.paidDate ? formatDateShort(row.paidDate) : '-',
          ];
        })}
      />

      <ReportTableSection
        title='Leave Report Table'
        subtitle='Leave requests with approval status and LOP details.'
        columns={['Employee Name', 'Leave Type', 'From Date', 'To Date', 'Total Days', 'Status', 'LOP Applied']}
        rows={filteredLeaves.map((row) => {
          const employee = row.userId ? employeeById.get(row.userId) : employeeByName.get(formatPersonName(row.user?.name));
          const from = new Date(row.startDate);
          const to = new Date(row.endDate);
          const totalDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          return [
            <span key='employee' className='font-medium text-card-foreground'>{formatPersonName(row.user?.name) || formatPersonName(employee?.name) || 'Employee'}</span>,
            row.type,
            row.startDate ? formatDateShort(row.startDate) : '-',
            row.endDate ? formatDateShort(row.endDate) : '-',
            totalDays,
            row.status,
            Number(row.lopDays ?? 0) > 0 ? 'Yes' : 'No',
          ];
        })}
      />

      <ReportTableSection
        title='Employee Summary Table'
        subtitle='Department-wise employee overview with leave and salary snapshot.'
        columns={['Employee Name', 'Department', 'Role', 'Joined Date', 'Status', 'Total Leaves Taken', 'Current Month Salary']}
        rows={filteredEmployees.map((row) => {
          const leavesTaken = leaves
            .filter((leave) => leave.userId === row.id && leave.status === 'APPROVED')
            .reduce((sum, leave) => sum + Number(leave.balanceDeductedDays ?? 0), 0);
          const currentPayroll = filteredPayroll.find((payroll) => payroll.userId === row.id);
          return [
            <span key='employee' className='font-medium text-card-foreground'>{formatPersonName(row.name) || 'Employee'}</span>,
            row.team?.department?.name ?? 'Unassigned',
            row.role,
            row.joiningDate ? formatDateShort(row.joiningDate) : '-',
            row.isActive === false ? 'INACTIVE' : 'ACTIVE',
            leavesTaken,
            <span key='salary' className='font-semibold text-card-foreground'>{formatCurrencyINR(Number(currentPayroll?.netSalary ?? 0))}</span>,
          ];
        })}
      />
    </>
  );
}

function ReportTableSkeleton({
  title,
  subtitle,
  columnWidths,
  rows,
}: {
  title: string;
  subtitle: string;
  columnWidths: string[];
  rows: number;
}) {
  return (
    <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-sm dark:shadow-none sm:gap-3.5 sm:p-4'>
      <div>
        <Skeleton className='h-6 w-52' />
        <Skeleton className='mt-2 h-3.5 w-80 max-w-full' />
      </div>
      <div className='flex w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/40'>
        <div className='w-full min-w-0 overflow-x-auto'>
          <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
            <thead className='sticky top-0 z-10'>
              <tr className='border-b border-border bg-muted/95 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
                {columnWidths.map((width, index) => (
                  <th key={`${title}-head-${index}`} className='px-4 py-3.5 text-left'>
                    <Skeleton className={`h-3 ${width}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, rowIndex) => (
                <tr
                  key={`${title}-row-${rowIndex}`}
                  className='border-b border-border bg-card/90'
                >
                  {columnWidths.map((width, cellIndex) => (
                    <td
                      key={`${title}-cell-${rowIndex}-${cellIndex}`}
                      className='px-4 py-2 align-top'
                    >
                      <Skeleton className={`h-3.5 ${width}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
