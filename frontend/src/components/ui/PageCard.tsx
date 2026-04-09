import React from 'react';

type PageCardProps = {
  title: string;
  children: React.ReactNode;
};

const PageCard = ({ title, children }: PageCardProps) => {
  return (
    <div className='rounded-2xl bg-white p-6 shadow-md'>
      <h1 className='text-2xl font-bold text-gray-900'>{title}</h1>
      <div className='mt-2 text-gray-600'>{children}</div>
    </div>
  );
};

export default PageCard;
