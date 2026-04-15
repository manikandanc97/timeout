'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/services/api';
import type { Holiday } from '@/types/holiday';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

type Mode = 'add' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  holiday: Holiday | null;
  onClose: () => void;
  onSaved: () => void;
};

function toInputDate(iso: string): string {
  const s = String(iso).trim();
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m ? m[1] : s.slice(0, 10);
}

export default function HolidayFormModal({
  open,
  mode,
  holiday,
  onClose,
  onSaved,
}: Props) {
  const titleId = useId();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
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
    if (mode === 'edit' && holiday) {
      setName(holiday.name);
      setDate(toInputDate(holiday.date));
    } else {
      setName('');
      setDate('');
    }
  }, [open, mode, holiday]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast.error('Name and date are required');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'add') {
        await api.post('/holidays', {
          name: name.trim(),
          date,
        });
        toast.success('Holiday added');
      } else if (holiday) {
        await api.patch(`/holidays/${holiday.id}`, {
          name: name.trim(),
          date,
        });
        toast.success('Holiday updated');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : 'Could not save holiday';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
              {mode === 'add' ? 'Add holiday' : 'Edit holiday'}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {mode === 'add'
                ? 'Add a holiday (name and date).'
                : 'Update the name and date.'}
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

        <form onSubmit={(e) => void handleSubmit(e)} className='mt-5 space-y-4'>
          <Input
            id='holiday-name'
            type='text'
            label='Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Independence Day'
          />
          <Input
            id='holiday-date'
            type='date'
            label='Date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'add' ? 'Add' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
