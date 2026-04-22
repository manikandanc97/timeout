import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export function SettingsFormSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={`settings-field-${index}`} className='space-y-2'>
          <Skeleton className='h-3.5 w-28' />
          <Skeleton className='h-11 w-full rounded-xl' />
        </div>
      ))}
      <div className='space-y-2 sm:col-span-2'>
        <Skeleton className='h-3.5 w-24' />
        <Skeleton className='h-11 w-full rounded-xl' />
      </div>
    </div>
  );
}

export function SettingsToggleGridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {Array.from({ length: 2 }, (_, index) => (
        <div key={`settings-input-${index}`} className='space-y-2'>
          <Skeleton className='h-3.5 w-28' />
          <Skeleton className='h-11 w-full rounded-xl' />
        </div>
      ))}
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={`settings-toggle-${index}`}
          className='rounded-xl border border-border bg-muted/70 p-3'
        >
          <Skeleton className='h-4 w-36' />
          <Skeleton className='mt-2 h-3 w-48 max-w-full' />
          <div className='mt-4 flex justify-end'>
            <Skeleton className='h-6 w-12 rounded-full' />
          </div>
        </div>
      ))}
      <div className='rounded-xl border border-border bg-muted/70 p-3 sm:col-span-2'>
        <Skeleton className='h-4 w-40' />
        <Skeleton className='mt-2 h-3 w-64 max-w-full' />
        <div className='mt-4 flex justify-end'>
          <Skeleton className='h-6 w-12 rounded-full' />
        </div>
      </div>
    </div>
  );
}

export function SettingsPermissionsSkeleton() {
  return (
    <div className='overflow-x-auto rounded-xl border border-border bg-muted/40'>
      <table className='w-full min-w-[760px] border-collapse text-left text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {Array.from({ length: 5 }, (_, index) => (
              <th key={`perm-head-${index}`} className='px-4 py-3'>
                <Skeleton className='h-3 w-24' />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <tr
              key={`perm-row-${rowIndex}`}
              className='border-b border-border bg-card/95'
            >
              <td className='px-4 py-3'>
                <Skeleton className='h-4 w-20' />
              </td>
              {Array.from({ length: 4 }, (_, toggleIndex) => (
                <td
                  key={`perm-toggle-${rowIndex}-${toggleIndex}`}
                  className='px-4 py-3'
                >
                  <Skeleton className='h-6 w-12 rounded-full' />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SettingsSkeleton() {
  return (
    <section className='hrm-shell-page'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

      <div className='relative z-10 flex flex-col gap-4 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <div>
              <Skeleton className='h-2.5 w-24' />
              <Skeleton className='mt-2 h-8 w-36' />
              <Skeleton className='mt-2 h-3.5 w-72 max-w-full' />
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card/95 p-2 shadow-sm'>
          <div className='flex min-w-0 gap-2 overflow-x-auto pb-1'>
            {['w-24', 'w-28', 'w-24', 'w-30'].map((width, index) => (
              <Skeleton
                key={`settings-tab-${index}`}
                className={`h-10 shrink-0 rounded-xl ${width}`}
              />
            ))}
          </div>
        </div>

        <section className='hrm-shell-inner min-h-[420px]'>
          <div className='flex-1'>
            <SettingsFormSkeleton />
          </div>

          <div className='sticky bottom-0 mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card/95 pt-4'>
            <Skeleton className='h-10 w-34 rounded-xl' />
            <Skeleton className='h-10 w-30 rounded-xl' />
          </div>
        </section>
      </div>
    </section>
  );
}
