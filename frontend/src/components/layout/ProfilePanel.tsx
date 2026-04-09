'use client';

import React from 'react';
import Button from '../ui/Button';
import api from '@/services/api';
import { clearAccessToken } from '@/lib/token';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ProfilePanel = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearAccessToken();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <Button type='button' variant='danger' onClick={handleLogout} className='w-full'>
      Logout
    </Button>
  );
};

export default ProfilePanel;
