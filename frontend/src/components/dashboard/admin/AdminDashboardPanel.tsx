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
      className={`flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${accentClass}`}
    >
      {/* Panel Header */}
      <div className='flex justify-between items-center px-5 py-4 border-gray-50 border-b'>
        <div className='flex items-center gap-3'>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconTileClass}`}
          >
            <Icon size={18} strokeWidth={2} className={iconClass} aria-hidden />
          </div>
          <div>
            <h2 className='font-semibold text-gray-900 text-sm'>{title}</h2>
            {subtitle && (
              <p className='font-medium text-[11px] text-gray-400 uppercase tracking-wide'>
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
    <div className='flex flex-col justify-center items-center bg-gray-50/70 px-6 py-10 rounded-xl text-center'>
      <div className='flex justify-center items-center bg-white mb-3 rounded-xl ring-1 ring-gray-100 w-10 h-10'>
        <Icon
          size={18}
          strokeWidth={1.5}
          className='text-gray-300'
          aria-hidden
        />
      </div>
      <p className='max-w-xs text-gray-400 text-sm leading-relaxed'>
        {message}
      </p>
    </div>
  );
}
