'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddDepartmentModal({
  open,
  onClose,
  onCreated,
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
    if (!open) return;
    setName('');
    setSubmitting(false);
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Enter a department name');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/organization/departments', { name: trimmed });
      toast.success('Department created');
      onCreated();
      onClose();
    } catch (error) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosLike.response?.data?.message ?? 'Could not create department',
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
        className='relative z-10 w-full max-w-md overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 pb-4'>
          <div>
            <h2 id={titleId} className='font-bold text-gray-900 text-lg'>
              Add department
            </h2>
            <p className='mt-1 text-gray-600 text-sm'>
              Departments group your teams (for example Engineering, People
              Ops). Add teams under a department next.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg px-2 py-1 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800'
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className='mt-5 space-y-4'>
          <Input
            id='add-dept-name'
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
              {submitting ? 'Creating…' : 'Create department'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
