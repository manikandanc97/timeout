'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  onCreated?: () => void;
  compact?: boolean;
};

export default function AddEmployeeForm({
  onCreated,
  compact = false,
}: Props) {
  const [departments, setDepartments] = useState<OrgDepartment[]>([]);
  const [loadingStructure, setLoadingStructure] = useState(true);

  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
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
    if (!teamId || !name || !email || !password) {
      toast.error('Fill in name, email, password, and team');
      return;
    }
    if (gender !== 'MALE' && gender !== 'FEMALE') {
      toast.error('Select a gender');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/organization/employees', {
        name,
        email,
        password,
        teamId: Number(teamId),
        gender,
        birthDate: birthDate.trim() || undefined,
      });
      toast.success('Employee added');
      setName('');
      setEmail('');
      setPassword('');
      setGender('');
      setBirthDate('');
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
      <Select
        id='add-emp-department'
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
        id='add-emp-team'
        label='Team'
        placeholder='Select team'
        value={teamId}
        options={teamOptions}
        onChange={(e) => setTeamId(e.target.value)}
      />
      <Input
        id='add-emp-name'
        type='text'
        label='Full name'
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        id='add-emp-email'
        type='email'
        label='Work email'
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id='add-emp-password'
        type='password'
        label='Temporary password'
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <Select
        id='add-emp-gender'
        label='Gender'
        placeholder='Select gender'
        value={gender}
        options={[
          { label: 'Male', value: 'MALE' },
          { label: 'Female', value: 'FEMALE' },
        ]}
        onChange={(e) => setGender(e.target.value)}
      />
      <Input
        id='add-emp-birthdate'
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
