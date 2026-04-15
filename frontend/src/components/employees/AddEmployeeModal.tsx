'use client';

import AddEmployeeForm from '@/components/organization/AddEmployeeForm';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddEmployeeModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

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
        className='relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl'
      >
        <div className='flex items-start justify-between gap-4 border-b border-border pb-4'>
          <div>
            <h2 id={titleId} className='font-bold text-card-foreground text-lg'>
              Add employee
            </h2>
            <p className='mt-1 text-muted-foreground text-sm'>
              They can sign in with the email and password you set.
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
        <AddEmployeeForm
          compact
          onCreated={() => {
            onCreated();
            onClose();
          }}
        />
      </div>
    </div>,
    document.body,
  );
}
