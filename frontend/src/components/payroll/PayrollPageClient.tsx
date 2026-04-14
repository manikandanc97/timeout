'use client';

import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { Download, Eye, ReceiptText, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const CARD_CONFIG = [
  { key: 'totalEmployees', label: 'Total employees', accent: 'border-l-sky-400' },
  {
    key: 'payrollProcessed',
    label: 'Payroll processed',
    accent: 'border-l-emerald-400',
  },
  { key: 'pendingPayroll', label: 'Pending payroll', accent: 'border-l-amber-400' },
  { key: 'totalSalaryPaid', label: 'Total salary paid', accent: 'border-l-violet-400' },
  { key: 'currentMonth', label: 'Current month', accent: 'border-l-indigo-400' },
] as const;

function PayrollNoAccess() {
  return (
    <section className='rounded-3xl border border-amber-100 bg-amber-50 p-6 text-amber-900 shadow-sm'>
      <h2 className='text-lg font-semibold'>Payroll access restricted</h2>
      <p className='mt-1 text-sm text-amber-800'>
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
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedPayslips, setGeneratedPayslips] = useState<Set<number>>(new Set());
  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkMarkingPaid, setBulkMarkingPaid] = useState(false);
  const [autoCalc, setAutoCalc] = useState(true);
  const [editForm, setEditForm] = useState({
    yearlyGrossSalary: '',
    basicSalary: '',
    hra: '',
    allowance: '',
    bonus: '',
    pf: '',
    tax: '',
    professionalTax: '',
  });

  const loadPayroll = () => {
    if (!canView) return;
    setLoading(true);
    return api
      .get<{ payroll: PayrollRow[] }>(
        `/payroll?month=${selectedMonth}&year=${selectedYear}`,
      )
      .then((res) => {
        setRows(Array.isArray(res.data?.payroll) ? res.data.payroll : []);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'Failed to load payroll';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void loadPayroll();
  }, [canView, selectedMonth, selectedYear]);

  const summary = useMemo(() => {
    const totalEmployees = rows.length;
    const payrollProcessed = rows.filter((row) => row.status === 'PAID').length;
    const pendingPayroll = totalEmployees - payrollProcessed;
    const totalSalaryPaid = rows.filter((row) => row.status === 'PAID').reduce(
      (sum, row) => sum + row.netSalary,
      0,
    );
    const currentMonth = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

    return {
      totalEmployees: String(totalEmployees),
      payrollProcessed: String(payrollProcessed),
      pendingPayroll: String(pendingPayroll),
      totalSalaryPaid: rupee.format(totalSalaryPaid),
      currentMonth,
    };
  }, [rows]);

  const bulkGenerateEligibleCount = useMemo(
    () => rows.filter((row) => row.payrollAdded !== false && row.employeeActive !== false).length,
    [rows],
  );

  const bulkMarkPaidEligibleCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          row.payrollAdded !== false &&
          row.employeeActive !== false &&
          row.status !== 'PAID' &&
          row.status !== 'NOT_ADDED',
      ).length,
    [rows],
  );

  const markAsPaid = async (row: PayrollRow) => {
    if (row.payrollAdded === false) {
      toast.info('Payroll not added yet. Add salary in employee payroll details first.');
      return;
    }
    if (row.status === 'PAID') {
      toast.info(`${row.employeeName} payroll is already paid`);
      return;
    }
    try {
      await api.patch(`/payroll/${row.id}/mark-paid`);
      setRows((prev) =>
        prev.map((item) => (item.id === row.id ? { ...item, status: 'PAID' } : item)),
      );
      toast.success(`${row.employeeName} marked as paid`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to mark payroll paid';
      toast.error(msg);
    }
  };

  const generatePayslip = async (row: PayrollRow) => {
    if (row.payrollAdded === false) {
      toast.info('Payroll not added yet. Add salary in employee payroll details first.');
      return;
    }
    try {
      await api.post(`/payroll/${row.id}/generate-slip`);
      setGeneratedPayslips((prev) => {
        const next = new Set(prev);
        next.add(row.id);
        return next;
      });
      toast.success(`Payslip generated for ${row.employeeName}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to generate payslip';
      toast.error(msg);
    }
  };

  const generateAllPayslips = async () => {
    const eligibleRows = rows.filter(
      (row) => row.payrollAdded !== false && row.employeeActive !== false,
    );
    if (eligibleRows.length === 0) {
      toast.info('No eligible payroll records available for payslip generation');
      return;
    }
    setBulkGenerating(true);
    try {
      const res = await api.post<{ generatedCount?: number; message?: string }>(
        '/payroll/generate-slip/bulk',
        {
          month: selectedMonth,
          year: selectedYear,
        },
      );
      const generatedCount = Number(res.data?.generatedCount ?? eligibleRows.length);
      setGeneratedPayslips((prev) => {
        const next = new Set(prev);
        eligibleRows.forEach((row) => next.add(row.id));
        return next;
      });
      toast.success(res.data?.message ?? `Payslip generated for ${generatedCount} employee(s)`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to generate payslips';
      toast.error(msg);
    } finally {
      setBulkGenerating(false);
    }
  };

  const markAllAsPaid = async () => {
    const pendingEligibleRows = rows.filter(
      (row) =>
        row.payrollAdded !== false &&
        row.employeeActive !== false &&
        row.status !== 'PAID' &&
        row.status !== 'NOT_ADDED',
    );
    if (pendingEligibleRows.length === 0) {
      toast.info('No pending payroll records available to mark as paid');
      return;
    }
    setBulkMarkingPaid(true);
    try {
      const res = await api.patch<{ updatedCount?: number; message?: string }>(
        '/payroll/mark-paid/bulk',
        {
          month: selectedMonth,
          year: selectedYear,
        },
      );
      setRows((prev) =>
        prev.map((row) =>
          row.payrollAdded !== false &&
          row.employeeActive !== false &&
          row.status !== 'PAID' &&
          row.status !== 'NOT_ADDED'
            ? { ...row, status: 'PAID' }
            : row,
        ),
      );
      const updatedCount = Number(res.data?.updatedCount ?? pendingEligibleRows.length);
      toast.success(res.data?.message ?? `Marked ${updatedCount} payroll record(s) as paid`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to mark all payroll as paid';
      toast.error(msg);
    } finally {
      setBulkMarkingPaid(false);
    }
  };

  const downloadPayslipPdf = (row: PayrollRow) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to download PDF.');
      return;
    }

    const statusLabel = row.status === 'PAID' ? 'Paid' : 'Unpaid';
    const hra = row.hra ?? 0;
    const bonus = row.bonus ?? 0;
    const pf = row.pf ?? 0;
    const tax = row.tax ?? 0;
    const professionalTax = row.professionalTax ?? 0;
    const lopDays = row.lopDays ?? 0;
    const lopAmount = row.lopAmount ?? 0;
    const grossSalary = row.basicSalary + hra + row.allowance + bonus;
    const totalDeductions = pf + tax + professionalTax + lopAmount;
    const html = `
      <html>
        <head>
          <title>Payslip - ${row.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
            h1 { margin-bottom: 4px; }
            p { margin: 4px 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background: #f9fafb; }
            .net { font-weight: 700; }
          </style>
        </head>
        <body>
          <h1>Payslip</h1>
          <p><strong>Employee:</strong> ${row.employeeName}</p>
          <p><strong>Status:</strong> ${statusLabel}</p>
          <p><strong>Month:</strong> ${summary.currentMonth}</p>
          <table>
            <tr><th>Basic</th><td>${rupee.format(row.basicSalary)}</td></tr>
            <tr><th>HRA</th><td>${rupee.format(hra)}</td></tr>
            <tr><th>Allowance</th><td>${rupee.format(row.allowance)}</td></tr>
            <tr><th>Bonus</th><td>${rupee.format(bonus)}</td></tr>
            <tr><th>Gross Salary</th><td>${rupee.format(grossSalary)}</td></tr>
            <tr><th>PF</th><td>${rupee.format(pf)}</td></tr>
            <tr><th>Tax</th><td>${rupee.format(tax)}</td></tr>
            <tr><th>Professional Tax</th><td>${rupee.format(professionalTax)}</td></tr>
            <tr><th>LOP Days</th><td>${lopDays}</td></tr>
            <tr><th>LOP Deduction</th><td>${rupee.format(lopAmount)}</td></tr>
            <tr><th>Total Deductions</th><td>${rupee.format(totalDeductions)}</td></tr>
            <tr><th>Net Salary</th><td class="net">${rupee.format(row.netSalary)}</td></tr>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    toast.success(`Download dialog opened for ${row.employeeName}`);
  };

  const openEditPayroll = async (row: PayrollRow) => {
    if (!isAdmin) {
      toast.error('Only admin can add or edit payroll details');
      return;
    }
    // Reset immediately to avoid showing stale values from previously opened employee.
    setEditForm({
      yearlyGrossSalary: String(row.yearlyGrossSalary ?? ''),
      basicSalary: String(row.basicSalary ?? 0),
      hra: String((row as { hra?: number }).hra ?? 0),
      allowance: String(row.allowance ?? 0),
      bonus: String((row as { bonus?: number }).bonus ?? 0),
      pf: String((row as { pf?: number }).pf ?? 0),
      tax: String((row as { tax?: number }).tax ?? 0),
      professionalTax: String((row as { professionalTax?: number }).professionalTax ?? 0),
    });
    setEditRow(row);
    setAutoCalc(true);
    setEditLoading(true);
    try {
      const res = await api.get<{
        salaryStructures?: Array<{
          yearlyGrossSalary?: number | null;
          basicSalary: number;
          hra: number;
          allowance: number;
          bonus: number;
          pf: number;
          tax: number;
          professionalTax: number;
          isActive: boolean;
        }>;
      }>(`/organization/employees/${row.userId}/details`);
      const active = (res.data.salaryStructures ?? []).find((x) => x.isActive);
      const source = active ?? row;
      setEditForm({
        yearlyGrossSalary: String(
          (source as { yearlyGrossSalary?: number | null }).yearlyGrossSalary ?? '',
        ),
        basicSalary: String(source.basicSalary ?? 0),
        hra: String((source as { hra?: number }).hra ?? 0),
        allowance: String(source.allowance ?? 0),
        bonus: String((source as { bonus?: number }).bonus ?? 0),
        pf: String((source as { pf?: number }).pf ?? 0),
        tax: String((source as { tax?: number }).tax ?? 0),
        professionalTax: String((source as { professionalTax?: number }).professionalTax ?? 0),
      });
    } catch {
      setEditForm({
        yearlyGrossSalary: '',
        basicSalary: String(row.basicSalary ?? 0),
        hra: '0',
        allowance: String(row.allowance ?? 0),
        bonus: '0',
        pf: '0',
        tax: '0',
        professionalTax: '0',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const monthlyTaxFromYearlyGross = (yearlyGross: number) => {
    if (!Number.isFinite(yearlyGross) || yearlyGross <= 0) return 0;
    if (yearlyGross <= 1200000) return 0;
    return (yearlyGross * 0.15) / 12;
  };

  const applyAutoCalculation = (yearlyGrossRaw: string) => {
    const yearlyGross = Number(yearlyGrossRaw);
    if (!Number.isFinite(yearlyGross) || yearlyGross <= 0) return;
    const monthlyGross = yearlyGross / 12;
    const basicSalary = monthlyGross * 0.5;
    const hra = basicSalary * 0.4;
    const allowance = Math.max(monthlyGross - basicSalary - hra, 0);
    const bonus = 0;
    const pf = basicSalary * 0.12;
    const tax = monthlyTaxFromYearlyGross(yearlyGross);
    const professionalTax = 200;
    setEditForm((prev) => ({
      ...prev,
      yearlyGrossSalary: yearlyGrossRaw,
      basicSalary: String(Math.round(basicSalary)),
      hra: String(Math.round(hra)),
      allowance: String(Math.round(allowance)),
      bonus: String(Math.round(bonus)),
      pf: String(Math.round(pf)),
      tax: String(Math.round(tax)),
      professionalTax: String(Math.round(professionalTax)),
    }));
  };

  const saveEditedPayroll = async () => {
    if (!editRow) return;
    const toNum = (v: string) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    setEditSaving(true);
    try {
      await api.post(`/organization/employees/${editRow.userId}/salary-structure`, {
        yearlyGrossSalary: editForm.yearlyGrossSalary
          ? toNum(editForm.yearlyGrossSalary)
          : undefined,
        basicSalary: toNum(editForm.basicSalary),
        hra: toNum(editForm.hra),
        allowance: toNum(editForm.allowance),
        bonus: toNum(editForm.bonus),
        pf: toNum(editForm.pf),
        tax: toNum(editForm.tax),
        professionalTax: toNum(editForm.professionalTax),
        effectiveFrom: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
      });
      toast.success('Payroll details updated');
      setEditRow(null);
      await loadPayroll();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update payroll details';
      toast.error(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const toNum = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const computedEditNetSalary =
    toNum(editForm.basicSalary) +
    toNum(editForm.hra) +
    toNum(editForm.allowance) +
    toNum(editForm.bonus) -
    toNum(editForm.pf) -
    toNum(editForm.tax) -
    toNum(editForm.professionalTax);
  const editPayoutDate = new Date(selectedYear, selectedMonth, 0);

  if (!canView) {
    return <PayrollNoAccess />;
  }

  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <WalletCards size={20} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400'>
                Finance
              </p>
              <h1 id='payroll-heading' className='text-2xl font-bold leading-tight text-gray-900'>
                Payroll
              </h1>
              <p className='mt-1 text-sm text-gray-500'>
                Salary processing and payslip actions in one place.
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm'
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
              className='w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm'
            />
          </div>
        </div>

        <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
          {CARD_CONFIG.map((card) => (
            <div
              key={card.key}
              className={`rounded-2xl border border-gray-100 border-l-4 ${card.accent} bg-white p-3 shadow-sm sm:p-3.5`}
            >
              <p className='text-[11px] font-medium uppercase tracking-wider text-gray-500 sm:text-xs'>
                {card.label}
              </p>
              <p className='mt-2 text-xl font-bold tabular-nums tracking-tight text-gray-900 sm:mt-2.5 sm:text-2xl'>
                {summary[card.key]}
              </p>
            </div>
          ))}
        </section>

        <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
          <div className='flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={bulkGenerating || loading || bulkGenerateEligibleCount === 0}
              onClick={() => void generateAllPayslips()}
            >
              {bulkGenerating ? 'Generating...' : 'Generate All'}
            </Button>
            <Button
              type='button'
              variant='primary'
              disabled={
                bulkMarkingPaid || loading || bulkMarkPaidEligibleCount === 0 || !canMarkPaid
              }
              onClick={() => void markAllAsPaid()}
            >
              {bulkMarkingPaid ? 'Marking...' : 'Mark Paid All'}
            </Button>
          </div>
          <div className='flex w-full min-w-0 min-h-124 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
            <div className='w-full min-w-0 overflow-x-auto'>
              <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
                <thead className='sticky top-0 z-10'>
                  <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                    <th className='px-4 py-3.5 text-left'>Employee Name</th>
                    <th className='px-4 py-3.5 text-left'>Basic</th>
                    <th className='px-4 py-3.5 text-left'>Allowance</th>
                    <th className='px-4 py-3.5 text-left'>LOP</th>
                    <th className='px-4 py-3.5 text-left'>Deductions</th>
                    <th className='px-4 py-3.5 text-left'>Net Salary</th>
                    <th className='px-4 py-3.5 text-left'>Status</th>
                    <th className='px-4 py-3.5 text-right'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-16 text-center text-sm text-gray-500'>
                        Loading payroll...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-16 text-center text-sm text-gray-500'>
                        No payroll records found for selected month.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                    const isDeactivated = row.employeeActive === false;
                    const statusClass =
                      isDeactivated
                        ? 'bg-slate-100 text-slate-700 ring-slate-300'
                        : row.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : row.status === 'NOT_ADDED'
                          ? 'bg-slate-100 text-slate-700 ring-slate-300'
                        : 'bg-amber-50 text-amber-800 ring-amber-200';
                    return (
                      <tr
                        key={row.id}
                        className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                      >
                        <td className='px-4 py-2 text-left align-top font-medium text-gray-900'>
                          {row.employeeName}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-gray-700'>
                          {rupee.format(row.basicSalary)}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-gray-700'>
                          {rupee.format(row.allowance)}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-rose-700'>
                          <div className='flex flex-col gap-0.5'>
                            <span>{row.lopDays ?? 0} day(s)</span>
                            {row.lopAmount && row.lopAmount > 0 ? (
                              <span className='text-[10px] text-rose-600'>
                                - {rupee.format(row.lopAmount)}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className='px-4 py-2 text-left align-top text-gray-700'>
                          <div className='flex flex-col gap-0.5'>
                            <span>{rupee.format(row.deductions)}</span>
                            {row.lopAmount && row.lopAmount > 0 ? (
                              <span className='text-[10px] text-gray-500'>
                                Includes LOP deduction
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className='px-4 py-2 text-left align-top font-semibold text-gray-900'>
                          {rupee.format(row.netSalary)}
                        </td>
                        <td className='px-4 py-2 text-left align-top'>
                          {isDeactivated ? (
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                            >
                              Deactivated
                            </span>
                          ) : row.status === 'NOT_ADDED' ? (
                            isAdmin ? (
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2.5! py-1! text-xs!'
                              onClick={() => void openEditPayroll(row)}
                            >
                              Add Payroll
                            </Button>
                            ) : (
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                              >
                                Not added
                              </span>
                            )
                          ) : (
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                            >
                              {row.status === 'PAID' ? 'Paid' : 'Unpaid'}
                            </span>
                          )}
                        </td>
                        <td className='px-4 py-2 text-right align-top'>
                          <div className='flex justify-end gap-1'>
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2! py-1.5! text-xs!'
                              disabled={row.payrollAdded === false || isDeactivated}
                              onClick={() => setActivePayslip(row)}
                            >
                              <span className='flex items-center gap-1'>
                                <Eye size={14} />
                                View payslip
                              </span>
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2! py-1.5! text-xs!'
                              disabled={row.payrollAdded === false || isDeactivated || !isAdmin}
                              onClick={() => void openEditPayroll(row)}
                            >
                              Edit
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2! py-1.5! text-xs!'
                              disabled={row.payrollAdded === false || isDeactivated}
                              onClick={() => generatePayslip(row)}
                            >
                              <span className='flex items-center gap-1'>
                                <ReceiptText size={14} />
                                {generatedPayslips.has(row.id) ? 'Generated' : 'Generate'}
                              </span>
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2! py-1.5! text-xs!'
                              disabled={
                                row.status === 'PAID' ||
                                !canMarkPaid ||
                                row.payrollAdded === false ||
                                isDeactivated
                              }
                              onClick={() => void markAsPaid(row)}
                            >
                              Mark paid
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              className='rounded-md! px-2! py-1.5! text-xs!'
                              disabled={row.payrollAdded === false || isDeactivated}
                              onClick={() => downloadPayslipPdf(row)}
                            >
                              <span className='flex items-center gap-1'>
                                <Download size={14} />
                                PDF
                              </span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {activePayslip ? (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='Close payslip preview'
            className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
            onClick={() => setActivePayslip(null)}
          />
          <div className='relative z-10 w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl'>
            <h2 className='text-lg font-bold text-gray-900'>Payslip preview</h2>
            <p className='mt-1 text-sm text-gray-500'>
              {activePayslip.employeeName} - {summary.currentMonth}
            </p>
            <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='rounded-lg bg-indigo-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-indigo-700'>Net salary</p>
                <p className='mt-1 font-semibold text-indigo-900'>
                  {rupee.format(activePayslip.netSalary)}
                </p>
              </div>
              <div className='rounded-lg bg-rose-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-rose-700'>LOP details</p>
                <p className='mt-1 text-sm text-rose-800'>
                  Days: <span className='font-semibold'>{activePayslip.lopDays ?? 0}</span>
                </p>
                <p className='mt-1 text-sm text-rose-800'>
                  Deduction:{' '}
                  <span className='font-semibold'>- {rupee.format(activePayslip.lopAmount ?? 0)}</span>
                </p>
              </div>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-3 text-sm'>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Basic</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.basicSalary)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>HRA</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.hra ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Allowance</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.allowance)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Bonus</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.bonus ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>PF</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.pf ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Tax</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.tax ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Professional tax</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(activePayslip.professionalTax ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>LOP deduction</p>
                <p className='mt-1 font-semibold text-rose-700'>
                  - {rupee.format(activePayslip.lopAmount ?? 0)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Deductions</p>
                <p className='mt-1 font-semibold text-gray-900'>
                  {rupee.format(
                    (activePayslip.pf ?? 0) +
                      (activePayslip.tax ?? 0) +
                      (activePayslip.professionalTax ?? 0) +
                      (activePayslip.lopAmount ?? 0),
                  )}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-3'>
                <p className='text-xs uppercase tracking-wide text-gray-500'>Gross salary</p>
                <p className='mt-1 font-bold text-gray-900'>
                  {rupee.format(
                    activePayslip.basicSalary +
                      (activePayslip.hra ?? 0) +
                      activePayslip.allowance +
                      (activePayslip.bonus ?? 0),
                  )}
                </p>
              </div>
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setActivePayslip(null)}>
                Close
              </Button>
              <Button
                type='button'
                variant='primary'
                onClick={() => downloadPayslipPdf(activePayslip)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {editRow ? (
        <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='Close payroll editor'
            className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
            onClick={() => {
              if (!editSaving) setEditRow(null);
            }}
          />
          <div className='relative z-10 w-full max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl'>
            <h3 className='text-lg font-bold text-gray-900'>
              {editRow.payrollAdded === false ? 'Add payroll details' : 'Edit payroll details'}
            </h3>
            <p className='mt-1 text-sm text-gray-500'>{editRow.employeeName}</p>
            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <label className='text-sm sm:col-span-2'>
                <span className='mb-1 block text-xs uppercase text-gray-500'>
                  Yearly Gross Salary
                </span>
                <input
                  type='number'
                  value={editForm.yearlyGrossSalary}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (autoCalc) {
                      applyAutoCalculation(next);
                    } else {
                      setEditForm((prev) => ({ ...prev, yearlyGrossSalary: next }));
                    }
                  }}
                  disabled={editLoading}
                  className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary'
                />
              </label>
              {(
                [
                  ['basicSalary', 'Basic Salary'],
                  ['hra', 'HRA'],
                  ['allowance', 'Allowance'],
                  ['bonus', 'Bonus'],
                  ['pf', 'PF'],
                  ['tax', 'Tax'],
                  ['professionalTax', 'Professional Tax'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className='text-sm'>
                  <span className='mb-1 block text-xs uppercase text-gray-500'>{label}</span>
                  <input
                    type='number'
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    disabled={editLoading}
                    className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary'
                  />
                </label>
              ))}
            </div>
            <div className='mt-2 flex items-center gap-2'>
              <input
                id='autoCalc'
                type='checkbox'
                checked={autoCalc}
                onChange={(e) => setAutoCalc(e.target.checked)}
                disabled={editLoading}
              />
              <label htmlFor='autoCalc' className='text-xs text-gray-600'>
                Auto-calculate deduction and salary breakup from yearly gross
              </label>
            </div>
            <div className='mt-4 rounded-lg bg-indigo-50 p-3'>
              <p className='text-xs uppercase tracking-wide text-indigo-700'>Net salary</p>
              <p className='mt-1 text-lg font-bold text-indigo-900'>
                Rs. {Math.max(computedEditNetSalary, 0).toLocaleString('en-IN')}
              </p>
              <p className='mt-1 text-xs text-indigo-700'>
                Salary payout date: {editPayoutDate.toLocaleDateString('en-GB')}
              </p>
            </div>
            <div className='mt-5 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditRow(null)}
                disabled={editSaving || editLoading}
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={() => void saveEditedPayroll()}
                disabled={editSaving || editLoading}
              >
                {editLoading ? 'Loading...' : editSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
