'use client';

import api from '@/services/api';
import {
  Building2,
  type LucideIcon,
  Umbrella,
  UserCheck,
  Users,
} from 'lucide-react';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { useCallback, useEffect, useState } from 'react';

type AdminDashboardStats = {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  departments: number;
};

type StatField = keyof AdminDashboardStats;

type StatConfig = {
  field: StatField;
  title: string;
  icon: LucideIcon;
  colorScheme: {
    bg: string;
    iconBg: string;
    iconColor: string;
    accent: string;
  };
};

const STAT_CARDS: StatConfig[] = [
  {
    field: 'totalEmployees',
    title: 'Total employees',
    icon: Users,
    colorScheme: {
      bg: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-sky-600',
      accent: 'border-l-sky-400',
    },
  },
  {
    field: 'presentToday',
    title: 'Present today',
    icon: UserCheck,
    colorScheme: {
      bg: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-emerald-600',
      accent: 'border-l-emerald-400',
    },
  },
  {
    field: 'onLeaveToday',
    title: 'On leave today',
    icon: Umbrella,
    colorScheme: {
      bg: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-amber-600',
      accent: 'border-l-amber-400',
    },
  },
  {
    field: 'departments',
    title: 'Departments',
    icon: Building2,
    colorScheme: {
      bg: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-rose-500',
      accent: 'border-l-rose-400',
    },
  },
];

const KPI_SKELETON_ACCENTS = [
  'border-l-sky-200',
  'border-l-emerald-200',
  'border-l-amber-200',
  'border-l-rose-200',
] as const;

function SkeletonCard({ accentClass }: { accentClass: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border border-l-4 bg-card px-4 py-3.5 shadow-sm animate-pulse ${accentClass}`}
    >
      <div className='h-10 w-10 shrink-0 rounded-xl bg-skeleton' />
      <div className='min-w-0 flex-1 space-y-1.5'>
        <div className='h-7 w-12 rounded-md bg-skeleton' />
        <div className='h-3 max-w-44 rounded bg-skeleton/70' />
      </div>
    </div>
  );
}

const AdminSummaryCards = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async (opts?: { showSkeleton?: boolean }) => {
    const showSkeleton = opts?.showSkeleton !== false;
    if (showSkeleton) setLoading(true);
    try {
      const { data } = await api.get<AdminDashboardStats>('/dashboard/stats');
      setStats(data);
    } catch {
      setStats({
        totalEmployees: 0,
        presentToday: 0,
        onLeaveToday: 0,
        departments: 0,
      });
    } finally {
      if (showSkeleton) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboardStats({ showSkeleton: true });
  }, [fetchDashboardStats]);

  useEffect(() => {
    return subscribeDashboardRefresh('adminDashboardStats', () => {
      void fetchDashboardStats({ showSkeleton: false });
    });
  }, [fetchDashboardStats]);

  if (loading) {
    return (
      <div className='gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
        {STAT_CARDS.map((c, i) => (
          <SkeletonCard
            key={c.field}
            accentClass={KPI_SKELETON_ACCENTS[i] ?? 'border-l-border'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className='gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'>
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.field] ?? 0;
        const { colorScheme: cs } = card;

        return (
          <div
            key={card.field}
            className={`group relative overflow-hidden rounded-2xl border border-border border-l-4 ${cs.accent} ${cs.bg} px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className='pointer-events-none absolute -right-5 -top-6 h-20 w-20 rounded-full opacity-5 ring-1 ring-current' />

            <div className='relative flex items-center gap-3'>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cs.iconBg}`}
              >
                <Icon size={19} strokeWidth={2} className={cs.iconColor} />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='text-2xl font-bold tabular-nums tracking-tight text-card-foreground'>
                  {value}
                </p>
                <p className='mt-0.5 text-xs font-medium leading-snug text-muted-foreground'>
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSummaryCards;
