import React from 'react';
import WelcomeCard from './WelcomeCard';
import { serverFetch } from '@/services/server-api';

const WelcomeCardServer = async () => {
  const user = await serverFetch('/profile');

  return <WelcomeCard name={user?.name || 'User'} />;
};

export default WelcomeCardServer;
