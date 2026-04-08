'use client';

import { X } from 'lucide-react';
import Button from '../ui/Button';
import ProfilePanel from './ProfilePanel';

interface RightPanelProps {
  activePanel: string | null;
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ activePanel, onClose }) => {
  if (!activePanel) return null;

  const getTitle = () => {
    if (activePanel === 'notifications') {
      return 'Notifications';
    }
    if (activePanel === 'settings') {
      return 'Settings';
    }
    if (activePanel === 'profile') {
      return 'Profile';
    }
  };
  return (
    <div className='top-0 right-0 z-50 fixed bg-white shadow-lg p-4 w-80 h-full'>
      <div className='flex justify-between items-center gap-2 mb-4'>
        <h2 className='font-bold text-xl'>{getTitle()}</h2>
        <Button
          onClick={onClose}
          className='px-3 py-1 w-fit! text-gray-500 hover:text-gray-700'
        >
          <X />
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
