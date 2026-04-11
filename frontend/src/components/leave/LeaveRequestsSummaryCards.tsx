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
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    Icon: Clock3,
  },
  {
    key: 'approved',
    label: 'Approved',
    accent: 'border-l-emerald-400',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  {
    key: 'rejected',
    label: 'Rejected',
    accent: 'border-l-rose-400',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    Icon: XCircle,
  },
  {
    key: 'total',
    label: 'Total',
    accent: 'border-l-slate-400',
    iconBg: 'bg-slate-50',
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
      aria-label='Leave request summary'
      className='flex w-full shrink-0 flex-col gap-3.5 self-start rounded-2xl bg-white/95 sm:gap-4 lg:w-62 xl:w-56'
    >
      <h2 className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
        Summary
      </h2>
      {SUMMARY_CARDS.map((c) => {
        const Icon = c.Icon;
        const value = summary[c.key];
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
