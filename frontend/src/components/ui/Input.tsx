import React, { useState } from 'react';

interface InputProps {
  type: string;
  label: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  id: string;
  containerClassName?: string;
  inputClassName?: string;
  rightElement?: React.ReactNode;
  placeholder?: string;
  rows?: number;
  hideLabel?: boolean;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type,
  label,
  value,
  onChange,
  onBlur,
  id,
  containerClassName = '',
  inputClassName = '',
  rightElement,
  rows,
  placeholder,
  hideLabel = false,
  min,
  max,
  required = false,
  disabled = false,
}) => {
  const [internalFocused, setInternalFocused] = useState(false);
  const isDate = type === 'date';
  const [dynamicType, setDynamicType] = useState(isDate ? 'text' : type);

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInternalFocused(true);
    if (isDate) {
      setDynamicType('date');
      setTimeout(() => {
        try {
          (e.target as HTMLInputElement).showPicker?.();
        } catch {
          /* showPicker not supported in some browsers */
        }
      }, 0);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInternalFocused(false);
    if (isDate) setDynamicType('text');
    onBlur?.(e);
  };

  const spacingClass = hideLabel
    ? 'px-3 py-3'
    : 'px-3 pb-2.5 pt-6 leading-normal';

  const sharedClassName = `peer block w-full rounded-md border border-input bg-card ${spacingClass} text-sm text-card-foreground outline-none transition-all duration-150 ease-out placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-0 ${inputClassName}`;

  const ariaLabel = label || placeholder || id;
  const placeholderText = placeholder ?? (isDate ? '' : ' ');
  /** Real placeholder text would clash with a centered label; login-style fields use a space-only placeholder. */
  const hasUserPlaceholder =
    typeof placeholder === 'string' && placeholder.trim().length > 0;

  const formatDisplayDate = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) return iso;
    return `${d}-${m}-${y}`;
  };

  const computedValue =
    isDate && value
      ? internalFocused
        ? value
        : formatDisplayDate(value)
      : (value ?? '');

  /** Date inputs use internal show/hide; other types follow the `type` prop (e.g. password ↔ text). */
  const effectiveInputType = isDate ? dynamicType : type;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange?.(e);
  };

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholderText}
          rows={rows || 4}
          className={sharedClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={effectiveInputType}
          id={id}
          value={computedValue}
          onChange={handleChange}
          placeholder={placeholderText}
          className={sharedClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
        />
      )}
      {!hideLabel && (
        <label
          htmlFor={id}
          className={
            type === 'textarea'
              ? 'absolute left-3 top-4 z-10 origin-left -translate-y-4 scale-75 transform bg-card px-1 text-sm text-muted-foreground duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-4 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary'
              : hasUserPlaceholder
                ? 'pointer-events-none absolute left-3 top-4 z-10 origin-left -translate-y-4 scale-75 transform bg-card px-1 text-sm text-muted-foreground duration-300 peer-focus:text-primary'
                : 'pointer-events-none absolute left-3 top-4 z-10 origin-left -translate-y-4 scale-75 transform bg-card px-1 text-sm text-muted-foreground duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-4 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary'
          }
        >
          {label}
          {required ? <span className='ml-0.5 text-red-500'>*</span> : null}
        </label>
      )}

      {rightElement ? (
        <div className='pointer-events-auto absolute top-1/2 right-3 z-20 -translate-y-1/2'>
          {rightElement}
        </div>
      ) : null}
    </div>
  );
};

export default Input;
