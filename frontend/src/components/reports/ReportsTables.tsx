import { formatPersonName } from '@/lib/personName';
import type { OrganizationEmployee } from '@/types/employee';
import type { LeaveWithEmployee } from '@/types/leave';
import type { PayrollRow } from '@/types/payroll';
import { formatCurrencyINR, formatDateShort } from '@/utils/formatters';
import ReportTableSection from './ReportTableSection';
import { monthLabel } from './useReportsData';

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
        emptyText={loading ? 'Loading payroll report...' : undefined}
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
        emptyText={loading ? 'Loading leave report...' : undefined}
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
        emptyText={loading ? 'Loading employee summary...' : undefined}
      />
    </>
  );
}
