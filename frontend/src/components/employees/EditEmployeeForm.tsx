'use client';

import Button from '@/components/ui/Button';
import EmployeeFormFields from '@/components/employees/EmployeeFormFields';
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
  }, [employee.id, employee.reportingManager]);

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
      <EmployeeFormFields
        idPrefix={`edit-emp-${employee.id}`}
        departmentId={departmentId}
        teamId={teamId}
        name={name}
        designation={designation}
        email={email}
        password={password}
        passwordConfirm={passwordConfirm}
        gender={gender}
        role={role}
        reportingManagerId={reportingManagerId}
        joiningDate={joiningDate}
        birthDate={birthDate}
        departmentOptions={departmentOptions}
        teamOptions={teamOptions}
        reportingManagerOptions={reportingManagerOptions}
        requirePassword={false}
        onDepartmentChange={(value) => {
          setDepartmentId(value);
          setTeamId('');
        }}
        onTeamChange={setTeamId}
        onNameChange={setName}
        onDesignationChange={setDesignation}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onPasswordConfirmChange={setPasswordConfirm}
        onGenderChange={setGender}
        onRoleChange={setRole}
        onReportingManagerChange={setReportingManagerId}
        onJoiningDateChange={setJoiningDate}
        onBirthDateChange={setBirthDate}
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
