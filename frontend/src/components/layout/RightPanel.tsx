'use client';

import { useNotifications } from '@/context/NotificationProvider';
import {
  isThemeAccentId,
  isThemeFontId,
  THEME_ACCENT_STORAGE_KEY,
  THEME_FONT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeAccentId,
  type ThemeFontId,
} from '@/lib/theme';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import ProfilePanel from './ProfilePanel';
import NotificationsPanel from './right-panel/NotificationsPanel';
import AppearanceSettingsPanel from './right-panel/AppearanceSettingsPanel';

interface RightPanelProps {
  activePanel: string | null;
  onClose: () => void;
}

const PANEL_TITLES: Record<string, string> = {
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
};

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '';
  }
}

const RightPanel: React.FC<RightPanelProps> = ({ activePanel, onClose }) => {
  const { notifications, refresh, markAsRead, markAllRead, unreadCount } =
    useNotifications();
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false,
  );
  const [accentColor, setAccentColor] = useState<ThemeAccentId>(() => {
    if (typeof window === 'undefined') return 'mint';
    const storedAccent = localStorage.getItem(THEME_ACCENT_STORAGE_KEY);
    return storedAccent && isThemeAccentId(storedAccent) ? storedAccent : 'mint';
  });
  const [fontStyle, setFontStyle] = useState<ThemeFontId>(() => {
    if (typeof window === 'undefined') return 'geist';
    const storedFont = localStorage.getItem(THEME_FONT_STORAGE_KEY);
    return storedFont && isThemeFontId(storedFont) ? storedFont : 'geist';
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        setDarkMode(e.newValue === 'dark');
      }
      if (e.key === THEME_ACCENT_STORAGE_KEY && e.newValue && isThemeAccentId(e.newValue)) {
        setAccentColor(e.newValue);
      }
      if (e.key === THEME_FONT_STORAGE_KEY && e.newValue && isThemeFontId(e.newValue)) {
        setFontStyle(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (activePanel === 'notifications') {
      void refresh();
    }
  }, [activePanel, refresh]);

  if (!activePanel) return null;

  const title = PANEL_TITLES[activePanel] ?? 'Panel';
  const ThemeSwatchIcon = ({ color }: { color: string }) => (
    <svg
      focusable='false'
      aria-hidden='true'
      viewBox='0 0 24 24'
      width='24'
      height='24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      style={{ color }}
      className='mx-auto h-7 w-7'
    >
      <path
        opacity='0.4'
        fillRule='evenodd'
        clipRule='evenodd'
        d='M20.828 4.172C22 5.343 22 7.229 22 11V13C22 16.771 22 18.657 20.828 19.828C19.657 21 17.771 21 14 21H9V3H14C17.771 3 19.657 3 20.828 4.172Z'
        fill='currentColor'
      />
      <path
        d='M18.5 9.244C18.6989 9.244 18.8897 9.32302 19.0303 9.46367C19.171 9.60432 19.25 9.79509 19.25 9.994C19.25 10.1929 19.171 10.3837 19.0303 10.5243C18.8897 10.665 18.6989 10.744 18.5 10.744H12.5C12.3011 10.744 12.1103 10.665 11.9697 10.5243C11.829 10.3837 11.75 10.1929 11.75 9.994C11.75 9.79509 11.829 9.60432 11.9697 9.46367C12.1103 9.32302 12.3011 9.244 12.5 9.244H18.5ZM17.5 13.244C17.6989 13.244 17.8897 13.323 18.0303 13.4637C18.171 13.6043 18.25 13.7951 18.25 13.994C18.25 14.1929 18.171 14.3837 18.0303 14.5243C17.8897 14.665 17.6989 14.744 17.5 14.744H13.5C13.3011 14.744 13.1103 14.665 12.9697 14.5243C12.829 14.3837 12.75 14.1929 12.75 13.994C12.75 13.7951 12.829 13.6043 12.9697 13.4637C13.1103 13.323 13.3011 13.244 13.5 13.244H17.5ZM2 12.994V10.994C2 7.223 2 5.337 3.172 4.166C4.146 3.191 6.364 3.027 9 3V20.988C6.364 20.961 4.146 20.797 3.172 19.822C2 18.651 2 16.765 2 12.994Z'
        fill='currentColor'
      />
    </svg>
  );

  return (
    <div
      className={`fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-card p-4 text-card-foreground shadow-lg dark:shadow-xl sm:w-[420px] ${
        'max-w-104'
      }`}
    >
      <div className='mb-4 flex items-center justify-between gap-2'>
        <h2 className='text-xl font-bold text-card-foreground'>{title}</h2>
        <Button
          type='button'
          variant='ghost'
          onClick={onClose}
          aria-label='Close panel'
          className='w-fit! px-2! py-1! text-muted-foreground! hover:text-card-foreground!'
        >
          <X size={20} />
        </Button>
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto pr-1'>
        {activePanel === 'notifications' && (
          <NotificationsPanel
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            markAllRead={markAllRead}
            formatWhen={formatWhen}
          />
        )}

        {activePanel === 'settings' && (
          <AppearanceSettingsPanel
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            fontStyle={fontStyle}
            setFontStyle={setFontStyle}
            ThemeSwatchIcon={ThemeSwatchIcon}
          />
        )}

        {activePanel === 'profile' && <ProfilePanel />}
      </div>
    </div>
  );
};

export default RightPanel;
