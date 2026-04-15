import React from 'react';
import WelcomeIcon from '../../svg/WelcomeIcon';
import Link from 'next/link';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getTodayDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const WelcomeCard = ({ name }: { name: string }) => {
  return (
    <div className='relative flex h-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-border bg-linear-to-r from-primary/10 via-primary/5 to-accent/10 p-8 shadow-sm md:flex-row md:p-10'>
      <div className='relative z-10 flex max-w-md flex-col items-start gap-4'>
        <div>
          <h1 className='text-lg font-semibold text-primary'>{getGreeting()}</h1>

          <h2 className='text-3xl font-bold text-card-foreground'>{name}</h2>

          <p className='mt-1 text-sm text-muted-foreground'>{getTodayDate()}</p>
        </div>

        <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
          Manage your leaves, track your requests, and stay updated with your
          team’s availability, all in one place. Plan smart, work better
        </p>

        <Link
          href='/apply'
          className='mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary-dark'
        >
          Apply Leave
        </Link>
      </div>

      <div className='relative z-10 mt-8 flex h-48 w-48 shrink-0 items-center justify-center md:mt-0 md:h-64 md:w-64'>
        <WelcomeIcon />
      </div>
    </div>
  );
};

export default WelcomeCard;
