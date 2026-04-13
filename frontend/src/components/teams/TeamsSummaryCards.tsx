import type { LucideIcon } from 'lucide-react';
import { Building2, UsersRound } from 'lucide-react';

import type { TeamsDirectorySummary } from './utils';

type SummaryCardConfig = {
  key: string;
  label: string;
  field: keyof Pick<TeamsDirectorySummary, 'totalTeams' | 'totalDepartments'>;
  accent: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
};

const SUMMARY_CARDS: SummaryCardConfig[] = [
  {
    key: 'totalTeams',
    label: 'Total teams',
    field: 'totalTeams',
    accent: 'border-l-sky-400',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    Icon: UsersRound,
  },
  {
    key: 'totalDepartments',
    label: 'Total departments',
    field: 'totalDepartments',
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    Icon: Building2,
  },
];

function SummarySkeleton() {
  return (
    <section
      aria-label='Teams summary'
      className='w-full shrink-0 self-start rounded-2xl bg-white/95'
    >
      <h2 className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
        {[1, 2].map((i) => (
          <div
            key={i}
            className='animate-pulse rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 bg-white p-3 shadow-sm sm:p-3.5'
          >
            <div className='flex justify-between gap-1.5'>
              <div className='h-2.5 w-12 rounded bg-gray-200 sm:h-3 sm:w-16' />
              <div className='h-7 w-7 shrink-0 rounded-lg bg-gray-100 sm:h-8 sm:w-8' />
            </div>
            <div className='mt-2 h-6 w-8 rounded bg-gray-200 sm:mt-2.5 sm:h-7' />
          </div>
        ))}
      </div>
    </section>
  );
}

type Props = {
  loading: boolean;
  summary: TeamsDirectorySummary;
};

export default function TeamsSummaryCards({ loading, summary }: Props) {
  if (loading) {
    return <SummarySkeleton />;
  }

  return (
    <section
      aria-label='Teams summary'
      className='w-full shrink-0 self-start rounded-2xl bg-white/95'
    >
      <h2 className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
        {SUMMARY_CARDS.map((c) => {
          const Icon = c.Icon;
          const value = summary[c.field];
          return (
            <div
              key={c.key}
              className={`min-w-0 rounded-2xl border border-gray-100 border-l-4 ${c.accent} bg-white p-3 shadow-sm sm:p-3.5`}
            >
              <div className='flex items-start justify-between gap-1.5'>
                <span className='min-w-0 text-[10px] font-medium uppercase leading-snug tracking-wide text-gray-500 sm:text-xs sm:tracking-wider'>
                  {c.label}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl ${c.iconBg}`}
                >
                  <Icon size={16} strokeWidth={2} className={c.iconColor} />
                </div>
              </div>
              <p className='mt-2 text-xl font-bold tabular-nums tracking-tight text-gray-900 sm:mt-2.5 sm:text-2xl'>
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
