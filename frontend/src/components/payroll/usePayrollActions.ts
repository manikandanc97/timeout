import { useState } from 'react';
import api from '@/services/api';
import type { PayrollRow } from '@/types/payroll';
import { formatPersonName } from '@/lib/personName';
import { getApiErrorMessage } from '@/utils/apiError';
import toast from 'react-hot-toast';

export function usePayrollActions(params: {
  rows: PayrollRow[];
  setRows: React.Dispatch<React.SetStateAction<PayrollRow[]>>;
  selectedMonth: number;
  selectedYear: number;
  isAdmin: boolean;
}) {
  const { rows, setRows, selectedMonth, selectedYear, isAdmin } = params;

  const [activePayslip, setActivePayslip] = useState<PayrollRow | null>(null);
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bulkMarkingPaid, setBulkMarkingPaid] = useState(false);
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

  const toNum = (v: string) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : 0;
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
    bulkMarkingPaid,
    setBulkMarkingPaid,
    markAsPaid,
    markAllAsPaid,
    openEditPayroll,
    saveEditedPayroll,
    downloadPayslipPdf,
  };
}
