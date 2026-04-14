type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
};

export default function SettingsToggle({ checked, onChange, label }: Props) {
  return (
    <label className='inline-flex cursor-pointer items-center gap-2'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className='peer sr-only'
      />
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </span>
      {label ? <span className='text-sm text-gray-700'>{label}</span> : null}
    </label>
  );
}
