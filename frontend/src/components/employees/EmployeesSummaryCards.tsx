import type { LucideIcon } from 'lucide-react';
import { CalendarPlus, UserCheck, UserX, Users, Umbrella } from 'lucide-react';

import { NEW_JOINER_DAYS } from './constants';
import type { EmployeeDirectorySummary } from './utils';

type SummaryCardConfig = {
  key: string;
  label: string;
  field: keyof Pick<
    EmployeeDirectorySummary,
    'total' | 'active' | 'onLeave' | 'deactivated' | 'newJoiners'
  >;
  accent: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  subtitle?: string;
};

const SUMMARY_CARDS: SummaryCardConfig[] = [
  {
    key: 'total',
    label: 'Total employees',
    field: 'total',
    accent: 'border-l-sky-400',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    Icon: Users,
  },
  {
    key: 'active',
    label: 'Active',
    field: 'active',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: UserCheck,
  },
  {
    key: 'onLeave',
    label: 'On leave',
    field: 'onLeave',
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    Icon: Umbrella,
  },
  {
    key: 'deactivated',
    label: 'Deactivated',
    field: 'deactivated',
    accent: 'border-l-slate-400',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    Icon: UserX,
  },
  {
    key: 'new',
    label: 'New joiners',
    field: 'newJoiners',
    subtitle: `Last ${NEW_JOINER_DAYS} days`,
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    Icon: CalendarPlus,
  },
];

function SummarySkeleton() {
  return (
    <section
      aria-label='Employee directory summary'
      className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className='animate-pulse rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 bg-white p-3 shadow-sm sm:p-3.5'
        >
          <div className='flex justify-between gap-2'>
            <div className='h-3 w-16 rounded bg-gray-200 sm:w-20' />
            <div className='h-8 w-8 shrink-0 rounded-lg bg-gray-100 sm:h-9 sm:w-9 sm:rounded-xl' />
          </div>
          <div className='mt-2 h-7 w-10 rounded bg-gray-200 sm:mt-2.5 sm:h-8' />
          {i === 5 ? (
            <div className='mt-1.5 h-2.5 w-20 rounded bg-gray-100 sm:w-24' />
          ) : null}
        </div>
      ))}
    </section>
  );
}

type Props = {
  loading: boolean;
  summary: EmployeeDirectorySummary;
};

export default function EmployeesSummaryCards({ loading, summary }: Props) {
  if (loading) {
    return <SummarySkeleton />;
  }

  return (
    <section
      aria-label='Employee directory summary'
      className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'
    >
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = summary[c.field];
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
            {c.subtitle ? (
              <p className='mt-1 text-[10px] text-gray-400 sm:text-[11px]'>
                {c.subtitle}
              </p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
