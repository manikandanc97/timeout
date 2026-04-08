'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useMemo, useRef, useState } from 'react';
import LeaveTooltip from './LeaveTooltip';

type Props = {
  holidays: any[];
  history: any[];
};

const LeaveCalendarPanel = ({ holidays = [], history = [] }: Props) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  const calendarRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const upcomingHoliday = useMemo(() => {
    const todayTs = today.getTime();

    const sorted = holidays
      .map((item) => ({ ...item, dateObj: new Date(item.date) }))
      .filter(
        (item) =>
          !Number.isNaN(item.dateObj.getTime()) &&
          item.dateObj.getTime() >= todayTs,
      )
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    return sorted[0] ?? null;
  }, [holidays, today]);

  const modifiers = useMemo(() => {
    return {
      weekend: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
      today: (date: Date) => date.toDateString() === today.toDateString(),
      holiday: holidays.map((item) => new Date(item.date)),
      approved: history
        .filter((item) => item.status === 'APPROVED')
        .flatMap((item) => {
          const dates = [] as Date[];
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);

          while (start <= end) {
            dates.push(new Date(start));
            start.setDate(start.getDate() + 1);
          }

          return dates;
        }),
    };
  }, [holidays, history, today]);

  return (
    <div className='flex flex-col gap-5 bg-white shadow-lg p-5 sm:p-6 border border-gray-100 rounded-2xl h-full'>
      <div className='flex justify-between items-start gap-3'>
        <div className='flex-1 space-y-1'>
          <p className='font-semibold text-primary text-xs uppercase tracking-wide'>
            Leave Calendar
          </p>
          <h2 className='font-semibold text-gray-900 text-lg'>
            Plan around the team
          </h2>
        </div>

        {upcomingHoliday && (
          <div className='self-start bg-primary/5 shadow-sm px-3.5 py-2.5 border border-primary/20 rounded-xl font-semibold text-primary text-xs leading-tight'>
            <p className='text-[10px] text-primary/80 uppercase tracking-wide'>
              Next holiday
            </p>
            <p className='font-semibold text-gray-900 text-sm'>
              {upcomingHoliday.name}
            </p>
            <p className='font-normal text-[11px] text-gray-600'>
              {upcomingHoliday.dateObj.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>

      <div
        ref={calendarRef}
        className='relative flex-1 bg-gradient-to-br from-white via-[#f7fbfd] to-[#eef6ff] p-3 border border-gray-100 rounded-2xl'
      >
        <DayPicker
          className='w-full'
          showOutsideDays={false}
          fixedWeeks={false}
          styles={{
            root: { width: '100%', margin: 0 },
            months: { width: '100%', display: 'flex', justifyContent: 'center' },
            month: { width: '100%', maxWidth: 360 },
            table: { width: '100%' },
            caption: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
          }}
          modifiers={modifiers}
          modifiersClassNames={{
            weekend: 'text-gray-400',
            holiday: 'bg-amber-100 text-amber-700 font-semibold rounded-lg',
            approved:
              'bg-emerald-100 text-emerald-700 font-semibold rounded-lg',
            today: 'border border-primary text-primary font-bold rounded-lg',
          }}
          onDayMouseEnter={(date, modifiers, e) => {
            let text = '';

            if (modifiers.holiday) text = 'Holiday';
            if (modifiers.weekend) text = 'Weekend';
            if (modifiers.approved) text = 'Approved Leave';
            if (modifiers.today) text = 'Today';

            if (!text || !e) return;

            const rect = calendarRef.current?.getBoundingClientRect();
            const offsetX = rect ? e.clientX - rect.left : e.clientX;
            const offsetY = rect ? e.clientY - rect.top : e.clientY;

            setTooltip({
              visible: true,
              text,
              x: offsetX + 10,
              y: offsetY + 10,
            });
          }}
          onDayMouseLeave={() =>
            setTooltip((prev) => ({
              ...prev,
              visible: false,
            }))
          }
        />

        <LeaveTooltip {...tooltip} />
      </div>
      <div className='gap-3 grid grid-cols-2 sm:grid-cols-4 text-gray-600 text-xs'>
        <div className='flex items-center gap-2'>
          <span className='bg-primary rounded-full w-3 h-3' />
          <span>Today</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='bg-amber-300 rounded-full w-3 h-3' />
          <span>Holiday</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='bg-emerald-400 rounded-full w-3 h-3' />
          <span>Approved leave</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='bg-gray-300 rounded-full w-3 h-3' />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarPanel;
