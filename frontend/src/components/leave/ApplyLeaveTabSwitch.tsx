'use client';

import Button from '@/components/ui/Button';
import React, { useRef } from 'react';

type Tab = 'LEAVE_APPLY' | 'COMP_OFF' | 'PERMISSION' | 'WFH' | 'ATTENDANCE_REGULARIZATION';

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const TAB_KEYS: Tab[] = ['LEAVE_APPLY', 'PERMISSION', 'COMP_OFF', 'WFH', 'ATTENDANCE_REGULARIZATION'];

const TAB_LABELS: Record<Tab, string> = {
  LEAVE_APPLY: 'Leave',
  PERMISSION: 'Permission',
  COMP_OFF: 'Comp off',
  WFH: 'WFH',
  ATTENDANCE_REGULARIZATION: 'Attendance',
};

export default function ApplyLeaveTabSwitch({ activeTab, onTabChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const classFor = (tab: Tab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      activeTab === tab 
        ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = TAB_KEYS.indexOf(activeTab);
    let nextIndex = -1;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % TAB_KEYS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + TAB_KEYS.length) % TAB_KEYS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = TAB_KEYS.length - 1;
    }

    if (nextIndex !== -1) {
      e.preventDefault();
      onTabChange(TAB_KEYS[nextIndex]);
      // Focus the new tab button
      const buttons = containerRef.current?.querySelectorAll('button');
      buttons?.[nextIndex]?.focus();
    }
  };

  return (
    <div 
      ref={containerRef}
      role='tablist'
      aria-label='Leave request types'
      onKeyDown={handleKeyDown}
      className='flex items-center gap-2 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1 no-scrollbar'
    >
      {TAB_KEYS.map((tab) => (
        <Button
          key={tab}
          type='button'
          unstyled
          role='tab'
          aria-selected={activeTab === tab}
          aria-controls={`tabpanel-${tab}`}
          id={`tab-${tab}`}
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => onTabChange(tab)}
          className={classFor(tab)}
        >
          {TAB_LABELS[tab]}
        </Button>
      ))}
    </div>
  );
}
