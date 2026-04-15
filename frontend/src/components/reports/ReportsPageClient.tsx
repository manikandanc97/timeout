'use client';

import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { formatPersonName } from '@/lib/personName';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import type { LeaveWithEmployee } from '@/types/leave';
import type { PayrollRow } from '@/types/payroll';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ReportTableSection from './ReportTableSection';
import ReportsSummaryCards from './ReportsSummaryCards';

const VIEW_ROLES = new Set(['ADMIN', 'MANAGER', 'HR']);

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const monthLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
const csvEscape = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;

const downloadCsv = (name: string, rows: Array<Array<string | number | boolean>>) => {
  const csv = rows.map((line) => line.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

function ReportsNoAccess() {
  return (
    <section className='rounded-3xl border border-warning-muted-foreground/25 bg-warning-muted p-6 text-warning-muted-foreground shadow-sm'>
      <h2 className='text-lg font-semibold'>Reports access restricted</h2>
      <p className='mt-1 text-sm text-warning-muted-foreground/90'>
        You do not have permission to view reports.
      </p>
    </section>
  );
}

function ReportsSummaryCardsSkeleton() {
  return (
    <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
      {Array.from({ length: 5 }).map((_, index) => (
        <article
          key={index}
          className='rounded-2xl border border-border border-l-4 border-l-border bg-card p-3 shadow-sm sm:p-3.5'
        >
          <div className='h-3 w-24 animate-pulse rounded bg-skeleton/90' />
          <div className='mt-2 h-8 w-16 animate-pulse rounded bg-skeleton/90' />
        </article>
      ))}
    </section>
  );
}

export default function ReportsPageClient() {
  const { user } = useAuth();
  const canView = VIEW_ROLES.has(String(user?.role ?? ''));
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [employees, setEmployees] = useState<OrganizationEmployee[]>([]);
  const [leaves, setLeaves] = useState<LeaveWithEmployee[]>([]);
  const [payrollRows, setPayrollRows] = useState<PayrollRow[]>([]);

  useEffect(() => {
    if (!canView) return;
    Promise.all([
      api.get<{ employees: OrganizationEmployee[] }>('/organization/employees'),
      api.get<LeaveWithEmployee[]>('/leaves'),
      api.get<{ payroll: PayrollRow[] }>(`/payroll?month=${selectedMonth}&year=${selectedYear}`),
    ])
      .then(([employeesRes, leavesRes, payrollRes]) => {
        setEmployees(Array.isArray(employeesRes.data?.employees) ? employeesRes.data.employees : []);
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
        setPayrollRows(Array.isArray(payrollRes.data?.payroll) ? payrollRes.data.payroll : []);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to load reports';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [canView, selectedMonth, selectedYear]);

  const departmentOptions = useMemo(() => {
    const allDepartments = new Set<string>();
    for (const row of employees) {
      allDepartments.add(row.team?.department?.name ?? 'Unassigned');
    }
    return ['ALL', ...Array.from(allDepartments).sort((a, b) => a.localeCompare(b))];
  }, [employees]);

  const employeeById = useMemo(() => {
    const byId = new Map<number, OrganizationEmployee>();
    employees.forEach((entry) => byId.set(entry.id, entry));
    return byId;
  }, [employees]);

  const employeeByName = useMemo(() => {
    const byName = new Map<string, OrganizationEmployee>();
    employees.forEach((entry) => byName.set(formatPersonName(entry.name), entry));
    return byName;
  }, [employees]);

  const filteredPayroll = useMemo(
    () =>
      payrollRows.filter((row) => {
        const employee = employeeById.get(row.userId);
        const department = employee?.team?.department?.name ?? 'Unassigned';
        const monthMatch = row.month === selectedMonth && row.year === selectedYear;
        const departmentMatch = selectedDepartment === 'ALL' || department === selectedDepartment;
        return monthMatch && departmentMatch;
      }),
    [employeeById, payrollRows, selectedDepartment, selectedMonth, selectedYear],
  );

  const filteredLeaves = useMemo(
    () =>
      leaves.filter((row) => {
        const employee = row.userId
          ? employeeById.get(row.userId)
          : employeeByName.get(formatPersonName(row.user?.name));
        const department = employee?.team?.department?.name ?? 'Unassigned';
        const fromDate = new Date(row.startDate);
        const monthMatch =
          fromDate.getMonth() + 1 === selectedMonth && fromDate.getFullYear() === selectedYear;
        const departmentMatch = selectedDepartment === 'ALL' || department === selectedDepartment;
        return monthMatch && departmentMatch;
      }),
    [employeeById, employeeByName, leaves, selectedDepartment, selectedMonth, selectedYear],
  );

  const filteredEmployees = useMemo(
    () => employees.filter((row) => {
      const department = row.team?.department?.name ?? 'Unassigned';
      return selectedDepartment === 'ALL' || department === selectedDepartment;
    }),
    [employees, selectedDepartment],
  );

  const summary = useMemo(() => {
    const totalSalaryPaid = filteredPayroll
      .filter((row) => row.status === 'PAID')
      .reduce((sum, row) => sum + row.netSalary, 0);
    const pendingRequests = filteredLeaves.filter((row) => row.status === 'PENDING').length;
    const employeesOnLeave = filteredEmployees.filter((row) => row.onLeaveToday).length;
    const newJoiners = filteredEmployees.filter((row) => {
      if (!row.joiningDate) return false;
      const joined = new Date(row.joiningDate);
      return joined.getMonth() + 1 === selectedMonth && joined.getFullYear() === selectedYear;
    }).length;
    return {
      totalEmployees: filteredEmployees.length,
      employeesOnLeave,
      totalSalaryPaid: currency.format(totalSalaryPaid),
      pendingRequests,
      newJoiners,
    };
  }, [filteredEmployees, filteredLeaves, filteredPayroll, selectedMonth, selectedYear]);

  const exportPayroll = () => {
    const rows = [
      ['Employee', 'Department', 'Month', 'Net Salary', 'Status', 'LOP Days', 'Deductions'],
      ...filteredPayroll.map((row) => {
        const employee = employeeById.get(row.userId);
        const department = employee?.team?.department?.name ?? 'Unassigned';
        return [
        formatPersonName(row.employeeName) || 'Employee',
        department,
        monthLabel(row.month, row.year),
        String(Math.round(row.netSalary)),
        row.status,
        String(row.lopDays),
        String(row.deductions),
      ];
      }),
    ];
    downloadCsv(`payroll-report-${selectedYear}-${selectedMonth}-${selectedDepartment}.csv`, rows);
  };

  const exportLeaves = () => {
    const rows = [
      ['Employee', 'Type', 'Start Date', 'End Date', 'Status', 'LOP Days', 'LOP Amount'],
      ...filteredLeaves.map((row) => [
        formatPersonName(row.user?.name) ||
          formatPersonName(employeeById.get(row.userId ?? -1)?.name) ||
          'Employee',
        row.type,
        row.startDate ? dateFmt.format(new Date(row.startDate)) : '-',
        row.endDate ? dateFmt.format(new Date(row.endDate)) : '-',
        row.status,
        String(row.balanceDeductedDays ?? 0),
        Number(row.lopDays ?? 0) > 0 ? 'Yes' : 'No',
      ]),
    ];
    downloadCsv(`leave-report-${selectedYear}-${selectedMonth}-${selectedDepartment}.csv`, rows);
  };

  const exportEmployees = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Department', 'Team', 'Status'],
      ...filteredEmployees.map((row) => [
        formatPersonName(row.name) || 'Employee',
        row.email,
        row.role,
        row.team?.department?.name ?? 'Unassigned',
        row.team?.name ?? '-',
        row.isActive === false ? 'INACTIVE' : 'ACTIVE',
      ]),
    ];
    downloadCsv(`employee-report-${selectedDepartment}.csv`, rows);
  };

  const exportAllReports = () => {
    exportPayroll();
    exportLeaves();
    exportEmployees();
    toast.success('Reports exported as CSV files');
  };

  const exportPdf = () => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=720');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to export PDF.');
      return;
    }
    const html = `
      <html>
        <head>
          <title>Reports - ${monthLabel(selectedMonth, selectedYear)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin-bottom: 4px; }
            p { margin: 4px 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Reports Snapshot</h1>
          <p>Period: ${monthLabel(selectedMonth, selectedYear)}</p>
          <p>Department: ${selectedDepartment === 'ALL' ? 'All Departments' : selectedDepartment}</p>
          <p>Employees: ${summary.totalEmployees} | On Leave: ${summary.employeesOnLeave} | Pending Requests: ${summary.pendingRequests}</p>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Salary Paid</td><td>${summary.totalSalaryPaid}</td></tr>
            <tr><td>Total Employees</td><td>${summary.totalEmployees}</td></tr>
            <tr><td>Employees On Leave</td><td>${summary.employeesOnLeave}</td></tr>
            <tr><td>New Joiners</td><td>${summary.newJoiners}</td></tr>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success('PDF export dialog opened');
  };

  if (!canView) {
    return <ReportsNoAccess />;
  }

  return (
    <section className='relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl'>
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-4 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Analytics
              </p>
              <h1 className='text-2xl font-bold leading-tight'>Reports</h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Payroll, leave, employee and attendance insights in one place.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setLoading(true);
                setSelectedMonth(Number(e.target.value));
              }}
              className='rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground'
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((monthValue) => (
                <option key={monthValue} value={monthValue}>
                  {new Date(2026, monthValue - 1, 1).toLocaleString('en-IN', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => {
                setLoading(true);
                setSelectedYear(Number(e.target.value));
              }}
              className='rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground'
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setLoading(true);
                setSelectedDepartment(e.target.value);
              }}
              className='rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground'
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department === 'ALL' ? 'All Departments' : department}
                </option>
              ))}
            </select>
            <Button type='button' variant='outline' className='rounded-xl!' onClick={exportAllReports}>
              <span className='inline-flex items-center gap-1.5'>
                <Download size={14} />
                Export CSV
              </span>
            </Button>
            <Button type='button' variant='outline' className='rounded-xl!' onClick={exportPdf}>
              Export PDF
            </Button>
          </div>
        </div>

        {loading ? (
          <ReportsSummaryCardsSkeleton />
        ) : (
          <ReportsSummaryCards
            totalEmployees={summary.totalEmployees}
            employeesOnLeave={summary.employeesOnLeave}
            totalSalaryPaid={summary.totalSalaryPaid}
            pendingRequests={summary.pendingRequests}
            newJoiners={summary.newJoiners}
          />
        )}

        <ReportTableSection
          title='Payroll Report Table'
          subtitle='Monthly payroll status and salary breakdown for selected filters.'
          columns={[
            'Employee Name',
            'Department',
            'Month',
            'Basic Salary',
            'LOP Days',
            'Deductions',
            'Net Salary',
            'Status',
            'Paid Date',
          ]}
          rows={filteredPayroll.map((row) => {
            const employee = employeeById.get(row.userId);
            const department = employee?.team?.department?.name ?? 'Unassigned';
            return [
            <span key='employee' className='font-medium text-card-foreground'>
              {formatPersonName(row.employeeName) || 'Employee'}
            </span>,
            department,
            monthLabel(row.month, row.year),
            currency.format(row.basicSalary),
            row.lopDays ?? 0,
            currency.format(row.deductions),
            <span key='salary' className='font-semibold text-card-foreground'>
              {currency.format(row.netSalary)}
            </span>,
            <span
              key='status'
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                row.status === 'PAID'
                  ? 'bg-success-muted text-success-muted-foreground ring-success-muted-foreground/30'
                  : 'bg-warning-muted text-warning-muted-foreground ring-warning-muted-foreground/35'
              }`}
            >
              {row.status}
            </span>,
            row.paidDate ? dateFmt.format(new Date(row.paidDate)) : '-',
          ];
          })}
          emptyText={loading ? 'Loading payroll report...' : undefined}
        />

        <ReportTableSection
          title='Leave Report Table'
          subtitle='Leave requests with approval status and LOP details.'
          columns={[
            'Employee Name',
            'Leave Type',
            'From Date',
            'To Date',
            'Total Days',
            'Status',
            'LOP Applied',
          ]}
          rows={filteredLeaves.map((row) => {
            const employee = row.userId
              ? employeeById.get(row.userId)
              : employeeByName.get(formatPersonName(row.user?.name));
            const from = new Date(row.startDate);
            const to = new Date(row.endDate);
            const totalDays = Math.max(
              1,
              Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1,
            );
            return [
            <span key='employee' className='font-medium text-card-foreground'>
              {formatPersonName(row.user?.name) ||
                formatPersonName(employee?.name) ||
                'Employee'}
            </span>,
            row.type,
            row.startDate ? dateFmt.format(new Date(row.startDate)) : '-',
            row.endDate ? dateFmt.format(new Date(row.endDate)) : '-',
            totalDays,
            <span
              key='status'
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                row.status === 'APPROVED'
                  ? 'bg-success-muted text-success-muted-foreground ring-success-muted-foreground/30'
                  : row.status === 'PENDING'
                    ? 'bg-warning-muted text-warning-muted-foreground ring-warning-muted-foreground/35'
                    : 'bg-danger-muted text-danger-muted-foreground ring-danger-muted-foreground/35'
              }`}
            >
              {row.status}
            </span>,
            Number(row.lopDays ?? 0) > 0 ? 'Yes' : 'No',
          ];
          })}
          emptyText={loading ? 'Loading leave report...' : undefined}
        />

        <ReportTableSection
          title='Employee Summary Table'
          subtitle='Department-wise employee overview with leave and salary snapshot.'
          columns={[
            'Employee Name',
            'Department',
            'Role',
            'Joined Date',
            'Status',
            'Total Leaves Taken',
            'Current Month Salary',
          ]}
          rows={filteredEmployees.map((row) => {
            const leavesTaken = leaves
              .filter((leave) => leave.userId === row.id && leave.status === 'APPROVED')
              .reduce((sum, leave) => sum + Number(leave.balanceDeductedDays ?? 0), 0);
            const currentPayroll = filteredPayroll.find((payroll) => payroll.userId === row.id);
            return [
            <span key='employee' className='font-medium text-card-foreground'>
              {formatPersonName(row.name) || 'Employee'}
            </span>,
            row.team?.department?.name ?? 'Unassigned',
            row.role,
            row.joiningDate ? dateFmt.format(new Date(row.joiningDate)) : '-',
            <span
              key='status'
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                row.isActive === false
                  ? 'bg-muted text-muted-foreground ring-border'
                  : 'bg-success-muted text-success-muted-foreground ring-success-muted-foreground/30'
              }`}
            >
              {row.isActive === false ? 'INACTIVE' : 'ACTIVE'}
            </span>,
            leavesTaken,
            <span key='salary' className='font-semibold text-card-foreground'>
              {currency.format(Number(currentPayroll?.netSalary ?? 0))}
            </span>,
          ];
          })}
          emptyText={loading ? 'Loading employee summary...' : undefined}
        />
      </div>
    </section>
  );
}
