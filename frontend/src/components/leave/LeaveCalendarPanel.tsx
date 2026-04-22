'use client';

import { useMemo, useRef, useState } from 'react';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import { getMonthDays, isSameDay } from './leaveCalendarUtils';
import LeaveCalendarBanner from './LeaveCalendarBanner';
import LeaveCalendarMonthNav from './LeaveCalendarMonthNav';
import LeaveCalendarLegend from './LeaveCalendarLegend';
import LeaveCalendarGrid from './LeaveCalendarGrid';
type Props = {
  holidays: Holiday[];
  history: Leave[];
  /** Small uppercase label above the title (default: apply-leave copy). */
  bannerEyebrow?: string;
  /** Main headline on the gradient banner. */
  bannerTitle?: string;
  /**
   * When false (admin team calendar), only today, holidays, and weekends are
   * highlighted — no pending / approved / rejected leave shading or legend.
   */
  showLeaveDays?: boolean;
  /** Extra classes on the outer shell (e.g. `h-full min-h-0` in admin column). */
  rootClassName?: string;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  isDateDisabled?: (date: Date) => boolean;
};

const LeaveCalendarPanel = ({
  holidays = [],
  history = [],
  bannerEyebrow = 'Leave Calendar',
  bannerTitle = 'Plan around the team',
  showLeaveDays = true,
  rootClassName = '',
  selectedDate = null,
  onSelectDate,
  isDateDisabled,
}: Props) => {
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

  const { approvedDates, pendingDates, rejectedDates } = useMemo(() => {
    const empty = {
      approvedDates: [] as Date[],
      pendingDates: [] as Date[],
      rejectedDates: [] as Date[],
    };
    if (!showLeaveDays) return empty;

    const approved: Date[] = [];
    const pending: Date[] = [];
    const rejected: Date[] = [];

    history.forEach((l) => {
      const start = new Date(l.startDate ?? l.startDate);
      const end = new Date(l.endDate ?? l.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      const bucket =
        l.status === 'APPROVED'
          ? approved
          : l.status === 'PENDING'
            ? pending
            : l.status === 'REJECTED'
              ? rejected
              : null;

      if (!bucket) return;

      const cur = new Date(start);
      while (cur <= end) {
        bucket.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    });

    return {
      approvedDates: approved,
      pendingDates: pending,
      rejectedDates: rejected,
    };
  }, [history, showLeaveDays]);

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
    if (showLeaveDays) {
      if (pendingDates.some((d) => isSameDay(d, date))) return 'Pending Leave';
      if (approvedDates.some((d) => isSameDay(d, date))) return 'Approved Leave';
      if (rejectedDates.some((d) => isSameDay(d, date))) return 'Rejected Leave';
    }
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return 'Weekend';
    return '';
  };

  const getDayStyle = (date: Date) => {
    const dow = date.getDay();
    const isToday = isSameDay(date, today);
    const isHoliday = holidayDates.some((h) => isSameDay(h.date, date));
    const isApproved = approvedDates.some((d) => isSameDay(d, date));
    const isPending = pendingDates.some((d) => isSameDay(d, date));
    const isRejected = rejectedDates.some((d) => isSameDay(d, date));
    const isWeekend = dow === 0 || dow === 6;
    const isHovered = hoveredDay && isSameDay(date, hoveredDay);
    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

    if (isSelected)
      return {
        cell: 'scale-105 bg-primary font-bold text-primary-foreground shadow-md shadow-primary/30',
        dot: '',
      };

    if (isToday)
      return {
        cell: 'border border-primary/30 bg-primary/10 font-bold text-primary',
        dot: '',
      };
    if (isHoliday)
      return {
        cell: `bg-warning-muted font-semibold text-warning-muted-foreground ${isHovered ? 'opacity-90' : ''}`,
        dot: 'bg-amber-400',
      };
    if (showLeaveDays) {
      if (isRejected)
        return {
          cell: `bg-danger-muted font-semibold text-danger-muted-foreground ${isHovered ? 'opacity-90' : ''}`,
          dot: 'bg-red-400',
        };
      if (isPending)
        return {
          cell: `bg-blue-500/15 font-semibold text-blue-800 ${isHovered ? 'bg-blue-500/25' : ''}`,
          dot: 'bg-blue-400',
        };
      if (isApproved)
        return {
          cell: `bg-success-muted font-semibold text-success-muted-foreground ${isHovered ? 'opacity-90' : ''}`,
          dot: 'bg-emerald-400',
        };
    }
    if (isWeekend)
      return {
        cell: `text-muted-foreground/75 ${isHovered ? 'bg-muted' : ''}`,
        dot: '',
      };
    return {
      cell: `text-card-foreground ${isHovered ? 'bg-muted' : ''} hover:bg-muted`,
      dot: '',
    };
  };

  const handleDayMouseEnter = (date: Date, e: React.MouseEvent) => {
    const label = getLabel(date);
    setHoveredDay(date);
    if (label) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const targetRect = (
        e.currentTarget as HTMLElement
      ).getBoundingClientRect();
      setTooltip({
        text: label,
        x: targetRect.left - (containerRect?.left ?? 0) + targetRect.width / 2,
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
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-md ${rootClassName}`.trim()}
    >
      <LeaveCalendarBanner
        bannerEyebrow={bannerEyebrow}
        bannerTitle={bannerTitle}
        upcomingHoliday={upcomingHoliday}
      />

      {/* Calendar body */}
      <div className='flex min-h-0 flex-1 flex-col px-4 pt-4 pb-5'>
        <LeaveCalendarMonthNav
          viewMonth={viewMonth}
          viewYear={viewYear}
          isCurrentMonth={isCurrentMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
        />

        <LeaveCalendarGrid
          days={days}
          getDayStyle={getDayStyle}
          onDayMouseEnter={handleDayMouseEnter}
          onDayMouseLeave={handleDayMouseLeave}
          containerRef={containerRef}
          tooltip={tooltip}
          onDaySelect={onSelectDate}
          isDayDisabled={isDateDisabled}
        />

        <LeaveCalendarLegend showLeaveDays={showLeaveDays} />
      </div>
    </div>
  );
};

export default LeaveCalendarPanel;
