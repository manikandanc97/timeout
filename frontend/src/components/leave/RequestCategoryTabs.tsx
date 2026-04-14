'use client';

import { BriefcaseBusiness, CalendarDays, Clock3, type LucideIcon } from 'lucide-react';

export type RequestCategoryTabId = 'LEAVE' | 'PERMISSION' | 'COMP_OFF';

type TabDef = {
  id: RequestCategoryTabId;
  label: string;
  Icon: LucideIcon;
};

const TAB_DEFINITIONS: TabDef[] = [
  { id: 'LEAVE', label: 'Leave', Icon: CalendarDays },
  { id: 'PERMISSION', label: 'Permission', Icon: Clock3 },
  { id: 'COMP_OFF', label: 'Comp off', Icon: BriefcaseBusiness },
];

type Props = {
  activeTab: RequestCategoryTabId;
  onTabChange: (tab: RequestCategoryTabId) => void;
};

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80';

/**
 * Modern segmented control: soft glass track, floating white pill for the active tab.
 */
export default function RequestCategoryTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav aria-label='Request type' className='w-full min-w-0'>
      <div
        role='tablist'
        className='flex min-w-0 flex-col gap-1.5 rounded-2xl border border-slate-200/60 bg-slate-100/75 p-1.5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-stretch sm:gap-1.5 sm:p-2 sm:shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
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
              className={`${focusRing} group relative flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] transition-[color,background-color,box-shadow,transform] duration-200 ease-out sm:min-h-0 sm:py-3 sm:text-sm ${
                selected
                  ? 'z-1 bg-white font-semibold text-primary shadow-[0_2px_12px_-2px_rgba(8,131,149,0.28),0_1px_3px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70'
                  : 'font-medium text-slate-500 hover:bg-white/60 hover:text-slate-800'
              } active:scale-[0.985] motion-reduce:transform-none`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:size-9 ${
                  selected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-200/40 text-slate-400 group-hover:bg-slate-200/55 group-hover:text-slate-500'
                }`}
              >
                <Icon size={18} strokeWidth={selected ? 2.25 : 2} aria-hidden />
              </span>
              <span className='min-w-0 truncate tracking-tight'>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
