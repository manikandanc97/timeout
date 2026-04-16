'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const s = String(iso).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}

type Props = {
  employee: OrganizationEmployee;
  departments: OrgDepartment[];
  onSaved?: () => void;
  compact?: boolean;
};

export default function EditEmployeeForm({
  employee,
  departments,
  onSaved,
  compact = false,
}: Props) {
  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [status, setStatus] = useState<'ACTIVE' | 'DEACTIVATED'>('ACTIVE');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [reportingManagerOptions, setReportingManagerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [birthDate, setBirthDate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const deptId = employee.team?.department?.id;
    const tmId = employee.team?.id;
    setDepartmentId(deptId != null ? String(deptId) : '');
    setTeamId(tmId != null ? String(tmId) : '');
    setName(employee.name);
    setDesignation(employee.designation ?? '');
    setEmail(employee.email);
    setGender(employee.gender ?? '');
    setRole(employee.role === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE');
    setStatus(employee.isActive === false ? 'DEACTIVATED' : 'ACTIVE');
    setBirthDate(isoToDateInput(employee.birthDate));
    setJoiningDate(
      isoToDateInput(employee.joiningDate) ||
        isoToDateInput(employee.createdAt),
    );
    setReportingManagerId(
      employee.reportingManager ? String(employee.reportingManager.id) : '',
    );
    setPassword('');
    setPasswordConfirm('');
  }, [employee]);

  useEffect(() => {
    let cancelled = false;
    async function loadRm() {
      try {
        const { data } = await api.get<{
          options: { id: number; name: string }[];
        }>(
          `/organization/reporting-manager-options?exclude=${employee.id}`,
        );
        if (cancelled) return;
        let opts = (data.options ?? []).map((o) => ({
          label: o.name,
          value: String(o.id),
        }));
        const cur = employee.reportingManager;
        if (cur && !opts.some((o) => o.value === String(cur.id))) {
          opts = [{ label: cur.name, value: String(cur.id) }, ...opts];
        }
        setReportingManagerOptions(opts);
      } catch {
        if (!cancelled) setReportingManagerOptions([]);
      }
    }
    void loadRm();
    return () => {
      cancelled = true;
    };
  }, [employee.id, employee.reportingManager?.id, employee.reportingManager?.name]);

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        label: d.name,
        value: String(d.id),
      })),
    [departments],
  );

  const teamOptions = useMemo(() => {
    const dept = departments.find((d) => String(d.id) === departmentId);
    if (!dept) return [];
    return dept.teams.map((t) => ({ label: t.name, value: String(t.id) }));
  }, [departments, departmentId]);

  useEffect(() => {
    if (teamOptions.length === 0) return;
    if (!teamOptions.some((o) => o.value === teamId)) {
      setTeamId('');
    }
  }, [teamOptions, teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !name.trim() || !designation.trim() || !email.trim()) {
      toast.error('Fill in name, designation, email, and team');
      return;
    }
    const pwd = password.trim();
    const pwdC = passwordConfirm.trim();
    if (pwd || pwdC) {
      if (!pwd || !pwdC || pwd !== pwdC) {
        toast.error('New password and confirmation must match');
        return;
      }
    }
    if (gender !== 'MALE' && gender !== 'FEMALE') {
      toast.error('Select a gender');
      return;
    }
    if (!joiningDate.trim()) {
      toast.error('Joining date (DOJ) is required');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        designation: designation.trim(),
        email: email.trim().toLowerCase(),
        teamId: Number(teamId),
        gender,
        role,
        status,
        birthDate: birthDate.trim() || null,
        joiningDate: joiningDate.trim(),
        reportingManagerId:
          reportingManagerId.trim() === ''
            ? null
            : Number(reportingManagerId),
      };
      if (pwd) body.password = pwd;

      await api.patch(`/organization/employees/${employee.id}`, body);
      toast.success('Employee updated');
      onSaved?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Could not update employee';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const gridClass = compact
    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
    : 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2';

  return (
    <form onSubmit={handleSubmit} className={gridClass}>
      <Select
        id={`edit-emp-dept-${employee.id}`}
        label='Department'
        placeholder='Select department'
        value={departmentId}
        options={departmentOptions}
        onChange={(e) => {
          setDepartmentId(e.target.value);
          setTeamId('');
        }}
      />
      <Select
        id={`edit-emp-team-${employee.id}`}
        label='Team'
        placeholder='Select team'
        value={teamId}
        options={teamOptions}
        onChange={(e) => setTeamId(e.target.value)}
      />
      <Input
        id={`edit-emp-name-${employee.id}`}
        type='text'
        label='Full name'
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        id={`edit-emp-designation-${employee.id}`}
        type='text'
        label='Designation'
        value={designation}
        required
        onChange={(e) => setDesignation(e.target.value)}
      />
      <Input
        id={`edit-emp-email-${employee.id}`}
        type='email'
        label='Work email'
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id={`edit-emp-password-${employee.id}`}
        type='password'
        label='New password (optional)'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        id={`edit-emp-password-confirm-${employee.id}`}
        type='password'
        label='Confirm new password'
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />
      <Select
        id={`edit-emp-gender-${employee.id}`}
        label='Gender'
        placeholder='Select gender'
        value={gender}
        options={[
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
        ]}
        onChange={(e) => setGender(e.target.value)}
      />
      <Select
        id={`edit-emp-role-${employee.id}`}
        label='Role'
        placeholder='Select role'
        value={role}
        options={[
          { label: 'Employee', value: 'EMPLOYEE' },
          { label: 'Manager', value: 'MANAGER' },
        ]}
        onChange={(e) =>
          setRole(e.target.value === 'MANAGER' ? 'MANAGER' : 'EMPLOYEE')
        }
      />
      <Select
        id={`edit-emp-status-${employee.id}`}
        label='Status'
        value={status}
        options={[
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Deactivated', value: 'DEACTIVATED' },
        ]}
        onChange={(e) =>
          setStatus(
            e.target.value === 'DEACTIVATED' ? 'DEACTIVATED' : 'ACTIVE',
          )
        }
      />
      <Select
        id={`edit-emp-reporting-manager-${employee.id}`}
        label='Reporting manager (optional)'
        placeholder='None'
        value={reportingManagerId}
        options={reportingManagerOptions}
        onChange={(e) => setReportingManagerId(e.target.value)}
      />
      <Input
        id={`edit-emp-joiningdate-${employee.id}`}
        type='date'
        label='Joining date (DOJ)'
        value={joiningDate}
        required
        onChange={(e) => setJoiningDate(e.target.value)}
      />
      <Input
        id={`edit-emp-birthdate-${employee.id}`}
        type='date'
        label='Date of birth (optional)'
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
      />
      <div className='sm:col-span-2'>
        <Button
          type='submit'
          disabled={
            submitting ||
            !departmentId ||
            !teamId ||
            !gender ||
            !joiningDate.trim()
          }
          className='w-full sm:w-auto'
        >
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
