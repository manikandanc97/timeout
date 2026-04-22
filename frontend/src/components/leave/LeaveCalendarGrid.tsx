import type React from 'react';
import { DAYS_OF_WEEK } from './leaveCalendarUtils';

type Props = {
  days: Array<Date | null>;
  getDayStyle: (date: Date) => { cell: string; dot: string };
  onDayMouseEnter: (date: Date, e: React.MouseEvent) => void;
  onDayMouseLeave: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tooltip: { text: string; x: number; y: number } | null;
  onDaySelect?: (date: Date) => void;
  isDayDisabled?: (date: Date) => boolean;
};

export default function LeaveCalendarGrid({
  days,
  getDayStyle,
  onDayMouseEnter,
  onDayMouseLeave,
  containerRef,
  tooltip,
  onDaySelect,
  isDayDisabled,
}: Props) {
  return (
    <div ref={containerRef} className='relative flex-1'>
      <div className='grid grid-cols-7 mb-1'>
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className={`py-1 text-center text-[11px] font-semibold ${
              d === 'Su' || d === 'Sa' ? 'text-muted-foreground/75' : 'text-muted-foreground'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className='gap-y-1 grid grid-cols-7'>
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const { cell } = getDayStyle(date);
          const isDisabled = isDayDisabled?.(date) ?? false;
          return (
            <div
              key={date.toISOString()}
              className={`relative flex items-center justify-center mx-auto w-9 h-9 rounded-xl text-sm select-none transition-all duration-100 ${onDaySelect && !isDisabled ? 'cursor-pointer' : 'cursor-default'} ${isDisabled ? 'opacity-35' : ''} ${cell}`}
              onMouseEnter={(e) => onDayMouseEnter(date, e)}
              onMouseLeave={onDayMouseLeave}
              onClick={() => {
                if (!isDisabled) onDaySelect?.(date);
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      {tooltip && (
        <div
          className='pointer-events-none absolute z-50 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-lg'
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, calc(-100% - 6px))',
          }}
        >
          {tooltip.text}
          <div
            className='absolute h-2 w-2 rotate-45 bg-foreground'
            style={{
              left: '50%',
              bottom: '-4px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
