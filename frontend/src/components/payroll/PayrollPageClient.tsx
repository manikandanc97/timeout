'use client';

import KpiCardGrid from '@/components/common/KpiCardGrid';
import { useAuth } from '@/context/AuthContext';
import { formatCurrencyINR } from '@/utils/formatters';
import { WalletCards } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePayrollPage } from './usePayrollPage';
import { usePayrollActions } from './usePayrollActions';

const PayrollTableSection = dynamic(() => import('./PayrollTableSection'));
const PayslipPreviewModal = dynamic(() => import('./PayslipPreviewModal'));
const PayrollEditModal = dynamic(() => import('./PayrollEditModal'));

function PayrollNoAccess() {
  return (
    <section className='rounded-3xl border border-warning-muted-foreground/25 bg-warning-muted p-6 text-warning-muted-foreground shadow-sm'>
      <h2 className='text-lg font-semibold'>Payroll access restricted</h2>
      <p className='mt-1 text-sm text-warning-muted-foreground/90'>
        You do not have permission to view payroll details.
      </p>
    </section>
  );
}

export default function PayrollPageClient() {
  const { user } = useAuth();
  const canView = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';
  const canMarkPaid = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const {
    rows,
    setRows,
    loading,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    showAmounts,
    setShowAmounts,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    summary,
    visibleRows,
    hasActiveFilters,
    bulkMarkPaidEligibleCount,
  } = usePayrollPage(canView);
  const payrollActions = usePayrollActions({
    rows,
    setRows,
    selectedMonth,
    selectedYear,
    isAdmin: Boolean(isAdmin),
  });
  const {
    activePayslip,
    setActivePayslip,
    editRow,
    setEditRow,
    editSaving,
    editLoading,
    editForm,
    setEditForm,
    bulkMarkingPaid,
    markAsPaid,
    markAllAsPaid,
    openEditPayroll,
    saveEditedPayroll,
    downloadPayslipPdf,
  } = payrollActions;

  const formatTableAmount = (value: number) => {
    const formattedAmount = formatCurrencyINR(value);
    const maskedAmount = formattedAmount.replace(/\d/g, '•');
    return <span className='tabular-nums'>{showAmounts ? formattedAmount : maskedAmount}</span>;
  };


  if (!canView) return <PayrollNoAccess />;

  return (
    <section className='relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl'>
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <WalletCards size={20} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>Finance</p>
              <h1 id='payroll-heading' className='text-2xl font-bold leading-tight'>Payroll</h1>
            </div>
          </div>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className='rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground'
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2026, month - 1, 1).toLocaleString('en-IN', { month: 'short' })}
                </option>
              ))}
            </select>
            <input
              type='number'
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className='w-24 rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground'
            />
          </div>
        </div>

        <KpiCardGrid
          ariaLabel='Payroll summary'
          items={[
            { key: 'totalEmployees', label: 'Total employees', value: summary.totalEmployees, accent: 'border-l-sky-400' },
            { key: 'payrollProcessed', label: 'Payroll processed', value: summary.payrollProcessed, accent: 'border-l-emerald-400' },
            { key: 'pendingPayroll', label: 'Pending payroll', value: summary.pendingPayroll, accent: 'border-l-amber-400' },
            { key: 'totalSalaryPaid', label: 'Total salary paid', value: summary.totalSalaryPaid, accent: 'border-l-violet-400' },
            { key: 'currentMonth', label: 'Current month', value: summary.currentMonth, accent: 'border-l-indigo-400' },
          ]}
        />

        <PayrollTableSection
          loading={loading}
          visibleRows={visibleRows}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('ALL');
            setSortBy('NAME_ASC');
          }}
          showAmounts={showAmounts}
          setShowAmounts={setShowAmounts}
          bulkMarkingPaid={bulkMarkingPaid}
          bulkMarkPaidEligibleCount={bulkMarkPaidEligibleCount}
          canMarkPaid={Boolean(canMarkPaid)}
          onMarkAllAsPaid={() => void markAllAsPaid()}
          onMarkAsPaid={(row) => void markAsPaid(row)}
          onOpenEditPayroll={(row) => void openEditPayroll(row)}
          onOpenPayslip={setActivePayslip}
          onDownloadPayslip={(row) => downloadPayslipPdf(row, summary.currentMonth)}
          formatTableAmount={formatTableAmount}
          isAdmin={Boolean(isAdmin)}
        />
      </div>

      <PayslipPreviewModal
        row={activePayslip}
        monthLabel={summary.currentMonth}
        onClose={() => setActivePayslip(null)}
        onDownload={(row) => downloadPayslipPdf(row, summary.currentMonth)}
      />

      <PayrollEditModal
        open={editRow != null}
        editLoading={editLoading}
        editSaving={editSaving}
        form={editForm}
        onChange={(key, value) => setEditForm((prev) => ({ ...prev, [key]: value }))}
        onClose={() => {
          if (!editSaving) setEditRow(null);
        }}
        onSave={() => void saveEditedPayroll()}
      />
    </section>
  );
}
