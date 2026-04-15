'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AdminDashboardPanelProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconTileClass: string;
  iconClass: string;
  accentClass?: string;
  children: ReactNode;
  action?: ReactNode;
};

export function AdminDashboardPanel({
  title,
  subtitle,
  icon: Icon,
  iconTileClass,
  iconClass,
  accentClass = '',
  children,
  action,
}: AdminDashboardPanelProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-shadow duration-200 hover:shadow-md ${accentClass}`}
    >
      {/* Panel Header */}
      <div className='flex items-center justify-between border-b border-border px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconTileClass}`}
          >
            <Icon size={18} strokeWidth={2} className={iconClass} aria-hidden />
          </div>
          <div>
            <h2 className='text-sm font-semibold text-card-foreground'>{title}</h2>
            {subtitle && (
              <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className='shrink-0'>{action}</div>}
      </div>

      {/* Panel Body */}
      <div className='flex-1 px-5 py-4'>{children}</div>
    </div>
  );
}

type AdminDashboardEmptyProps = {
  icon: LucideIcon;
  message: string;
};

export function AdminDashboardEmpty({
  icon: Icon,
  message,
}: AdminDashboardEmptyProps) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl bg-muted/70 px-6 py-10 text-center'>
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-card ring-1 ring-border'>
        <Icon
          size={18}
          strokeWidth={1.5}
          className='text-muted-foreground'
          aria-hidden
        />
      </div>
      <p className='max-w-xs text-sm leading-relaxed text-card-foreground/85'>
        {message}
      </p>
    </div>
  );
}
