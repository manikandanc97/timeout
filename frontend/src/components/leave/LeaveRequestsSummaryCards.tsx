import type { LeaveRequestsSummary } from '@/components/leave/leaveRequestsPageUtils';
import {
  CheckCircle2,
  Clock3,
  ListChecks,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

type CardDef = {
  key: keyof LeaveRequestsSummary;
  label: string;
  accent: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
};

const SUMMARY_CARDS: CardDef[] = [
  {
    key: 'pending',
    label: 'Pending',
    accent: 'border-l-amber-400',
    iconBg: 'bg-muted',
    iconColor: 'text-amber-600',
    Icon: Clock3,
  },
  {
    key: 'approved',
    label: 'Approved',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-muted',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  {
    key: 'rejected',
    label: 'Rejected',
    accent: 'border-l-rose-400',
    iconBg: 'bg-muted',
    iconColor: 'text-rose-600',
    Icon: XCircle,
  },
  {
    key: 'total',
    label: 'Total',
    accent: 'border-l-slate-400',
    iconBg: 'bg-muted',
    iconColor: 'text-slate-600',
    Icon: ListChecks,
  },
];

type Props = {
  summary: LeaveRequestsSummary;
};

export default function LeaveRequestsSummaryCards({ summary }: Props) {
  return (
    <section
      aria-label='Request summary'
      className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5'
    >
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = summary[c.key];
        return (
          <div
            key={c.key}
            className={`rounded-2xl border border-border border-l-4 ${c.accent} bg-card p-3 text-card-foreground shadow-sm sm:p-3.5`}
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs'>
                {c.label}
              </span>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${c.iconBg}`}
              >
                <Icon size={17} strokeWidth={2} className={c.iconColor} />
              </div>
            </div>
            <p className='mt-2 text-xl font-bold tabular-nums tracking-tight sm:mt-2.5 sm:text-2xl'>
              {value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
