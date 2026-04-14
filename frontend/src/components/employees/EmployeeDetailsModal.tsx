'use client';

import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type TabId = 'LEAVE' | 'PAYROLL';

type SalaryStructureDto = {
  id: number;
  basicSalary: number;
  hra: number;
  allowance: number;
  bonus: number;
  pf: number;
  tax: number;
  professionalTax: number;
  effectiveFrom: string;
  isActive: boolean;
};

type EmployeeDetailsResponse = {
  employee: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    department: string | null;
    team: string | null;
  };
  leave: { pending: number; approved: number; rejected: number };
  leaveDaySummary?: {
    workedDays: number;
    appliedLeaveDays: number;
    approvedLeaveDays: number;
    pendingLeaveDays: number;
    rejectedLeaveDays: number;
    month: number;
    year: number;
  };
  salaryStructures: SalaryStructureDto[];
  documents: unknown[];
};

type Props = {
  open: boolean;
  employee: OrganizationEmployee | null;
  onClose: () => void;
  onSaved?: () => void;
};

type SalaryForm = {
  basicSalary: string;
  hra: string;
  allowance: string;
  bonus: string;
  pf: string;
  tax: string;
  professionalTax: string;
  effectiveFrom: string; // YYYY-MM
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'LEAVE', label: 'Leave' },
  { id: 'PAYROLL', label: 'Payroll' },
];

const emptySalaryForm: SalaryForm = {
  basicSalary: '',
  hra: '',
  allowance: '',
  bonus: '',
  pf: '',
  tax: '',
  professionalTax: '',
  effectiveFrom: new Date().toISOString().slice(0, 7),
};

const monthInputFromIsoDate = (isoLike: string) => String(isoLike).slice(0, 7);

const monthEndDateFromMonthInput = (monthInput: string) => {
  const [yearRaw, monthRaw] = monthInput.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return new Date(year, month, 0);
};

export default function EmployeeDetailsModal({
  open,
  employee,
  onClose,
  onSaved,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<TabId>('PAYROLL');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<EmployeeDetailsResponse | null>(null);
  const [salaryForm, setSalaryForm] = useState<SalaryForm>(emptySalaryForm);

  const leaveMonthLabel = useMemo(() => {
    const month = data?.leaveDaySummary?.month;
    const year = data?.leaveDaySummary?.year;
    if (!month || !year) return null;
    return new Date(year, month - 1, 1).toLocaleString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  }, [data?.leaveDaySummary?.month, data?.leaveDaySummary?.year]);

  const activeSalary = useMemo(
    () => data?.salaryStructures.find((row) => row.isActive) ?? null,
    [data],
  );

  useEffect(() => {
    if (!open || !employee) return;
    setActiveTab('PAYROLL');
    setLoading(true);
    setData(null);
    void api
      .get<EmployeeDetailsResponse>(`/organization/employees/${employee.id}/details`)
      .then((res) => {
        setData(res.data);
        const current = res.data.salaryStructures.find((row) => row.isActive);
        if (!current) {
          setSalaryForm({
            ...emptySalaryForm,
            effectiveFrom: new Date().toISOString().slice(0, 7),
          });
          return;
        }
        setSalaryForm({
          basicSalary: String(current.basicSalary ?? 0),
          hra: String(current.hra ?? 0),
          allowance: String(current.allowance ?? 0),
          bonus: String(current.bonus ?? 0),
          pf: String(current.pf ?? 0),
          tax: String(current.tax ?? 0),
          professionalTax: String(current.professionalTax ?? 0),
          effectiveFrom: monthInputFromIsoDate(String(current.effectiveFrom)),
        });
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? 'Failed to load employee details';
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [open, employee]);

  if (!open || !employee) return null;

  const formNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const computedNetSalary =
    formNumber(salaryForm.basicSalary) +
    formNumber(salaryForm.hra) +
    formNumber(salaryForm.allowance) +
    formNumber(salaryForm.bonus) -
    formNumber(salaryForm.pf) -
    formNumber(salaryForm.tax) -
    formNumber(salaryForm.professionalTax);
  const payoutDate = monthEndDateFromMonthInput(salaryForm.effectiveFrom);

  const saveSalary = async () => {
    if (!employee || !isAdmin) return;
    if (!salaryForm.basicSalary.trim()) {
      toast.error('Basic salary is required');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/organization/employees/${employee.id}/salary-structure`, {
        basicSalary: formNumber(salaryForm.basicSalary),
        hra: formNumber(salaryForm.hra),
        allowance: formNumber(salaryForm.allowance),
        bonus: formNumber(salaryForm.bonus),
        pf: formNumber(salaryForm.pf),
        tax: formNumber(salaryForm.tax),
        professionalTax: formNumber(salaryForm.professionalTax),
        effectiveFrom:
          payoutDate != null ? payoutDate.toISOString().slice(0, 10) : undefined,
      });
      toast.success('Salary structure updated');
      if (onSaved) onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Failed to update salary';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close employee details'
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <section className='relative z-10 w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-xl'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Employee Details</h2>
            <p className='text-sm text-gray-500'>{employee.name}</p>
          </div>
          <Button type='button' variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>

        <div className='mt-4 flex gap-2 border-b border-gray-100 pb-3'>
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              type='button'
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              className='rounded-full! px-3! py-1.5! text-xs!'
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className='py-10 text-center text-sm text-gray-500'>Loading details...</div>
        ) : activeTab === 'LEAVE' ? (
          <div className='mt-4 space-y-3'>
            {leaveMonthLabel ? (
              <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                Monthly summary - {leaveMonthLabel}
              </p>
            ) : null}
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <div className='rounded-lg border border-sky-100 bg-sky-50 p-3 text-center'>
                <p className='text-xs uppercase text-sky-700'>Worked Days</p>
                <p className='mt-1 text-lg font-bold text-sky-900'>
                  {data?.leaveDaySummary?.workedDays ?? 0}
                </p>
              </div>
              <div className='rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-center'>
                <p className='text-xs uppercase text-indigo-700'>Leave Days</p>
                <p className='mt-1 text-lg font-bold text-indigo-900'>
                  {data?.leaveDaySummary?.appliedLeaveDays ?? 0}
                </p>
              </div>
              <div className='rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-center'>
                <p className='text-xs uppercase text-emerald-700'>Approved Days</p>
                <p className='mt-1 text-lg font-bold text-emerald-900'>
                  {data?.leaveDaySummary?.approvedLeaveDays ?? 0}
                </p>
              </div>
              <div className='rounded-lg border border-amber-100 bg-amber-50 p-3 text-center'>
                <p className='text-xs uppercase text-amber-700'>Pending Days</p>
                <p className='mt-1 text-lg font-bold text-amber-900'>
                  {data?.leaveDaySummary?.pendingLeaveDays ?? 0}
                </p>
              </div>
            </div>

            <div className='rounded-lg border border-gray-200 bg-gray-50 p-3'>
              <p className='text-xs font-medium uppercase tracking-wide text-gray-500'>
                Overall Requests
              </p>
              <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                <span className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700'>
                  Pending: {data?.leave.pending ?? 0}
                </span>
                <span className='rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700'>
                  Approved: {data?.leave.approved ?? 0}
                </span>
                <span className='rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-700'>
                  Rejected: {data?.leave.rejected ?? 0}
                </span>
              </div>
            </div>
          </div>
        ) : activeTab === 'PAYROLL' ? (
          <div className='mt-4 space-y-3'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
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
                    value={salaryForm[key]}
                    disabled={!isAdmin}
                    onChange={(e) =>
                      setSalaryForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary'
                  />
                </label>
              ))}
              <label className='text-sm'>
                <span className='mb-1 block text-xs uppercase text-gray-500'>Salary Month</span>
                <input
                  type='month'
                  value={salaryForm.effectiveFrom}
                  disabled={!isAdmin}
                  onChange={(e) =>
                    setSalaryForm((prev) => ({ ...prev, effectiveFrom: e.target.value }))
                  }
                  className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary'
                />
                {payoutDate ? (
                  <p className='mt-1 text-xs text-gray-500'>
                    Salary payout date: {payoutDate.toLocaleDateString('en-GB')}
                  </p>
                ) : null}
              </label>
              <div className='rounded-lg bg-indigo-50 p-3'>
                <p className='text-xs uppercase text-indigo-700'>Net Salary</p>
                <p className='mt-1 text-lg font-bold text-indigo-900'>
                  Rs. {computedNetSalary.toLocaleString('en-IN')}
                </p>
                {activeSalary ? (
                  <p className='mt-1 text-xs text-indigo-700'>
                    Active from {activeSalary.effectiveFrom.slice(0, 10)}
                  </p>
                ) : null}
              </div>
            </div>
            {isAdmin ? (
              <div className='flex justify-end'>
                <Button type='button' onClick={() => void saveSalary()} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Payroll'}
                </Button>
              </div>
            ) : (
              <p className='text-xs text-gray-500'>
                Only admin can edit salary structure in payroll tab.
              </p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
