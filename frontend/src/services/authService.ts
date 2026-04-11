import { User } from '@/types/user';
import { serverFetch } from './serverApi';

export const getCurrentUser = async () => {
  return serverFetch<User>('/auth/me');
};
