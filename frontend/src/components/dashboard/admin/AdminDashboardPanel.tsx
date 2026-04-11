'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type AdminDashboardPanelProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconTileClass: string;
  iconClass: string;
  accentBorder: string;
  children: ReactNode;
};

/**
 * Shared shell for admin dashboard cards (matches summary stat cards:
 * rounded-2xl, border-gray-100, shadow-md, left accent).
 */
export function AdminDashboardPanel({
  title,
  subtitle,
  icon: Icon,
  iconTileClass,
  iconClass,
  accentBorder,
  children,
}: AdminDashboardPanelProps) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-md ${accentBorder}`}
    >
      <div className='flex items-start gap-3'>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconTileClass}`}
        >
          <Icon size={22} strokeWidth={2} className={iconClass} aria-hidden />
        </div>
        <div className='min-w-0 flex-1 pt-0.5'>
          <h2 className='font-semibold text-gray-900 text-lg leading-tight'>
            {title}
          </h2>
          {subtitle ? (
            <p className='mt-1 font-medium text-gray-500 text-xs uppercase tracking-wide'>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <div className='mt-4 min-h-0 flex-1'>{children}</div>
    </div>
  );
}

export function AdminDashboardEmpty({
  message,
  icon: Icon,
}: {
  message: string;
  icon: LucideIcon;
}) {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl bg-gray-50/80 px-4 py-10 text-center ring-1 ring-gray-100/80'>
      <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100'>
        <Icon size={22} strokeWidth={1.5} className='text-gray-300' aria-hidden />
      </div>
      <p className='max-w-md text-pretty text-gray-500 text-sm leading-relaxed'>
        {message}
      </p>
    </div>
  );
}
