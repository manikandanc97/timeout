import type { LucideIcon } from 'lucide-react';
import { CalendarDays, CalendarRange, Sparkles } from 'lucide-react';

type CardKey = 'upcoming' | 'thisMonth' | 'total';

type CardDef = {
  key: CardKey;
  label: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
};

const SUMMARY_CARDS: CardDef[] = [
  {
    key: 'upcoming',
    label: 'Upcoming',
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    Icon: Sparkles,
  },
  {
    key: 'thisMonth',
    label: 'This month',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: CalendarRange,
  },
  {
    key: 'total',
    label: 'Total holidays',
    accent: 'border-l-sky-400',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    Icon: CalendarDays,
  },
];

type Props = {
  loading: boolean;
  total: number;
  upcoming: number;
  thisMonth: number;
};

function SummarySkeleton() {
  const accents = [
    'border-l-violet-400',
    'border-l-emerald-400',
    'border-l-sky-400',
  ];
  return (
    <section
      aria-label='Holiday summary'
      className='grid w-full shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5'
    >
      {accents.map((accent, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-2xl border border-gray-100 border-l-4 ${accent} bg-white p-3 shadow-sm sm:p-3.5`}
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='h-3 w-20 rounded bg-gray-200 sm:w-24' />
            <div className='h-8 w-8 shrink-0 rounded-lg bg-gray-100 sm:h-9 sm:w-9 sm:rounded-xl' />
          </div>
          <div className='mt-2 h-7 w-10 rounded bg-gray-200 sm:mt-2.5 sm:h-8' />
        </div>
      ))}
    </section>
  );
}

export default function HolidaysSummaryCards({
  loading,
  total,
  upcoming,
  thisMonth,
}: Props) {
  const values: Record<CardKey, number> = {
    upcoming,
    thisMonth,
    total,
  };

  if (loading) {
    return <SummarySkeleton />;
  }

  return (
    <section
      aria-label='Holiday summary'
      className='grid w-full shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5'
    >
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = values[c.key];
        return (
          <div
            key={c.key}
            className={`rounded-2xl border border-gray-100 border-l-4 ${c.accent} bg-white p-3 shadow-sm sm:p-3.5`}
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[11px] font-medium uppercase tracking-wider text-gray-500 sm:text-xs'>
                {c.label}
              </span>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${c.iconBg}`}
              >
                <Icon size={17} strokeWidth={2} className={c.iconColor} />
              </div>
            </div>
            <p className='mt-2 text-xl font-bold tabular-nums tracking-tight text-gray-900 sm:mt-2.5 sm:text-2xl'>
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
