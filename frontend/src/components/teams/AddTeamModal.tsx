'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  departments: OrgDepartment[];
  onCreated: () => void;
};

export default function AddTeamModal({
  open,
  onClose,
  departments,
  onCreated,
}: Props) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setDepartmentId('');
    setSubmitting(false);
  }, [open, departments]);

  if (!open) return null;

  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: String(d.id),
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !departmentId) {
      toast.error('Enter a team name and choose a department');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/organization/teams', {
        name: trimmed,
        departmentId: Number(departmentId),
      });
      toast.success('Team created');
      onCreated();
      onClose();
    } catch (error) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosLike.response?.data?.message ?? 'Could not create team',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close dialog'
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4 border-b border-border pb-4'>
          <div>
            <h2 id={titleId} className='font-bold text-card-foreground text-lg'>
              Add team
            </h2>
            <p className='mt-1 text-muted-foreground text-sm'>
              Create a team inside a department. Assign members from the
              Employees page.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground'
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className='mt-5 space-y-4'>
          <Input
            id='add-team-name'
            type='text'
            label='Team name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Platform'
            required
          />
          <div>
            <Select
              id='add-team-dept'
              label='Department'
              placeholder='Select department'
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              options={
                deptOptions.length > 0
                  ? deptOptions
                  : [{ label: 'No departments', value: '' }]
              }
            />
            {departments.length === 0 ? (
              <p className='mt-1 text-xs text-amber-700'>
                No departments yet. Use Add department in the toolbar above,
                then create a team here.
              </p>
            ) : null}
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={submitting || departments.length === 0 || !departmentId}
              className='rounded-xl px-5'
            >
              {submitting ? 'Creating…' : 'Create team'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
