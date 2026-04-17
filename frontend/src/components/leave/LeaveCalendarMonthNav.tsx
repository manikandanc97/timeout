'use client';

import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Sun } from 'lucide-react';
import { MONTHS } from './leaveCalendarUtils';

type Props = {
  viewMonth: number;
  viewYear: number;
  isCurrentMonth: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function LeaveCalendarMonthNav({
  viewMonth,
  viewYear,
  isCurrentMonth,
  onPrev,
  onNext,
  onToday,
}: Props) {
  return (
    <div className='flex justify-between items-center mb-4'>
      <Button onClick={onPrev} className='flex h-8 w-8 items-center justify-center !rounded-lg !bg-transparent !p-0 !text-muted-foreground transition-colors hover:!bg-muted hover:!text-primary'>
        <ChevronLeft size={18} />
      </Button>

      <div className='flex flex-col items-center'>
        <span className='text-base font-bold text-card-foreground'>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        {!isCurrentMonth && (
          <Button
            onClick={onToday}
            className='flex items-center gap-1 !bg-transparent hover:!bg-transparent mt-0.5 !p-0 !h-auto !text-primary text-[11px] hover:underline'
          >
            <Sun size={10} />
            Back to today
          </Button>
        )}
      </div>

      <Button onClick={onNext} className='flex h-8 w-8 items-center justify-center !rounded-lg !bg-transparent !p-0 !text-muted-foreground transition-colors hover:!bg-muted hover:!text-primary'>
        <ChevronRight size={18} />
      </Button>
    </div>
  );
}
