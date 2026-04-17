'use client';

import Button from '@/components/ui/Button';

type Tab = 'LEAVE' | 'PERMISSION' | 'COMP_OFF';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function PendingRequestTabSwitch({ activeTab, onTabChange }: Props) {
  const buttonClass = (tab: Tab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-card-foreground/80 hover:bg-muted'
    }`;

  return (
    <div className='mb-4 flex items-center gap-2 rounded-xl border border-border bg-card/80 p-1'>
      <Button type='button' unstyled onClick={() => onTabChange('LEAVE')} className={buttonClass('LEAVE')}>
        Leave
      </Button>
      <Button
        type='button'
        unstyled
        onClick={() => onTabChange('PERMISSION')}
        className={buttonClass('PERMISSION')}
      >
        Permission
      </Button>
      <Button
        type='button'
        unstyled
        onClick={() => onTabChange('COMP_OFF')}
        className={buttonClass('COMP_OFF')}
      >
        Comp off
      </Button>
    </div>
  );
}
