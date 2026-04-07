import { cache } from 'react';
import { serverFetch } from './server-api';

export const getDashboardData = cache(async () => {
  return serverFetch('/leaves/dashboard');
});
