import { useState } from 'react';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { formatPersonName } from '@/lib/personName';
import { getApiErrorMessage } from '@/utils/apiError';
import toast from 'react-hot-toast';

type EditForm = {
  yearlyGrossSalary: string;
  basicSalary: string;
  hra: string;
  allowance: string;
  bonus: string;
  pf: string;
  tax: string;
  professionalTax: string;
  lopDays: string;
  lopAmount: string;
};

const monthlyTaxFromYearlyGross = (yearlyGrossSalary: number) => {
  if (!Number.isFinite(yearlyGrossSalary) || yearlyGrossSalary <= 0) return 0;
  if (yearlyGrossSalary <= 1200000) return 0;
  return (yearlyGrossSalary * 0.15) / 12;
};

const deriveSalaryFromYearlyGross = (yearlyGrossSalary: number) => {
  const monthlyGross = yearlyGrossSalary / 12;
  const basicSalary = monthlyGross * 0.5;
  const hra = basicSalary * 0.4;
  const pf = basicSalary * 0.12;
  const tax = monthlyTaxFromYearlyGross(yearlyGrossSalary);
  const professionalTax = 200;
  const allowance = Math.max(monthlyGross - basicSalary - hra, 0);

  return {
    basicSalary,
    hra,
    allowance,
    bonus: 0,
    pf,
    tax,
    professionalTax,
  };
};

const emptyEditForm: EditForm = {
  yearlyGrossSalary: '',
  basicSalary: '',
  hra: '',
  allowance: '',
  bonus: '',
  pf: '',
  tax: '',
  professionalTax: '',
  lopDays: '0',
  lopAmount: '0',
};

export function usePayrollActions(params: {
  rows: PayrollRow[];
  selectedMonth: number;
  selectedYear: number;
  isAdmin: boolean;
  onReload: () => Promise<void>;
}) {
  const { rows, selectedMonth, selectedYear, isAdmin, onReload } = params;

  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bulkMarkingPaid, setBulkMarkingPaid] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm);

  const toNum = (v: string) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
  };

  const formatMoneyInput = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    return String(Math.round(value));
  };

  const updateEditFormField = (field: keyof EditForm, value: string) => {
    setEditForm((prev) => {
      if (field !== 'yearlyGrossSalary') {
        return { ...prev, [field]: value };
      }

      const trimmed = value.trim();
      if (trimmed === '') {
        return { ...prev, yearlyGrossSalary: '' };
      }

      const gross = Number(trimmed);
      if (!Number.isFinite(gross) || gross < 0) {
        return { ...prev, yearlyGrossSalary: value };
      }

      const derived = deriveSalaryFromYearlyGross(gross);
      return {
        ...prev,
        yearlyGrossSalary: value,
        basicSalary: formatMoneyInput(derived.basicSalary),
        hra: formatMoneyInput(derived.hra),
        allowance: formatMoneyInput(derived.allowance),
        bonus: formatMoneyInput(derived.bonus),
        pf: formatMoneyInput(derived.pf),
        tax: formatMoneyInput(derived.tax),
        professionalTax: formatMoneyInput(derived.professionalTax),
      };
    });
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
      await onReload();
      toast.success(`${formatPersonName(row.employeeName) || row.employeeName} marked as paid`);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to mark payroll paid'));
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
      toast('No pending payroll records available to mark as paid');
      return;
    }
    setBulkMarkingPaid(true);
    try {
      await api.patch('/payroll/mark-paid/bulk', { month: selectedMonth, year: selectedYear });
      await onReload();
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
      await api.get<{ salaryStructures?: Array<PayrollRow & { isActive: boolean }> }>(
        `/organization/employees/${row.userId}/details`,
      );
      const source = row.payrollAdded === false ? null : row;
      setEditForm({
        yearlyGrossSalary: source?.yearlyGrossSalary != null && source.yearlyGrossSalary > 0 ? String(source.yearlyGrossSalary) : '',
        basicSalary: source?.basicSalary ? String(source.basicSalary) : '',
        hra: source?.hra ? String(source.hra) : '',
        allowance: source?.allowance ? String(source.allowance) : '',
        bonus: source?.bonus ? String(source.bonus) : '',
        pf: source?.pf ? String(source.pf) : '',
        tax: source?.tax ? String(source.tax) : '',
        professionalTax: source?.professionalTax ? String(source.professionalTax) : '',
        lopDays: source?.lopDays != null ? String(source.lopDays) : '0',
        lopAmount: source?.lopAmount != null ? String(source.lopAmount) : '0',
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
      await onReload();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update payroll details'));
    } finally {
      setEditSaving(false);
    }
  };

  const downloadPayslipPdf = (row: PayrollRow, monthLabel: string) => {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to download PDF.');
      return;
    }
    const html = `<html><body><h1>Payslip</h1><p>${formatPersonName(row.employeeName) || row.employeeName}</p><p>${monthLabel}</p></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return {
    activePayslip,
    setActivePayslip,
    editRow,
    setEditRow,
    editSaving,
    editLoading,
    editForm,
    setEditForm,
    updateEditFormField,
    bulkMarkingPaid,
    setBulkMarkingPaid,
    markAsPaid,
    markAllAsPaid,
    openEditPayroll,
    saveEditedPayroll,
    downloadPayslipPdf,
  };
}
