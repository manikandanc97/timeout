import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center'>
      <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted'>
        <Icon className='h-8 w-8 text-muted-foreground' />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-card-foreground'>{title}</h3>
      <p className='mb-6 max-w-sm text-sm text-muted-foreground'>{description}</p>
      {actionLabel && onAction && (
        <Button
          type='button'
          variant='primary'
          onClick={onAction}
          className='flex items-center gap-2 rounded-xl px-5'
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
