import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  containerClassName?: string;
  selectClassName?: string;
  rightElement?: React.ReactNode;
  hideLabel?: boolean;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  placeholder = ' ',
  value,
  options,
  onChange,
  containerClassName = '',
  selectClassName = '',
  rightElement,
  hideLabel = false,
}) => {
  // Compact (toolbar) selects: enough vertical padding + line-height so native
  // <select> text isn’t clipped at h-10 (inputs tolerate py-0; selects often don’t).
  // Labeled selects use min-height + generous padding; do not combine with fixed h-10/h-11
  // or the selected option text will clip inside the box.
  const spacingClass = hideLabel
    ? 'px-3 py-2 leading-5'
    : 'min-h-[2.75rem] px-3 pb-2.5 pt-6 text-sm leading-normal';
  const ariaLabel = label || placeholder || id;

  return (
    <div className={`relative w-full ${containerClassName}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent ${spacingClass} text-sm text-gray-900 outline-none transition-all duration-150 ease-out focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 ${selectClassName}`}
        aria-label={ariaLabel}
      >
        <option value='' disabled hidden>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className='pointer-events-none absolute left-3 top-4 z-10 origin-left -translate-y-4 scale-75 transform bg-white px-1 text-sm text-gray-500 duration-300 peer-focus:text-primary'
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

export default Select;
