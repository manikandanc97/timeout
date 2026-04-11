'use client';
import { User } from '@/types/user';
import { createContext, useContext } from 'react';

type AuthContextType = {
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
});

export const AuthProvider = ({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}): React.JSX.Element => {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
