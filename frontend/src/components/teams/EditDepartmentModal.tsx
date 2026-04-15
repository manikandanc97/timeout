'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  department: OrgDepartment | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditDepartmentModal({
  open,
  department,
  onClose,
  onSaved,
}: Props) {
  const titleId = useId();
  const [name, setName] = useState('');
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
    if (!open || !department) return;
    setName(department.name);
    setSubmitting(false);
  }, [open, department]);

  if (!open || !department) return null;

  const editing = department;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Enter a department name');
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/organization/departments/${editing.id}`, {
        name: trimmed,
      });
      toast.success('Department updated');
      onSaved();
      onClose();
    } catch (error) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosLike.response?.data?.message ?? 'Could not update department',
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
              Edit department
            </h2>
            <p className='mt-1 text-muted-foreground text-sm'>
              Renaming updates this label everywhere teams and employees use it.
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
            id='edit-dept-name'
            type='text'
            label='Department name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Engineering'
            required
          />
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={submitting} className='rounded-xl px-5'>
              {submitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
