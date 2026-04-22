import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { FormSkeleton } from '@/components/common/SkeletonLoaders';

export default function SettingsSkeleton() {
  return (
    <div className='settings-page animate-pulse'>
      <style>{`
        .settings-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 10px 60px;
        }
        .settings-header { margin-bottom: 32px; }
        .settings-layout { display: flex; flex-direction: column; gap: 24px; }
      `}</style>
      
      <div className='settings-header'>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='settings-layout'>
        {/* Tabs Skeleton */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-border'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-10 w-32 rounded-xl shrink-0' />
          ))}
        </div>

        <div className='bg-card border border-border rounded-2xl p-6'>
          <div className='mb-6'>
            <Skeleton className='h-7 w-48 mb-2' />
            <Skeleton className='h-4 w-64' />
          </div>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-xl' />
              </div>
            ))}
          </div>

          <div className='mt-8 flex justify-end gap-3 border-t border-border pt-6'>
            <Skeleton className='h-10 w-40 rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  );
}
