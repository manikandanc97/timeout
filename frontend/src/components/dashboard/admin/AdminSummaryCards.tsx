'use client';

import api from '@/services/api';
import {
  Building2,
  ClipboardList,
  type LucideIcon,
  Umbrella,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type AdminDashboardStats = {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingRequests: number;
  departments: number;
};

type StatField = keyof AdminDashboardStats;

type StatConfig = {
  field: StatField;
  title: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  iconColor: string;
};

const STAT_CARDS: StatConfig[] = [
  {
    field: 'totalEmployees',
    title: 'Total employees',
    icon: Users,
    accent: 'border-l-4 border-l-cyan-500',
    iconBg: 'border-cyan-100 bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    field: 'presentToday',
    title: 'Present today',
    icon: UserCheck,
    accent: 'border-l-4 border-l-emerald-500',
    iconBg: 'border-emerald-100 bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    field: 'onLeaveToday',
    title: 'On leave today',
    icon: Umbrella,
    accent: 'border-l-4 border-l-amber-500',
    iconBg: 'border-amber-100 bg-amber-50',
    iconColor: 'text-amber-700',
  },
  {
    field: 'pendingRequests',
    title: 'Pending requests',
    icon: ClipboardList,
    accent: 'border-l-4 border-l-blue-500',
    iconBg: 'border-blue-100 bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    field: 'departments',
    title: 'Departments',
    icon: Building2,
    accent: 'border-l-4 border-l-violet-500',
    iconBg: 'border-violet-100 bg-violet-50',
    iconColor: 'text-violet-600',
  },
];

const AdminSummaryCards = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const { data } = await api.get<AdminDashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          totalEmployees: 0,
          presentToday: 0,
          onLeaveToday: 0,
          pendingRequests: 0,
          departments: 0,
        });
      }
    }

    fetchDashboardStats();
  }, []);

  if (!stats) {
    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5'>
        {STAT_CARDS.map((card) => (
          <div
            key={card.field}
            className='h-[104px] animate-pulse rounded-2xl border border-gray-100 bg-gray-100/80'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-5'>
      {STAT_CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats[card.field];

        return (
          <div
            key={card.field}
            className={`flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-md ${card.accent}`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${card.iconBg}`}
            >
              <Icon size={22} strokeWidth={2} className={card.iconColor} />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-gray-500 text-sm leading-snug'>{card.title}</p>
              <p className='mt-1 font-bold text-3xl text-gray-900 tabular-nums tracking-tight'>
                {value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSummaryCards;
