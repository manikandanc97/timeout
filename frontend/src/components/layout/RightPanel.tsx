'use client';

import { X } from 'lucide-react';
import Button from '../ui/Button';
import ProfilePanel from './ProfilePanel';

interface RightPanelProps {
  activePanel: string | null;
  onClose: () => void;
}

const PANEL_TITLES: Record<string, string> = {
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
};

const RightPanel: React.FC<RightPanelProps> = ({ activePanel, onClose }) => {
  if (!activePanel) return null;

  const title = PANEL_TITLES[activePanel] ?? 'Panel';

  return (
    <div className='fixed right-0 top-0 z-50 h-full w-80 bg-white p-4 shadow-lg'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
        <Button
          type='button'
          variant='ghost'
          onClick={onClose}
          aria-label='Close panel'
          className='!w-fit !px-2 !py-1 !text-gray-500 hover:!text-gray-800'
        >
          <X size={20} />
        </Button>
      </div>
      <div>
        {activePanel === 'notifications' && <div>No notifications</div>}

        {activePanel === 'settings' && <div>Settings content here</div>}

        {activePanel === 'profile' && <ProfilePanel />}
      </div>
    </div>
  );
};

export default RightPanel;
