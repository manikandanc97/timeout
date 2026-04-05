import React from "react";

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
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  placeholder = "Select",
  value,
  options,
  onChange,
  containerClassName = "",
  selectClassName = "",
  rightElement,
}) => {
  return (
    <div className={`relative w-full ${containerClassName}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`peer block w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 pt-2 pb-2 text-sm text-gray-500 outline-none transition-all duration-150 ease-out focus:border-primary focus:ring-2 focus:ring-primary ${selectClassName}`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {rightElement ? (
        <div className="top-1/2 right-3 absolute -translate-y-1/2">
          {rightElement}
        </div>
      ) : null}
    </div>
  );
};

export default Select;
