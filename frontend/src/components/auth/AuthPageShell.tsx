import React from 'react';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

/**
 * Shared layout for login and register: full-height background + centered card.
 * Keeps spacing, radius, and shadow identical across auth screens.
 */
const AuthPageShell = ({ title, subtitle, children }: AuthPageShellProps) => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-8'>
      <div className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg'>
        <div className='space-y-2 text-center'>
          <h1 className='text-3xl font-bold text-primary'>{title}</h1>
          <p className='text-sm text-gray-500'>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthPageShell;
