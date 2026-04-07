import React from 'react';
import Button from '../../ui/Button';
import WelcomeIcon from '../../svg/WelcomeIcon';

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

interface WelcomeCardProps {
  name?: string;
  loading?: boolean;
}

const WelcomeCard = ({ name }: { name: string }) => {
  return (
    <div className='relative flex md:flex-row flex-col justify-between items-center bg-linear-to-r from-[#00a76f]/10 to-[#00a76f]/5 shadow-sm p-8 md:p-10 border border-[#00a76f]/20 rounded-2xl h-full overflow-hidden'>
      <div className='z-10 relative flex flex-col items-start gap-4 max-w-md'>
        <div>
          <h1 className='font-semibold text-primary text-lg'>
            {getGreeting()}
          </h1>

          <h2 className='font-bold text-gray-900 text-3xl'>{name}</h2>

          <p className='mt-1 text-gray-500 text-sm'>{getTodayDate()}</p>
        </div>

        <p className='mt-2 text-gray-600 text-sm leading-relaxed'>
          Manage your leaves, track your requests, and stay updated with your
          team’s availability, all in one place. Plan smart, work better
        </p>

        <Button className='bg-[#00a76f] hover:bg-[#008f5d] shadow-[#00a76f]/20 shadow-md mt-4 px-6 py-2.5 rounded-lg font-semibold text-white transition-colors'>
          Apply Leave
        </Button>
      </div>

      <div className='right-0 z-10 relative flex justify-center items-center mt-8 md:mt-0 w-48 md:w-64 h-48 md:h-64 shrink-0'>
        <WelcomeIcon />
      </div>
    </div>
  );
};

export default WelcomeCard;
