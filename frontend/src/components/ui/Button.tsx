import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit';
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button = (props: ButtonProps) => {
  const {
    type = 'button',
    children,
    disabled = false,
    className = '',
    onClick,
  } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`bg-primary hover:bg-primary-dark disabled:opacity-50 py-2 rounded-lg text-white transition-colors duration-300 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
