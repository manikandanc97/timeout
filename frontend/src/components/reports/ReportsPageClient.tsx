'use client';

import { useAuth } from '@/context/AuthContext';
import { FileSpreadsheet } from 'lucide-react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import ReportsSummaryCards from './ReportsSummaryCards';
import { monthLabel, useReportsData } from './useReportsData';

const VIEW_ROLES = new Set(['ADMIN', 'MANAGER', 'HR']);
const ReportsTables = dynamic(() => import('./ReportsTables'));
const ReportsExportActions = dynamic(() => import('./ReportsExportActions'));

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
  const {
    loading,
    setLoading,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    selectedDepartment,
    setSelectedDepartment,
    departmentOptions,
    employeeById,
    employeeByName,
    leaves,
    filteredPayroll,
    filteredLeaves,
    filteredEmployees,
    summary,
    exportPayroll,
    exportLeaves,
    exportEmployees,
  } = useReportsData(canView);

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
            <ReportsExportActions onExportCsv={exportAllReports} onExportPdf={exportPdf} />
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

        <ReportsTables
          loading={loading}
          leaves={leaves}
          employeeById={employeeById}
          employeeByName={employeeByName}
          filteredPayroll={filteredPayroll}
          filteredLeaves={filteredLeaves}
          filteredEmployees={filteredEmployees}
        />
      </div>
    </section>
  );
}
