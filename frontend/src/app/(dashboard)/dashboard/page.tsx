'use client';

import { useEffect, useState } from 'react';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import Card from '@/components/ui/Card';
import LoaderSpinner from '@/components/ui/Loader';
import api from '@/services/api';

type DashboardStats = {
  totalLeaves: number;
  pending: number;
  approved: number;
  rejected: number;
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const getTodayDate = (): string => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  const weekday = today.toLocaleDateString('en-IN', { weekday: 'long' });
  return `Today is ${weekday} (${dd}-${mm}-${yyyy})`;
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, userRes] = await Promise.all([
        api.get('/leaves/dashboard'),
        api.get('/profile'),
      ]);
      setStats(statsRes.data);
      setCurrentUser(userRes.data);
      console.log(currentUser);
    } catch (err) {
      console.error(err);
    }
  };

  if (!stats) return <LoaderSpinner />;

  return (
    <div className='space-y-6 bg-gray-100 p-6 min-h-screen'>
      <div className='gap-6 grid grid-cols-1 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <WelcomeCard name={currentUser?.name ?? 'User'} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
