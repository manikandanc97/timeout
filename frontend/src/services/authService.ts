import { cache } from 'react';
import { User } from '@/types/user';
import { serverFetch } from './serverApi';

export const getCurrentUser = cache(async () => {
  return serverFetch<User>('/auth/me');
});
