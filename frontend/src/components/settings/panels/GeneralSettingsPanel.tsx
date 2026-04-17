'use client';

import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
} from '@/components/settings/settingsMockData';
import type { GeneralSettings } from '@/components/settings/settingsTypes';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

type Props = {
  value: GeneralSettings;
  onChange: (next: GeneralSettings) => void;
};

export default function GeneralSettingsPanel({ value, onChange }: Props) {
  const updateField = (field: keyof GeneralSettings, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
      <Input
        id='companyName'
        type='text'
        label='Company Name'
        value={value.companyName}
        onChange={(e) => updateField('companyName', e.target.value)}
      />
      <Input
        id='companyEmail'
        type='email'
        label='Company Email'
        value={value.companyEmail}
        onChange={(e) => updateField('companyEmail', e.target.value)}
      />
      <Input
        id='phoneNumber'
        type='tel'
        label='Phone Number'
        value={value.phoneNumber}
        onChange={(e) => updateField('phoneNumber', e.target.value)}
      />
      <Input
        id='officeAddress'
        type='text'
        label='Office Address'
        value={value.officeAddress}
        onChange={(e) => updateField('officeAddress', e.target.value)}
      />
      <Select
        id='timezone'
        label='Timezone'
        value={value.timezone}
        options={TIMEZONE_OPTIONS}
        onChange={(e) => updateField('timezone', e.target.value)}
      />
      <Select
        id='currency'
        label='Currency'
        value={value.currency}
        options={CURRENCY_OPTIONS}
        onChange={(e) => updateField('currency', e.target.value)}
      />
      <div className='sm:col-span-2'>
        <Select
          id='dateFormat'
          label='Date Format'
          value={value.dateFormat}
          options={DATE_FORMAT_OPTIONS}
          onChange={(e) => updateField('dateFormat', e.target.value)}
        />
      </div>
    </div>
  );
}
