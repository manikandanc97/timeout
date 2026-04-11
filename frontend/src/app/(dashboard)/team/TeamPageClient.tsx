'use client';

import PageCard from '@/components/ui/PageCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function TeamPageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

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
    if (!isAdmin) {
      setLoadingStructure(false);
      return;
    }

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
  }, [isAdmin]);

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

    setSubmitting(true);
    try {
      await api.post('/organization/employees', {
        name,
        email,
        password,
        teamId: Number(teamId),
        gender: gender || undefined,
        birthDate: birthDate.trim() || undefined,
      });
      toast.success('Employee added');
      setName('');
      setEmail('');
      setPassword('');
      setGender('');
      setBirthDate('');
      setTeamId('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? 'Could not add employee';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <PageCard title='Team Leaves'>
        <p className='text-gray-600 text-sm'>
          Only organization admins can manage teams and add employees here.
        </p>
      </PageCard>
    );
  }

  return (
    <div className='space-y-6'>
      <PageCard title='Departments & teams'>
        <p className='text-gray-600 text-sm'>
          Your organization uses departments and teams below. New accounts
          created from registration get this structure automatically.
        </p>
        {loadingStructure ? (
          <p className='mt-4 text-gray-500 text-sm'>Loading…</p>
        ) : (
          <ul className='mt-4 space-y-3 text-sm'>
            {departments.map((d) => (
              <li key={d.id} className='border-gray-100 border-b pb-3 last:border-0'>
                <p className='font-semibold text-gray-900'>{d.name}</p>
                <ul className='mt-1 list-inside list-disc text-gray-600'>
                  {d.teams.map((t) => (
                    <li key={t.id}>{t.name}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </PageCard>

      <PageCard title='Add employee'>
        <p className='text-gray-600 text-sm'>
          Assign the employee to a department and team. They can sign in with
          the email and password you set.
        </p>
        <form
          onSubmit={handleSubmit}
          className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'
        >
          <Select
            id='department'
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
            id='team'
            label='Team'
            placeholder='Select team'
            value={teamId}
            options={teamOptions}
            onChange={(e) => setTeamId(e.target.value)}
          />
          <Input
            id='emp-name'
            type='text'
            label='Full name'
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            id='emp-email'
            type='email'
            label='Work email'
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id='emp-password'
            type='password'
            label='Temporary password'
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select
            id='emp-gender'
            label='Gender (optional)'
            placeholder='Optional'
            value={gender}
            options={[
              { label: 'Male', value: 'MALE' },
              { label: 'Female', value: 'FEMALE' },
            ]}
            onChange={(e) => setGender(e.target.value)}
          />
          <Input
            id='emp-birthdate'
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
                loadingStructure
              }
              className='w-full sm:w-auto'
            >
              {submitting ? 'Saving…' : 'Create employee'}
            </Button>
          </div>
        </form>
      </PageCard>
    </div>
  );
}
