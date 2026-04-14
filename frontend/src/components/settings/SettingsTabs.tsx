import type { SettingsTab, SettingsTabId } from '@/components/settings/settingsTypes';

type Props = {
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onTabChange: (tabId: SettingsTabId) => void;
};

export default function SettingsTabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <div className='rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-sm'>
      <div className='flex min-w-0 gap-2 overflow-x-auto pb-1'>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
