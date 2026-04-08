import React from 'react';
import WelcomeCard from './WelcomeCard';
import { serverFetch } from '@/services/serverApi';
import type { User } from '@/types/user';

const WelcomeCardServer = async () => {
  const user = await serverFetch<User>('/profile');

  return <WelcomeCard name={user?.name || 'User'} />;
};

export default WelcomeCardServer;
