import type { LucideIcon } from 'lucide-react';
import { Building2, Layers, UserCheck, UsersRound } from 'lucide-react';

import type { TeamsDirectorySummary } from './utils';

type SummaryCardConfig = {
  key: string;
  label: string;
  field: keyof Pick<
    TeamsDirectorySummary,
    | 'totalTeams'
    | 'totalDepartments'
    | 'activeTeams'
    | 'employeesAssigned'
  >;
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
  {
    key: 'activeTeams',
    label: 'Active teams',
    field: 'activeTeams',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: Layers,
  },
  {
    key: 'employeesAssigned',
    label: 'Employees assigned',
    field: 'employeesAssigned',
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    Icon: UserCheck,
  },
];

function SummarySkeleton() {
  return (
    <section
      aria-label='Teams summary'
      className='flex w-full shrink-0 flex-col gap-3.5 self-start rounded-2xl bg-white/95 sm:gap-4 lg:w-62 xl:w-56'
    >
      <h2 className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className='animate-pulse rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 bg-white p-3.5 shadow-sm sm:p-4'
        >
          <div className='flex justify-between gap-2'>
            <div className='h-3 w-20 rounded bg-gray-200' />
            <div className='h-9 w-9 shrink-0 rounded-xl bg-gray-100' />
          </div>
          <div className='mt-3 h-8 w-12 rounded bg-gray-200' />
        </div>
      ))}
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
      className='flex w-full shrink-0 flex-col gap-3.5 self-start rounded-2xl bg-white/95 sm:gap-4 lg:w-62 xl:w-56'
    >
      <h2 className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = summary[c.field];
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
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
