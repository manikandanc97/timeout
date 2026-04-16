'use client';

import KpiCardGrid from '@/components/common/KpiCardGrid';
import { useAuth } from '@/context/AuthContext';
import { formatPersonName } from '@/lib/personName';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatCurrencyINR } from '@/utils/formatters';
import { WalletCards } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usePayrollPage } from './usePayrollPage';

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

  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    yearlyGrossSalary: '',
    basicSalary: '',
    hra: '',
    allowance: '',
    bonus: '',
    pf: '',
    tax: '',
    professionalTax: '',
    lopDays: '',
    lopAmount: '',
  });

  const {
    rows,
    setRows,
    loading,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    bulkMarkingPaid,
    setBulkMarkingPaid,
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

  const toNum = (v: string) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };

  const formatTableAmount = (value: number) => {
    const formattedAmount = formatCurrencyINR(value);
    const maskedAmount = formattedAmount.replace(/\d/g, '•');
    return <span className='tabular-nums'>{showAmounts ? formattedAmount : maskedAmount}</span>;
  };

  const markAsPaid = async (row: PayrollRow) => {
    if (row.payrollAdded === false) {
      toast('Payroll not added yet. Add salary in employee payroll details first.');
      return;
    }
    if (row.status === 'PAID') {
      toast(`${formatPersonName(row.employeeName) || row.employeeName} payroll is already paid`);
      return;
    }
    try {
      await api.patch(`/payroll/${row.id}/mark-paid`);
      setRows((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: 'PAID' } : item)));
      toast.success(`${formatPersonName(row.employeeName) || row.employeeName} marked as paid`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to mark payroll paid'));
    }
  };

  const markAllAsPaid = async () => {
    const pendingEligibleRows = rows.filter(
      (row) => row.payrollAdded !== false && row.employeeActive !== false && row.status !== 'PAID' && row.status !== 'NOT_ADDED',
    );
    if (pendingEligibleRows.length === 0) {
      toast('No pending payroll records available to mark as paid');
      return;
    }

    setBulkMarkingPaid(true);
    try {
      await api.patch('/payroll/mark-paid/bulk', {
        month: selectedMonth,
        year: selectedYear,
      });
      setRows((prev) =>
        prev.map((row) =>
          row.payrollAdded !== false && row.employeeActive !== false && row.status !== 'PAID' && row.status !== 'NOT_ADDED'
            ? { ...row, status: 'PAID' }
            : row,
        ),
      );
      toast.success(`Marked ${pendingEligibleRows.length} payroll record(s) as paid`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to mark all payroll as paid'));
    } finally {
      setBulkMarkingPaid(false);
    }
  };

  const openEditPayroll = async (row: PayrollRow) => {
    if (!isAdmin) {
      toast.error('Only admin can add or edit payroll details');
      return;
    }

    setEditRow(row);
    setEditLoading(true);
    try {
      const res = await api.get<{ salaryStructures?: Array<PayrollRow & { isActive: boolean }> }>(
        `/organization/employees/${row.userId}/details`,
      );
      const active = (res.data.salaryStructures ?? []).find((x) => x.isActive);
      const source = row.payrollAdded === false ? (active ?? row) : row;
      setEditForm({
        yearlyGrossSalary: String(source.yearlyGrossSalary ?? ''),
        basicSalary: String(source.basicSalary ?? 0),
        hra: String(source.hra ?? 0),
        allowance: String(source.allowance ?? 0),
        bonus: String(source.bonus ?? 0),
        pf: String(source.pf ?? 0),
        tax: String(source.tax ?? 0),
        professionalTax: String(source.professionalTax ?? 0),
        lopDays: String(source.lopDays ?? 0),
        lopAmount: String(source.lopAmount ?? 0),
      });
    } finally {
      setEditLoading(false);
    }
  };

  const saveEditedPayroll = async () => {
    if (!editRow) return;

    setEditSaving(true);
    try {
      await api.post(`/organization/employees/${editRow.userId}/salary-structure`, {
        yearlyGrossSalary: editForm.yearlyGrossSalary ? toNum(editForm.yearlyGrossSalary) : undefined,
        basicSalary: toNum(editForm.basicSalary),
        hra: toNum(editForm.hra),
        allowance: toNum(editForm.allowance),
        bonus: toNum(editForm.bonus),
        pf: toNum(editForm.pf),
        tax: toNum(editForm.tax),
        professionalTax: toNum(editForm.professionalTax),
        lopDays: toNum(editForm.lopDays),
        lopAmount: toNum(editForm.lopAmount),
        effectiveFrom: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
      });
      toast.success('Payroll details updated');
      setEditRow(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update payroll details'));
    } finally {
      setEditSaving(false);
    }
  };

  const downloadPayslipPdf = (row: PayrollRow) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to download PDF.');
      return;
    }

    const html = `<html><body><h1>Payslip</h1><p>${formatPersonName(row.employeeName) || row.employeeName}</p><p>${summary.currentMonth}</p></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
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
          onDownloadPayslip={downloadPayslipPdf}
          formatTableAmount={formatTableAmount}
          isAdmin={Boolean(isAdmin)}
        />
      </div>

      <PayslipPreviewModal
        row={activePayslip}
        monthLabel={summary.currentMonth}
        onClose={() => setActivePayslip(null)}
        onDownload={downloadPayslipPdf}
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
