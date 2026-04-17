'use client';

import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { formatPersonName } from '@/lib/personName';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import EmployeeLeaveOverview from '@/components/employees/details/EmployeeLeaveOverview';
import EmployeePayrollEditor from '@/components/employees/details/EmployeePayrollEditor';

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
    designation: string | null;
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

const formNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
      <section className='relative z-10 w-full max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl'>
        <div className='flex items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-bold text-card-foreground'>Employee Details</h2>
            <p className='text-sm text-muted-foreground'>
              {formatPersonName(employee.name) || 'Employee'}
            </p>
            {employee.designation?.trim() ? (
              <p className='text-xs font-medium text-muted-foreground'>
                {employee.designation}
              </p>
            ) : null}
          </div>
          <Button type='button' variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>

        <div className='mt-4 flex gap-2 border-b border-border pb-3'>
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
          <div className='py-10 text-center text-sm text-muted-foreground'>Loading details...</div>
        ) : activeTab === 'LEAVE' ? (
          <EmployeeLeaveOverview data={data} leaveMonthLabel={leaveMonthLabel} />
        ) : activeTab === 'PAYROLL' ? (
          <EmployeePayrollEditor
            salaryForm={salaryForm}
            isAdmin={isAdmin}
            saving={saving}
            computedNetSalary={computedNetSalary}
            payoutDate={payoutDate}
            activeSalary={activeSalary}
            onFieldChange={(field, value) =>
              setSalaryForm((prev) => ({ ...prev, [field]: value }))
            }
            onSave={() => void saveSalary()}
          />
        ) : null}
      </section>
    </div>
  );
}
