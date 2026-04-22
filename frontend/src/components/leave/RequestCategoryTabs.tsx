'use client';

import { BriefcaseBusiness, CalendarDays, Clock3, ShieldAlert, Laptop, type LucideIcon } from 'lucide-react';

export type RequestCategoryTabId = 'LEAVE' | 'WFH' | 'PERMISSION' | 'COMP_OFF' | 'REGULARIZATION';

type TabDef = {
  id: RequestCategoryTabId;
  label: string;
  Icon: LucideIcon;
};

const TAB_DEFINITIONS: TabDef[] = [
  { id: 'LEAVE', label: 'Leave', Icon: CalendarDays },
  { id: 'WFH', label: 'WFH', Icon: Laptop },
  { id: 'REGULARIZATION', label: 'Attendance', Icon: ShieldAlert },
  { id: 'PERMISSION', label: 'Permission', Icon: Clock3 },
  { id: 'COMP_OFF', label: 'Comp off', Icon: BriefcaseBusiness },
];

type Props = {
  activeTab: RequestCategoryTabId;
  onTabChange: (tab: RequestCategoryTabId) => void;
};

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default function RequestCategoryTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav aria-label='Request type' className='w-full min-w-0'>
      <div
        role='tablist'
        className='flex min-w-0 flex-row gap-1 overflow-x-auto no-scrollbar rounded-2xl border border-border bg-muted/60 p-1.5 shadow-sm backdrop-blur-sm'
      >
        {TAB_DEFINITIONS.map(({ id, label, Icon }) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              type='button'
              role='tab'
              aria-selected={selected}
              onClick={() => onTabChange(id)}
              className={`${focusRing} group relative flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] transition-all duration-200 ease-out sm:min-h-0 sm:py-2.5 sm:text-sm whitespace-nowrap ${
                selected
                  ? 'z-1 bg-card font-semibold text-primary shadow-sm ring-1 ring-border'
                  : 'font-medium text-card-foreground/78 hover:bg-card/70 hover:text-card-foreground'
              } active:scale-[0.98]`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:size-8 ${
                  selected
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-card-foreground/70 group-hover:bg-muted/90 group-hover:text-card-foreground'
                }`}
              >
                <Icon size={16} strokeWidth={selected ? 2.25 : 2} aria-hidden />
              </span>
              <span className='min-w-0 truncate tracking-tight'>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
