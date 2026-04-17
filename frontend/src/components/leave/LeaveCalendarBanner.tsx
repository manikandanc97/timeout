'use client';

import { CalendarDays, MapPin } from 'lucide-react';

type UpcomingHoliday = { name: string; date: Date } | null;

type Props = {
  bannerEyebrow: string;
  bannerTitle: string;
  upcomingHoliday: UpcomingHoliday;
};

export default function LeaveCalendarBanner({ bannerEyebrow, bannerTitle, upcomingHoliday }: Props) {
  return (
    <div className='shrink-0 bg-linear-to-br from-primary-dark via-primary to-accent px-5 pt-5 pb-6 text-primary-foreground'>
      <div className='flex flex-col gap-2'>
        <div>
          <div className='mb-1 flex items-center gap-1.5'>
            <CalendarDays size={13} className='text-primary-foreground/80' />
            <span className='text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/85'>{bannerEyebrow}</span>
          </div>
          <h2 className='text-xl font-bold leading-tight text-primary-foreground'>{bannerTitle}</h2>
        </div>

        {upcomingHoliday && (
          <div className='mt-1 flex shrink-0 flex-col gap-2 rounded-xl border border-primary-foreground/25 bg-card/15 px-3 py-2.5 text-primary-foreground backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-1.5'>
              <MapPin size={10} className='shrink-0 text-amber-200' aria-hidden />
              <p className='text-[10px] font-semibold uppercase tracking-wide text-amber-200'>Next holiday</p>
            </div>
            <div className='min-w-0 sm:text-right'>
              <p className='text-sm font-bold leading-tight text-primary-foreground'>{upcomingHoliday.name}</p>
              <p className='text-[11px] text-primary-foreground/85'>
                {upcomingHoliday.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
