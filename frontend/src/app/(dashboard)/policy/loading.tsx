import PageSkeleton from '@/components/ui/PageSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <PageSkeleton hasSubHeader={false}>
      <div className='bg-card border border-border rounded-2xl p-6 space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[95%]' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-48 mb-4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[85%]' />
        </div>
        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>
          <div className='space-y-3'>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-12 w-full rounded-xl' />
          </div>
        </div>
      </div>
    </PageSkeleton>
  );
}
