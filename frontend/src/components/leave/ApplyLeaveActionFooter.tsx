'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';

type Props = {
  isSubmitting: boolean;
  isOverdrawn: boolean;
  canSubmitLeave: boolean;
  onReset: () => void;
};

export default function ApplyLeaveActionFooter({
  isSubmitting,
  isOverdrawn,
  canSubmitLeave,
  onReset,
}: Props) {
  return (
    <section className='flex flex-col gap-4 rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:p-5'>
      <div className='flex flex-1 flex-col gap-1 text-xs text-muted-foreground'>
        <div className='flex items-center gap-2'>
          <AlertTriangle size={12} className='text-amber-500' />
          <span>Requests route to your manager for approval.</span>
        </div>
        <div className='flex items-center gap-2'>
          <ShieldCheck size={12} className='text-primary' />
          <span>Typical review time: 1-2 business days.</span>
        </div>
      </div>

      <div className='flex items-center gap-3 md:ml-auto'>
        <Button
          type='button'
          variant='outline'
          onClick={onReset}
          className='inline-flex justify-center items-center shadow-none px-5 md:px-6 py-3 font-semibold text-sm'
        >
          Reset
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting || isOverdrawn || !canSubmitLeave}
          className='shadow-md shadow-primary/20 px-6 md:px-8 py-3 font-semibold text-sm'
        >
          {isSubmitting ? (
            <span className='flex items-center gap-2'>
              <span className='inline-block border-2 border-white/50 border-t-white rounded-full w-4 h-4 animate-spin' />
              Submitting...
            </span>
          ) : (
            'Submit request'
          )}
        </Button>
      </div>
    </section>
  );
}
