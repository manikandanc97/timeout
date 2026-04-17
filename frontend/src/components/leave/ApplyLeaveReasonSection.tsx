'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import type { LeaveFormData } from '@/utils/leave/leaveSchema';
import Input from '../ui/Input';

type Props = {
  control: Control<LeaveFormData>;
  errors: FieldErrors<LeaveFormData>;
};

export default function ApplyLeaveReasonSection({ control, errors }: Props) {
  return (
    <section className='rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-5'>
      <div>
        <h3 className='text-lg font-semibold text-card-foreground'>Reason</h3>
        <p className='text-xs text-muted-foreground'>Keep it short. Your manager will see this note.</p>
      </div>

      <div className='mt-4'>
        <Controller
          name='reason'
          control={control}
          render={({ field }) => (
            <Input id='reason' label='Reason for leave' type='textarea' rows={3} required {...field} />
          )}
        />
        {errors.reason ? (
          <p className='flex items-center gap-1 mt-2 text-destructive text-xs'>
            <AlertTriangle size={11} />
            {errors.reason.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
