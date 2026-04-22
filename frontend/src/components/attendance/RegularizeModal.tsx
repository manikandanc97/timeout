'use client';

import React, { useState, useId, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { requestRegularization } from '@/services/attendanceApi';

const schema = z.object({
  requestedCheckIn: z.string().optional(),
  requestedCheckOut: z.string().optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
}).refine(data => {
  if (data.requestedCheckIn && data.requestedCheckOut) {
    if (data.requestedCheckOut <= data.requestedCheckIn) {
      return false;
    }
  }
  return true;
}, {
  message: 'Check out must be after check in',
  path: ['requestedCheckOut'],
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onSuccess: () => void;
};

export default function RegularizeModal({ isOpen, onClose, date, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: '',
      requestedCheckIn: '',
      requestedCheckOut: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const buildDateTime = (timeStr?: string) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
      };

      await requestRegularization({
        date,
        reason: data.reason,
        requestedCheckIn: buildDateTime(data.requestedCheckIn),
        requestedCheckOut: buildDateTime(data.requestedCheckOut),
      });

      toast.success('Regularization request submitted');
      reset();
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close dialog'
        disabled={isSubmitting}
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity disabled:cursor-not-allowed'
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl'
      >
        <h2 id={titleId} className='text-xl font-bold'>
          Regularize Attendance
        </h2>
        <p className='text-sm text-muted-foreground mt-1'>
          Request correction for {new Date(date).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 pt-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Input
                id='req-checkin'
                type='time'
                label='Check In Time'
                {...(register('requestedCheckIn') as any)}
              />
              {errors.requestedCheckIn && (
                <p className='mt-1 text-xs text-destructive'>{errors.requestedCheckIn.message}</p>
              )}
            </div>
            
            <div>
              <Input
                id='req-checkout'
                type='time'
                label='Check Out Time'
                {...(register('requestedCheckOut') as any)}
              />
              {errors.requestedCheckOut && (
                <p className='mt-1 text-xs text-destructive'>{errors.requestedCheckOut.message}</p>
              )}
            </div>
          </div>

          <div className='space-y-2 mt-4'>
            <label htmlFor='req-reason' className='text-[13px] font-medium text-foreground/90'>
              Reason for correction <span className='text-destructive'>*</span>
            </label>
            <textarea
              id='req-reason'
              {...register('reason')}
              placeholder='Explain why you missed the punch or need correction...'
              className='flex w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-24 resize-none'
            />
            {errors.reason && (
              <p className='mt-1 text-xs text-destructive'>{errors.reason.message}</p>
            )}
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t border-border mt-6'>
            <Button type='button' variant='outline' onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
