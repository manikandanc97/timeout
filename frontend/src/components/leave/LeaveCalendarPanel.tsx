'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Sun,
} from 'lucide-react';

type Props = {
  holidays: any[];
  history: any[];
};

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }
  // pad to full rows
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

const LeaveCalendarPanel = ({ holidays = [], history = [] }: Props) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };
  const goToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const holidayDates = useMemo(
    () => holidays.map((h) => ({ date: new Date(h.date), name: h.name })),
    [holidays],
  );

  const approvedDates = useMemo(() => {
    const set: Date[] = [];
    history
      .filter((l) => l.status === 'APPROVED')
      .forEach((l) => {
        const start = new Date(l.startDate ?? l.fromDate);
        const end = new Date(l.endDate ?? l.toDate);
        const cur = new Date(start);
        while (cur <= end) {
          set.push(new Date(cur));
          cur.setDate(cur.getDate() + 1);
        }
      });
    return set;
  }, [history]);

  const upcomingHoliday = useMemo(() => {
    const todayTs = today.getTime();
    return (
      holidayDates
        .filter((h) => h.date.getTime() >= todayTs)
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null
    );
  }, [holidayDates, today]);

  const days = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const getLabel = (date: Date) => {
    if (isSameDay(date, today)) return 'Today';
    if (holidayDates.some((h) => isSameDay(h.date, date))) {
      const h = holidayDates.find((h) => isSameDay(h.date, date));
      return h?.name ?? 'Holiday';
    }
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return 'Weekend';
    if (approvedDates.some((d) => isSameDay(d, date))) return 'Approved Leave';
    return '';
  };

  const getDayStyle = (date: Date) => {
    const dow = date.getDay();
    const isToday = isSameDay(date, today);
    const isHoliday = holidayDates.some((h) => isSameDay(h.date, date));
    const isApproved = approvedDates.some((d) => isSameDay(d, date));
    const isWeekend = dow === 0 || dow === 6;
    const isHovered = hoveredDay && isSameDay(date, hoveredDay);

    if (isToday)
      return {
        cell: 'bg-primary text-white font-bold shadow-md shadow-primary/30 scale-105',
        dot: '',
      };
    if (isHoliday)
      return {
        cell: `bg-amber-100 text-amber-700 font-semibold ${isHovered ? 'bg-amber-200' : ''}`,
        dot: 'bg-amber-400',
      };
    if (isApproved)
      return {
        cell: `bg-emerald-100 text-emerald-700 font-semibold ${isHovered ? 'bg-emerald-200' : ''}`,
        dot: 'bg-emerald-400',
      };
    if (isWeekend)
      return {
        cell: `text-gray-300 ${isHovered ? 'bg-gray-100' : ''}`,
        dot: '',
      };
    return {
      cell: `text-gray-700 ${isHovered ? 'bg-gray-100' : ''} hover:bg-gray-100`,
      dot: '',
    };
  };

  const handleDayMouseEnter = (date: Date, e: React.MouseEvent) => {
    const label = getLabel(date);
    setHoveredDay(date);
    if (label) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltip({
        text: label,
        x:
          targetRect.left - (containerRect?.left ?? 0) + targetRect.width / 2,
        y: targetRect.top - (containerRect?.top ?? 0),
      });
    }
  };

  const handleDayMouseLeave = () => {
    setHoveredDay(null);
    setTooltip(null);
  };

  const isCurrentMonth =
    viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className='flex flex-col bg-white shadow-md rounded-2xl overflow-hidden'>
      {/* Top banner */}
      <div className='bg-gradient-to-br from-primary-dark via-primary to-[#0aafca] px-5 pt-5 pb-6'>
        <div className='flex flex-col gap-2'>
          <div>
            <div className='flex items-center gap-1.5 mb-1'>
              <CalendarDays size={13} className='text-white/70' />
              <span className='font-semibold text-[11px] text-white/70 uppercase tracking-widest'>
                Leave Calendar
              </span>
            </div>
            <h2 className='font-bold text-white text-xl leading-tight'>
              Plan around the team
            </h2>
          </div>

          {upcomingHoliday && (
            <div className='flex justify-between items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-2.5 border border-white/25 rounded-xl shrink-0'>
              <div className='flex items-center gap-1 mb-0.5'>
                <MapPin size={10} className='text-amber-300' />
                <p className='font-semibold text-[10px] text-amber-300 uppercase tracking-wide'>
                  Next Holiday
                </p>
              </div>
              <p className='font-bold text-white text-sm leading-tight'>
                {upcomingHoliday.name}
              </p>
              <p className='mt-0.5 text-[11px] text-white/60'>
                {upcomingHoliday.date.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calendar body */}
      <div className='flex flex-col flex-1 px-4 pt-4 pb-5'>
        {/* Month nav */}
        <div className='flex justify-between items-center mb-4'>
          <button
            onClick={prevMonth}
            className='flex justify-center items-center hover:bg-gray-100 rounded-lg w-8 h-8 text-gray-500 hover:text-primary transition-colors'
          >
            <ChevronLeft size={18} />
          </button>

          <div className='flex flex-col items-center'>
            <span className='font-bold text-gray-800 text-base'>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            {!isCurrentMonth && (
              <button
                onClick={goToday}
                className='flex items-center gap-1 mt-0.5 text-[11px] text-primary hover:underline'
              >
                <Sun size={10} />
                Back to today
              </button>
            )}
          </div>

          <button
            onClick={nextMonth}
            className='flex justify-center items-center hover:bg-gray-100 rounded-lg w-8 h-8 text-gray-500 hover:text-primary transition-colors'
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grid */}
        <div ref={containerRef} className='relative flex-1'>
          {/* Day headers */}
          <div className='grid grid-cols-7 mb-1'>
            {DAYS_OF_WEEK.map((d) => (
              <div
                key={d}
                className={`text-center text-[11px] font-semibold py-1 ${
                  d === 'Su' || d === 'Sa' ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className='gap-y-1 grid grid-cols-7'>
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const { cell } = getDayStyle(date);
              return (
                <div
                  key={date.toISOString()}
                  className={`relative flex items-center justify-center mx-auto w-9 h-9 rounded-xl text-sm cursor-default select-none transition-all duration-100 ${cell}`}
                  onMouseEnter={(e) => handleDayMouseEnter(date, e)}
                  onMouseLeave={handleDayMouseLeave}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className='z-50 absolute bg-gray-800 shadow-lg px-2.5 py-1.5 rounded-lg text-white text-xs whitespace-nowrap pointer-events-none'
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, calc(-100% - 6px))',
              }}
            >
              {tooltip.text}
              <div
                className='absolute bg-gray-800 w-2 h-2 rotate-45'
                style={{
                  left: '50%',
                  bottom: '-4px',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          )}
        </div>

        {/* Legend */}
        <div className='mt-4 pt-3 border-gray-100 border-t'>
          <div className='gap-x-4 gap-y-2 grid grid-cols-2'>
            {[
              { color: 'bg-primary', label: 'Today' },
              { color: 'bg-amber-400', label: 'Holiday' },
              { color: 'bg-emerald-400', label: 'Approved leave' },
              { color: 'bg-gray-200', label: 'Weekend' },
            ].map((item) => (
              <div key={item.label} className='flex items-center gap-2'>
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`}
                />
                <span className='text-gray-500 text-xs'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCalendarPanel;
