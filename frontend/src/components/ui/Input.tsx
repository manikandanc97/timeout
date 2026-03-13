import React from 'react';

interface InputProps {
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

const Input: React.FC<InputProps> = ({ type, label, value, onChange, id }) => {
  return (
    <div className='relative w-full'>
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={onChange}
        id={id}
        className='peer px-4 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-full'
      />
    </div>
  );
};

export default Input;
