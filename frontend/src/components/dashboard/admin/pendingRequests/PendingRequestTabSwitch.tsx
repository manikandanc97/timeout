'use client';

import Button from '@/components/ui/Button';

export type PendingTab = 'LEAVE' | 'WFH' | 'PERMISSION' | 'COMP_OFF' | 'ATTENDANCE';

type Props = {
  activeTab: PendingTab;
  onTabChange: (tab: PendingTab) => void;
};

export default function PendingRequestTabSwitch({ activeTab, onTabChange }: Props) {
  const buttonClass = (tab: PendingTab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
      activeTab === tab ? 'bg-primary text-primary-foreground shadow-sm' : 'text-card-foreground/80 hover:bg-muted'
    }`;

  return (
    <div className='mb-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card/80 p-1 no-scrollbar'>
      <Button type='button' unstyled onClick={() => onTabChange('LEAVE')} className={buttonClass('LEAVE')}>
        Leave
      </Button>
      <Button type='button' unstyled onClick={() => onTabChange('WFH')} className={buttonClass('WFH')}>
        WFH
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
      <Button
        type='button'
        unstyled
        onClick={() => onTabChange('ATTENDANCE')}
        className={buttonClass('ATTENDANCE')}
      >
        Attendance
      </Button>
    </div>
  );
}
