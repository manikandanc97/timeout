import React from 'react';

/** Visual style presets so pages stay consistent without long className strings. */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Defaults to solid primary; use ghost for icon-only toolbars, outline for secondary actions. */
  variant?: ButtonVariant;
  /** When true, only cursor/disabled styles apply — use for icon tiles with fully custom Tailwind. */
  unstyled?: boolean;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary-dark',
  ghost:
    '!bg-transparent hover:!bg-muted rounded-full p-2 min-w-0 !text-muted-foreground hover:!text-card-foreground',
  outline:
    '!bg-transparent hover:!bg-muted border border-border rounded-lg py-2 px-4 !text-card-foreground font-medium',
  danger:
    'rounded-lg bg-destructive px-4 py-2 font-medium text-destructive-foreground hover:opacity-90',
};

const Button = React.memo((props: ButtonProps) => {
  const {
    type = 'button',
    children,
    disabled = false,
    loading = false,
    className = '',
    variant = 'primary',
    unstyled = false,
    ...rest
  } = props;

  const surface = unstyled
    ? ''
    : variantClass[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${surface} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span className='invisible opacity-0'>{children}</span>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
