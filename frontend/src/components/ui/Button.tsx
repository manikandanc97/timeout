import React from 'react';

/** Visual style presets so pages stay consistent without long className strings. */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

interface ButtonProps {
  type?: 'button' | 'submit';
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  /** Defaults to solid primary; use ghost for icon-only toolbars, outline for secondary actions. */
  variant?: ButtonVariant;
  /** When true, only cursor/disabled styles apply — use for icon tiles with fully custom Tailwind. */
  unstyled?: boolean;
  'aria-label'?: string;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-dark rounded-lg py-2 px-4 text-white font-medium',
  ghost:
    '!bg-transparent hover:!bg-muted rounded-full p-2 min-w-0 !text-muted-foreground hover:!text-card-foreground',
  outline:
    '!bg-transparent hover:!bg-muted border border-border rounded-lg py-2 px-4 !text-card-foreground font-medium',
  danger: 'bg-red-500 hover:bg-red-700 rounded-lg py-2 px-4 text-white font-medium',
};

const Button = (props: ButtonProps) => {
  const {
    type = 'button',
    children,
    disabled = false,
    className = '',
    onClick,
    variant = 'primary',
    unstyled = false,
    'aria-label': ariaLabel,
  } = props;

  const surface = unstyled
    ? ''
    : variantClass[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`cursor-pointer transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${surface} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
