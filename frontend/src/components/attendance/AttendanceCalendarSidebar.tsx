'use client';

import Button from '@/components/ui/Button';
import LeaveCalendarPanel from '@/components/leave/LeaveCalendarPanel';
import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const toDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0, 0);
};

const formatSelectedDate = (value: Date) =>
  value.toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

export default function AttendanceCalendarSidebar({
  selectedDate,
  onSelectDate,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const selected = useMemo(() => parseDateKey(selectedDate), [selectedDate]);
  const endOfToday = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999),
    [today],
  );

  return (
    <aside className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <div className='grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary'>
          <CalendarDays size={18} />
        </div>
        <div>
          <h3 className='text-base font-semibold text-card-foreground'>Attendance Calendar</h3>
          <p className='mt-1 text-sm text-muted-foreground'>
            Previous dates click panni team attendance paakalam.
          </p>
        </div>
      </div>

      <div className='mt-4'>
        <LeaveCalendarPanel
          holidays={[]}
          history={[]}
          showLeaveDays={false}
          bannerEyebrow='Attendance calendar'
          bannerTitle='Select a work day'
          rootClassName='shadow-none'
          selectedDate={selected}
          onSelectDate={(date) => onSelectDate(toDateKey(date))}
          isDateDisabled={(date) => date.getTime() > endOfToday.getTime()}
        />
      </div>

      <div className='mt-4 rounded-xl border border-border bg-muted/20 p-3'>
        <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Selected Date
        </p>
        <p className='mt-1 text-sm font-medium text-card-foreground'>
          {formatSelectedDate(selected)}
        </p>
        <Button
          type='button'
          variant='outline'
          className='mt-3 rounded-xl!'
          onClick={() => onSelectDate(toDateKey(today))}
        >
          Jump to Today
        </Button>
      </div>
    </aside>
  );
}
