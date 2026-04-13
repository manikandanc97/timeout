'use client';

import Button from '@/components/ui/Button';
import type { ReactNode } from 'react';
import { useEffect, useId, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isProcessing?: boolean;
  children?: ReactNode;
};

export default function ConfirmModal({
  open,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
  isProcessing = false,
  children,
}: ConfirmModalProps) {
  const titleId = useId();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 z-100 flex items-center justify-center p-4'>
      <button
        type='button'
        aria-label='Close dialog'
        disabled={isProcessing}
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity disabled:cursor-not-allowed'
        onClick={() => {
          if (!isProcessing) onCancel();
        }}
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        className='relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl'
      >
        <h2 id={titleId} className='font-bold text-gray-900 text-lg'>
          {title}
        </h2>
        <p className='mt-3 text-gray-600 text-sm leading-relaxed'>{message}</p>
        {children ? <div className='mt-4'>{children}</div> : null}

        <div className='flex flex-wrap justify-end gap-2 mt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isProcessing}
            className='min-w-[88px]'
          >
            {cancelLabel}
          </Button>
          <Button
            type='button'
            variant='danger'
            onClick={() => void onConfirm()}
            disabled={isProcessing}
            className='inline-flex min-w-[88px] items-center justify-center gap-2'
          >
            {isProcessing ? (
              <span
                className='inline-block border-2 border-white/40 border-t-white rounded-full w-4 h-4 animate-spin'
                aria-hidden
              />
            ) : null}
            <span>{confirmLabel}</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
