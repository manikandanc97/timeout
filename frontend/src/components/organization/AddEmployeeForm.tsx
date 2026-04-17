'use client';

import Button from '@/components/ui/Button';
import EmployeeFormFields from '@/components/employees/EmployeeFormFields';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  onCreated?: () => void;
  compact?: boolean;
};

export default function AddEmployeeForm({
  onCreated,
  compact = false,
}: Props) {
  const didInitDepartmentRef = useRef(false);
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(true);

  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [reportingManagerOptions, setReportingManagerOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [birthDate, setBirthDate] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingStructure(true);
      try {
        const { data } = await api.get<{ departments: OrgDepartment[] }>(
          '/organization/structure',
        );
        if (!cancelled) setDepartments(data.departments ?? []);
      } catch {
        if (!cancelled) {
          setDepartments([]);
          toast.error('Could not load departments and teams');
        }
      } finally {
        if (!cancelled) setLoadingStructure(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Keep department/team empty when the form first receives organization data.
    if (didInitDepartmentRef.current || loadingStructure) return;
    didInitDepartmentRef.current = true;
    setDepartmentId('');
    setTeamId('');
  }, [loadingStructure]);

  useEffect(() => {
    let cancelled = false;
    async function loadRm() {
      try {
        const { data } = await api.get<{
          options: { id: number; name: string }[];
        }>('/organization/reporting-manager-options');
        if (!cancelled) {
          setReportingManagerOptions(
            (data.options ?? []).map((o) => ({
              label: o.name,
              value: String(o.id),
            })),
          );
        }
      } catch {
        if (!cancelled) setReportingManagerOptions([]);
      }
    }
    void loadRm();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!teamOptions.some((o) => o.value === teamId)) {
      setTeamId('');
    }
  }, [teamOptions, teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !name || !designation.trim() || !email || !password || !passwordConfirm) {
      toast.error(
        'Fill in name, designation, email, password, confirm password, and team',
      );
      return;
    }
    if (password !== passwordConfirm) {
      toast.error('Temporary password and confirmation do not match');
      return;
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
      await api.post('/organization/employees', {
        name,
        designation: designation.trim(),
        email,
        password,
        teamId: Number(teamId),
        gender,
        role,
        birthDate: birthDate.trim() || undefined,
        joiningDate: joiningDate.trim(),
        reportingManagerId: reportingManagerId.trim()
          ? Number(reportingManagerId)
          : undefined,
      });
      toast.success('Employee added');
      setName('');
      setEmail('');
      setDesignation('');
      setPassword('');
      setPasswordConfirm('');
      setGender('');
      setRole('EMPLOYEE');
      setReportingManagerId('');
      setBirthDate('');
      setJoiningDate('');
      setTeamId('');
      onCreated?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Could not add employee';
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
        idPrefix='add-emp'
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
        requirePassword
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
      <div className='sm:col-span-2'>
        <Button
          type='submit'
          disabled={
            submitting ||
            !departmentId ||
            !teamId ||
            !gender ||
            !joiningDate.trim() ||
            loadingStructure
          }
          className='w-full sm:w-auto'
        >
          {submitting ? 'Saving…' : 'Create employee'}
        </Button>
      </div>
    </form>
  );
}
