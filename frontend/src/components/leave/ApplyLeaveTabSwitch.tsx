'use client';

import Button from '@/components/ui/Button';

type Tab = 'LEAVE_APPLY' | 'COMP_OFF' | 'PERMISSION';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export default function ApplyLeaveTabSwitch({ activeTab, onTabChange }: Props) {
  const classFor = (tab: Tab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
      activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
    }`;

  return (
    <div className='flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1'>
      <Button type='button' unstyled onClick={() => onTabChange('LEAVE_APPLY')} className={classFor('LEAVE_APPLY')}>
        Leave apply
      </Button>
      <Button type='button' unstyled onClick={() => onTabChange('PERMISSION')} className={classFor('PERMISSION')}>
        Permission
      </Button>
      <Button type='button' unstyled onClick={() => onTabChange('COMP_OFF')} className={classFor('COMP_OFF')}>
        Comp off
      </Button>
    </div>
  );
}
