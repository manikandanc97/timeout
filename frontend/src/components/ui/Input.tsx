import React, { useState } from 'react';

interface InputProps {
  type: string;
  label: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
}

const Input: React.FC<InputProps> = ({
  type,
  label,
  value,
  onChange,
  id,
  containerClassName = '',
  inputClassName = '',
  rightElement,
  rows,
  placeholder,
  hideLabel = false,
  min,
  max,
}) => {
  const [internalFocused, setInternalFocused] = useState(false);
  const isDate = type === 'date';
  const [dynamicType, setDynamicType] = useState(isDate ? 'text' : type);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInternalFocused(true);
    if (isDate) {
      setDynamicType('date');
      setTimeout(() => {
        try {
          // @ts-ignore
          e.target.showPicker?.();
        } catch {}
      }, 0);
    }
  };

  const handleBlur = () => {
    setInternalFocused(false);
    if (isDate) setDynamicType('text');
  };

  const spacingClass = hideLabel ? 'px-3 py-3' : 'px-3 pb-2 pt-5';

  const sharedClassName = `peer block w-full rounded-md border border-gray-300 bg-transparent ${spacingClass} text-sm text-gray-900 outline-none transition-all duration-150 ease-out focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 ${inputClassName}`;

  const ariaLabel = label || placeholder || id;
  const placeholderText = placeholder ?? (isDate ? '' : ' ');

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
      : value ?? '';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange?.(e as any);
    if (isDate) {
      // Close the picker immediately after a selection for better UX
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={`relative w-full ${containerClassName}`}>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange as any}
          placeholder={placeholderText}
          rows={rows || 4}
          className={sharedClassName}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
        />
      ) : (
        <input
          type={dynamicType}
          id={id}
          value={computedValue}
          onChange={handleChange as any}
          placeholder={placeholderText}
          className={sharedClassName}
          onFocus={handleFocus as any}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          min={min}
          max={max}
        />
      )}
      {!hideLabel && (
        <label
          htmlFor={id}
          className={`absolute left-3 z-10 origin-left -translate-y-4 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-4 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-primary bg-white px-1 ${
            type === 'textarea'
              ? 'top-4 peer-placeholder-shown:top-6'
              : 'top-4 peer-placeholder-shown:top-1/2'
          }`}
        >
          {label}
        </label>
      )}

      {rightElement ? (
        <div className='top-1/2 right-3 absolute -translate-y-1/2'>
          {rightElement}
        </div>
      ) : null}
    </div>
  );
};

export default Input;
