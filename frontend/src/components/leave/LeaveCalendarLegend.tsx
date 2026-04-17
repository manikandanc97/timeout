'use client';

type Props = { showLeaveDays: boolean };

export default function LeaveCalendarLegend({ showLeaveDays }: Props) {
  const items = showLeaveDays
    ? [
        { color: 'bg-primary', label: 'Today' },
        { color: 'bg-amber-400', label: 'Holiday' },
        { color: 'bg-blue-400', label: 'Pending leave' },
        { color: 'bg-emerald-400', label: 'Approved leave' },
        { color: 'bg-red-400', label: 'Rejected leave' },
        { color: 'bg-border', label: 'Weekend' },
      ]
    : [
        { color: 'bg-primary', label: 'Today' },
        { color: 'bg-amber-400', label: 'Holiday' },
        { color: 'bg-border', label: 'Weekend' },
      ];

  return (
    <div className='mt-4 border-t border-border pt-3'>
      <div
        className={
          showLeaveDays
            ? 'grid grid-cols-2 gap-x-4 gap-y-2'
            : 'flex flex-nowrap items-center justify-center gap-5 sm:gap-6'
        }
      >
        {items.map((item) => (
          <div key={item.label} className='flex shrink-0 items-center gap-2'>
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
            <span className='text-xs text-muted-foreground'>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
