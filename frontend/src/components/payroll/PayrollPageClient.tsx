'use client';

import Button from '@/components/ui/Button';
import PayslipPreviewModal from '@/components/payroll/PayslipPreviewModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { Download, Eye, RotateCcw, WalletCards } from 'lucide-react';
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
  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bulkMarkingPaid, setBulkMarkingPaid] = useState(false);
  const [showAmounts, setShowAmounts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<
    'NAME_ASC' | 'NAME_DESC' | 'STATUS' | 'MONTH_NEWEST' | 'MONTH_OLDEST'
  >('NAME_ASC');
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
    lopDays: '',
    lopAmount: '',
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

  const visibleRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch =
        query.length === 0 || row.employeeName.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PAID'
            ? row.status === 'PAID'
            : row.status !== 'PAID';
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.employeeName.localeCompare(b.employeeName);
      if (sortBy === 'NAME_DESC') return b.employeeName.localeCompare(a.employeeName);
      if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
      const aMonthKey = a.year * 100 + a.month;
      const bMonthKey = b.year * 100 + b.month;
      if (sortBy === 'MONTH_OLDEST') return aMonthKey - bMonthKey;
      return bMonthKey - aMonthKey;
    });
    return sorted;
  }, [rows, searchTerm, statusFilter, sortBy]);
  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== 'ALL' || sortBy !== 'NAME_ASC';

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
      lopDays: String((row as { lopDays?: number }).lopDays ?? 0),
      lopAmount: String((row as { lopAmount?: number }).lopAmount ?? 0),
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
      // For existing monthly payroll rows, always prefer that month's snapshot values.
      // Only use active salary structure when payroll is not yet added for selected month.
      const source = row.payrollAdded === false ? (active ?? row) : row;
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
        lopDays: String((source as { lopDays?: number }).lopDays ?? 0),
        lopAmount: String((source as { lopAmount?: number }).lopAmount ?? 0),
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
        lopDays: String(row.lopDays ?? 0),
        lopAmount: String(row.lopAmount ?? 0),
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
      lopDays: prev.lopDays,
      lopAmount: prev.lopAmount,
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
        lopDays: toNum(editForm.lopDays),
        lopAmount: toNum(editForm.lopAmount),
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
  const computeLopAmountFromDays = (lopDaysRaw: string, form = editForm) => {
    const lopDays = Math.max(toNum(lopDaysRaw), 0);
    const monthlyNetBeforeLop =
      toNum(form.basicSalary) +
      toNum(form.hra) +
      toNum(form.allowance) +
      toNum(form.bonus) -
      toNum(form.pf) -
      toNum(form.tax) -
      toNum(form.professionalTax);
    const monthDays = new Date(selectedYear, selectedMonth, 0).getDate();
    if (lopDays <= 0 || monthDays <= 0 || monthlyNetBeforeLop <= 0) return '0';
    const dailyRate = monthlyNetBeforeLop / monthDays;
    return String(Math.round((lopDays * dailyRate + Number.EPSILON) * 100) / 100);
  };
  const formatTableAmount = (value: number) => (showAmounts ? rupee.format(value) : '₹******');
  const computedEditNetSalary =
    toNum(editForm.basicSalary) +
    toNum(editForm.hra) +
    toNum(editForm.allowance) +
    toNum(editForm.bonus) -
    toNum(editForm.pf) -
    toNum(editForm.tax) -
    toNum(editForm.professionalTax) -
    toNum(editForm.lopAmount);
  const editPayoutDate = new Date(selectedYear, selectedMonth, 0);

  if (!canView) {
    return <PayrollNoAccess />;
  }

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
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Finance
              </p>
              <h1 id='payroll-heading' className='text-2xl font-bold leading-tight'>
                Payroll
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>
                Salary processing and payslip actions in one place.
              </p>
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

        <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
          {CARD_CONFIG.map((card) => (
            <div
              key={card.key}
              className={`rounded-2xl border border-border border-l-4 ${card.accent} bg-card p-3 shadow-sm sm:p-3.5`}
            >
              <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs'>
                {card.label}
              </p>
              <p className='mt-2 text-xl font-bold tabular-nums tracking-tight sm:mt-2.5 sm:text-2xl'>
                {summary[card.key]}
              </p>
            </div>
          ))}
        </section>

        <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search employee'
              className='h-10 w-52 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:border-primary'
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PAID' | 'UNPAID')}
              className='h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'
            >
              <option value='ALL'>All</option>
              <option value='PAID'>Paid</option>
              <option value='UNPAID'>Unpaid</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | 'NAME_ASC'
                    | 'NAME_DESC'
                    | 'STATUS'
                    | 'MONTH_NEWEST'
                    | 'MONTH_OLDEST',
                )
              }
              className='h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'
            >
              <option value='NAME_ASC'>Name (A-Z)</option>
              <option value='NAME_DESC'>Name (Z-A)</option>
              <option value='STATUS'>Status</option>
              <option value='MONTH_NEWEST'>Month (Newest)</option>
              <option value='MONTH_OLDEST'>Month (Oldest)</option>
            </select>
            <button
              type='button'
              aria-label='Clear all filters'
              disabled={!hasActiveFilters}
              onClick={() => {
                if (!hasActiveFilters) return;
                setSearchTerm('');
                setStatusFilter('ALL');
                setSortBy('NAME_ASC');
              }}
              className='inline-flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
            >
              <RotateCcw size={14} />
              Clear
            </button>
            <Button
              type='button'
              variant='outline'
              className='h-10 rounded-xl! px-3! text-sm!'
              onClick={() => setShowAmounts((prev) => !prev)}
            >
              {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
            </Button>
            <Button
              type='button'
              variant='primary'
              className='h-10 rounded-xl! px-3! text-sm!'
              disabled={
                bulkMarkingPaid || loading || bulkMarkPaidEligibleCount === 0 || !canMarkPaid
              }
              onClick={() => void markAllAsPaid()}
            >
              {bulkMarkingPaid ? 'Marking...' : 'Mark Paid All'}
            </Button>
          </div>
          <div className='flex min-h-124 w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/35'>
            <div className='w-full min-w-0 overflow-x-auto'>
              <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
                <thead className='sticky top-0 z-10'>
                  <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
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
                      <td colSpan={8} className='px-4 py-16 text-center text-sm text-muted-foreground'>
                        Loading payroll...
                      </td>
                    </tr>
                  ) : visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-16 text-center text-sm text-muted-foreground'>
                        No employees match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row) => {
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
                        className='border-b border-border/60 transition-colors hover:bg-muted/50'
                      >
                        <td className='px-4 py-2 text-left align-top font-medium text-card-foreground'>
                          {row.employeeName}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-muted-foreground'>
                          {formatTableAmount(row.basicSalary)}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-muted-foreground'>
                          {formatTableAmount(row.allowance)}
                        </td>
                        <td className='px-4 py-2 text-left align-top text-rose-700'>
                          <span>{row.lopDays ?? 0} day(s)</span>
                        </td>
                        <td className='px-4 py-2 text-left align-top text-muted-foreground'>
                          <span>{formatTableAmount(row.deductions)}</span>
                        </td>
                        <td className='px-4 py-2 text-left align-top font-semibold text-card-foreground'>
                          {formatTableAmount(row.netSalary)}
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
        <PayslipPreviewModal
          row={activePayslip}
          monthLabel={summary.currentMonth}
          onClose={() => setActivePayslip(null)}
          onDownload={downloadPayslipPdf}
        />
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
          <div className='relative z-10 w-full max-w-2xl rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xl'>
            <h3 className='text-lg font-bold'>
              {editRow.payrollAdded === false ? 'Add payroll details' : 'Edit payroll details'}
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>{editRow.employeeName}</p>
            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <label className='text-sm sm:col-span-2'>
                <span className='mb-1 block text-xs uppercase text-muted-foreground'>
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
                  className='w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'
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
                  ['lopDays', 'LOP Days'],
                  ['lopAmount', 'LOP Amount'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className='text-sm'>
                  <span className='mb-1 block text-xs uppercase text-muted-foreground'>{label}</span>
                  <input
                    type='number'
                    value={editForm[key]}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (key === 'lopDays') {
                        setEditForm((prev) => ({
                          ...prev,
                          lopDays: next,
                          lopAmount: computeLopAmountFromDays(next, prev),
                        }));
                        return;
                      }
                      setEditForm((prev) => ({ ...prev, [key]: next }));
                    }}
                    disabled={editLoading}
                    className='w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground outline-none focus:border-primary'
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
              <label htmlFor='autoCalc' className='text-xs text-muted-foreground'>
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
