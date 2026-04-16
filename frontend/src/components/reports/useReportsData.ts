'use client';

import { formatPersonName } from '@/lib/personName';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import type { LeaveWithEmployee } from '@/types/leave';
import type { PayrollRow } from '@/types/payroll';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatCurrencyINR } from '@/utils/formatters';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

export const monthLabel = (month: number, year: number) =>
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

export function useReportsData(canView: boolean) {
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
        toast.error(getApiErrorMessage(err, 'Failed to load reports'));
      })
      .finally(() => setLoading(false));
  }, [canView, selectedMonth, selectedYear]);

  const departmentOptions = useMemo(() => {
    const allDepartments = new Set<string>();
    for (const row of employees) allDepartments.add(row.team?.department?.name ?? 'Unassigned');
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
        return (
          row.month === selectedMonth &&
          row.year === selectedYear &&
          (selectedDepartment === 'ALL' || department === selectedDepartment)
        );
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
        return (
          fromDate.getMonth() + 1 === selectedMonth &&
          fromDate.getFullYear() === selectedYear &&
          (selectedDepartment === 'ALL' || department === selectedDepartment)
        );
      }),
    [employeeById, employeeByName, leaves, selectedDepartment, selectedMonth, selectedYear],
  );

  const filteredEmployees = useMemo(
    () =>
      employees.filter((row) => {
        const department = row.team?.department?.name ?? 'Unassigned';
        return selectedDepartment === 'ALL' || department === selectedDepartment;
      }),
    [employees, selectedDepartment],
  );

  const summary = useMemo(() => {
    const totalSalaryPaid = filteredPayroll
      .filter((row) => row.status === 'PAID')
      .reduce((sum, row) => sum + row.netSalary, 0);
    return {
      totalEmployees: filteredEmployees.length,
      employeesOnLeave: filteredEmployees.filter((row) => row.onLeaveToday).length,
      totalSalaryPaid: formatCurrencyINR(totalSalaryPaid),
      pendingRequests: filteredLeaves.filter((row) => row.status === 'PENDING').length,
      newJoiners: filteredEmployees.filter((row) => {
        if (!row.joiningDate) return false;
        const joined = new Date(row.joiningDate);
        return joined.getMonth() + 1 === selectedMonth && joined.getFullYear() === selectedYear;
      }).length,
    };
  }, [filteredEmployees, filteredLeaves, filteredPayroll, selectedMonth, selectedYear]);

  const exportPayroll = () => {
    const rows = [
      ['Employee', 'Department', 'Month', 'Net Salary', 'Status', 'LOP Days', 'Deductions'],
      ...filteredPayroll.map((row) => {
        const employee = employeeById.get(row.userId);
        return [
          formatPersonName(row.employeeName) || 'Employee',
          employee?.team?.department?.name ?? 'Unassigned',
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
        formatPersonName(row.user?.name) || formatPersonName(employeeById.get(row.userId ?? -1)?.name) || 'Employee',
        row.type,
        row.startDate ?? '-',
        row.endDate ?? '-',
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

  return {
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
  };
}
