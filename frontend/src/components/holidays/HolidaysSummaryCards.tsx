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

  return (
    <section
      aria-label='Holiday summary'
      className='flex w-full shrink-0 flex-col gap-3.5 self-start rounded-2xl bg-white/95 sm:gap-4 lg:w-62 xl:w-56'
    >
      <h2 className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = values[c.key];
        return (
          <div
            key={c.key}
            className={`rounded-2xl border border-gray-100 border-l-4 ${c.accent} bg-white p-3.5 shadow-sm sm:p-4`}
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-xs font-medium uppercase tracking-wider text-gray-500'>
                {c.label}
              </span>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}
              >
                <Icon size={17} strokeWidth={2} className={c.iconColor} />
              </div>
            </div>
            <p className='mt-2.5 text-2xl font-bold tabular-nums tracking-tight text-gray-900 sm:text-3xl'>
              {loading ? '—' : value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
