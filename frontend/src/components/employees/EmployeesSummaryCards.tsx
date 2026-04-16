import KpiCardGrid from '@/components/common/KpiCardGrid';
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
    iconBg: 'bg-sky-500/12 dark:bg-sky-400/18',
    iconColor: 'text-sky-700 dark:text-sky-300',
    Icon: Users,
  },
  {
    key: 'active',
    label: 'Active',
    field: 'active',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-500/12 dark:bg-emerald-400/18',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    Icon: UserCheck,
  },
  {
    key: 'onLeave',
    label: 'On leave',
    field: 'onLeave',
    accent: 'border-l-amber-400',
    iconBg: 'bg-amber-500/12 dark:bg-amber-400/18',
    iconColor: 'text-amber-800 dark:text-amber-300',
    Icon: Umbrella,
  },
  {
    key: 'deactivated',
    label: 'Deactivated',
    field: 'deactivated',
    accent: 'border-l-slate-400',
    iconBg: 'bg-muted dark:bg-slate-500/20',
    iconColor: 'text-slate-700 dark:text-slate-300',
    Icon: UserX,
  },
  {
    key: 'new',
    label: 'New joiners',
    field: 'newJoiners',
    subtitle: `Last ${NEW_JOINER_DAYS} days`,
    accent: 'border-l-violet-400',
    iconBg: 'bg-violet-500/12 dark:bg-violet-400/18',
    iconColor: 'text-violet-700 dark:text-violet-300',
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
          className='animate-pulse rounded-2xl border border-border border-l-4 border-l-border bg-card p-3 shadow-sm sm:p-3.5'
        >
          <div className='flex justify-between gap-2'>
            <div className='h-3 w-16 rounded bg-skeleton sm:w-20' />
            <div className='h-8 w-8 shrink-0 rounded-lg bg-muted sm:h-9 sm:w-9 sm:rounded-xl' />
          </div>
          <div className='mt-2 h-7 w-10 rounded bg-skeleton sm:mt-2.5 sm:h-8' />
          {i === 5 ? (
            <div className='mt-1.5 h-2.5 w-20 rounded bg-muted sm:w-24' />
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
  if (loading) return <SummarySkeleton />;

  return (
    <KpiCardGrid
      ariaLabel='Employee directory summary'
      items={SUMMARY_CARDS.map((c) => ({
        key: c.key,
        label: c.label,
        value: summary[c.field],
        accent: c.accent,
        subtitle: c.subtitle,
        Icon: c.Icon,
        iconBg: c.iconBg,
        iconColor: c.iconColor,
      }))}
    />
  );
}
