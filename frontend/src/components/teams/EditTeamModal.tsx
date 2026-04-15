'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import type { OrganizationTeamRow } from '@/types/organizationTeam';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  team: OrganizationTeamRow | null;
  onClose: () => void;
  departments: OrgDepartment[];
  onSaved: () => void;
};

export default function EditTeamModal({
  open,
  team,
  onClose,
  departments,
  onSaved,
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
    if (!open || !team) return;
    setName(team.name);
    setDepartmentId(String(team.departmentId));
    setSubmitting(false);
  }, [open, team]);

  if (!open || !team) return null;

  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: String(d.id),
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const editingTeam = team;
    if (!editingTeam) return;
    const trimmed = name.trim();
    if (!trimmed || !departmentId) {
      toast.error('Enter a team name and choose a department');
      return;
    }
    const nextDeptId = Number(departmentId);
    const unchanged =
      trimmed === editingTeam.name && nextDeptId === editingTeam.departmentId;
    if (unchanged) {
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/organization/teams/${editingTeam.id}`, {
        name: trimmed,
        departmentId: nextDeptId,
      });
      toast.success('Team updated');
      onSaved();
      onClose();
    } catch (error) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosLike.response?.data?.message ?? 'Could not update team',
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
            <h2 id={titleId} className='text-lg font-bold text-card-foreground'>
              Edit team
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Rename the team or move it to another department.
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
            id='edit-team-name'
            type='text'
            label='Team name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Platform'
            required
          />
          <div>
            <Select
              id='edit-team-dept'
              label='Department'
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
                No departments available. Add a department first.
              </p>
            ) : null}
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={submitting || departments.length === 0}
              className='rounded-xl px-5'
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
