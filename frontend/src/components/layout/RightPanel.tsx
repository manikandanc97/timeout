'use client';

import { useNotifications } from '@/context/NotificationProvider';
import {
  ACCENT_THEME_PRESETS,
  applyAccentTheme,
  applyFontTheme,
  applyTheme,
  FONT_THEME_PRESETS,
  isThemeAccentId,
  isThemeFontId,
  THEME_ACCENT_STORAGE_KEY,
  THEME_FONT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeAccentId,
  type ThemeFontId,
  type ThemeMode,
} from '@/lib/theme';
import { MousePointerClick, Palette, Type, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import SettingsToggle from '../settings/SettingsToggle';
import ProfilePanel from './ProfilePanel';
import AIChatPanel from '@/components/ai/AIChatPanel';

interface RightPanelProps {
  activePanel: string | null;
  onClose: () => void;
}

const PANEL_TITLES: Record<string, string> = {
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
  aiChat: 'AI Assistant',
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
  const firstRowPresets = ACCENT_THEME_PRESETS.slice(0, 3);
  const secondRowPresets = ACCENT_THEME_PRESETS.slice(3);
  const firstRowFonts = FONT_THEME_PRESETS.slice(0, 2);
  const secondRowFonts = FONT_THEME_PRESETS.slice(2, 4);
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
        activePanel === 'aiChat' ? 'max-w-full' : 'max-w-[26rem]'
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
          <div className='flex min-h-0 flex-col gap-3'>
            <div className='flex items-center justify-between gap-2'>
              <p className='text-xs text-muted-foreground'>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'You are all caught up'}
              </p>
              {unreadCount > 0 ? (
                <Button
                  type='button'
                  variant='ghost'
                  className='h-auto! px-2! py-1! text-xs! text-primary!'
                  onClick={() => void markAllRead()}
                >
                  Mark all read
                </Button>
              ) : null}
            </div>
            <div className='max-h-[calc(100vh-8rem)] space-y-2 overflow-y-auto pr-1'>
              {notifications.length === 0 ? (
                <p className='text-sm text-muted-foreground'>No notifications</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type='button'
                    onClick={() => {
                      if (!n.readAt) void markAsRead(n.id);
                    }}
                    className={`w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                      n.readAt ? 'opacity-80' : 'border-primary/25 bg-primary/5'
                    }`}
                  >
                    <div className='font-medium text-card-foreground'>
                      {n.title}
                    </div>
                    {n.body ? (
                      <p className='mt-1 text-xs text-muted-foreground'>
                        {n.body}
                      </p>
                    ) : null}
                    <p className='mt-2 text-[10px] text-muted-foreground'>
                      {formatWhen(n.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activePanel === 'settings' && (
          <div className='space-y-4'>
            <section className='rounded-xl border border-border bg-muted/40 p-3'>
              <div className='mb-3 flex items-start gap-2'>
                <Palette size={16} className='mt-0.5 text-primary' />
                <div>
                  <p className='text-sm font-semibold text-card-foreground'>Appearance</p>
                  <p className='text-xs text-muted-foreground'>Control dashboard look and feel.</p>
                </div>
              </div>
              <div className='space-y-3'>
                <div className='flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2'>
                  <div>
                    <p className='text-sm font-medium text-card-foreground'>Dark mode</p>
                    <p className='text-xs text-muted-foreground'>Switch between light and dark surfaces.</p>
                  </div>
                  <SettingsToggle
                    checked={darkMode}
                    onChange={(next) => {
                      setDarkMode(next);
                      const mode: ThemeMode = next ? 'dark' : 'light';
                      applyTheme(mode);
                    }}
                  />
                </div>
                <div className='rounded-lg border border-border bg-card p-3'>
                  <p className='text-sm font-medium text-card-foreground'>Theme color</p>
                  <p className='mb-3 mt-1 text-xs text-muted-foreground'>
                    Pick a primary brand color for buttons and highlights.
                  </p>
                  <div className='rounded-xl border border-border bg-muted/50 p-2'>
                    <div className='grid grid-cols-3 gap-2'>
                      {firstRowPresets.map((preset) => {
                        const selected = preset.id === accentColor;
                        return (
                          <button
                            key={preset.id}
                            type='button'
                            aria-label={`Use ${preset.label} accent`}
                            title={preset.label}
                            onClick={() => {
                              setAccentColor(preset.id);
                              applyAccentTheme(preset.id);
                            }}
                            className={`rounded-xl border p-1.5 transition ${
                              selected
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25'
                                : 'border-border bg-card hover:border-primary/40'
                            }`}
                          >
                            <ThemeSwatchIcon color={preset.primary} />
                          </button>
                        );
                      })}
                    </div>

                    <div className='mt-2 grid grid-cols-3 gap-2'>
                      {secondRowPresets.map((preset) => {
                        const selected = preset.id === accentColor;
                        return (
                          <button
                            key={preset.id}
                            type='button'
                            aria-label={`Use ${preset.label} accent`}
                            title={preset.label}
                            onClick={() => {
                              setAccentColor(preset.id);
                              applyAccentTheme(preset.id);
                            }}
                            className={`rounded-xl border p-1.5 transition ${
                              selected
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25'
                                : 'border-border bg-card hover:border-primary/40'
                            }`}
                          >
                            <ThemeSwatchIcon color={preset.primary} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border border-border bg-card p-3'>
                  <div className='mb-3 flex items-start gap-2'>
                    <Type size={15} className='mt-0.5 text-primary' />
                    <div>
                      <p className='text-sm font-medium text-card-foreground'>Font style</p>
                      <p className='text-xs text-muted-foreground'>Choose from popular free Google fonts.</p>
                    </div>
                  </div>
                  <div className='rounded-xl border border-border bg-muted/50 p-2'>
                    <div className='grid grid-cols-2 gap-2'>
                      {firstRowFonts.map((preset) => {
                        const selected = preset.id === fontStyle;
                        return (
                          <button
                            key={preset.id}
                            type='button'
                            aria-label={`Use ${preset.label} font`}
                            title={preset.label}
                            onClick={() => {
                              setFontStyle(preset.id);
                              applyFontTheme(preset.id);
                            }}
                            className={`w-full min-h-[82px] rounded-xl border px-2 py-2 text-center transition focus-visible:outline-none ${
                              selected
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25'
                                : 'border-border bg-card hover:border-primary/40'
                            }`}
                            style={{ fontFamily: preset.fontFamily }}
                          >
                            <span className='block min-h-[2.2rem] text-[11px] leading-tight font-semibold text-card-foreground'>
                              {preset.label}
                            </span>
                            <span className='mt-0.5 block text-[11px] text-muted-foreground'>Aa</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className='mt-2 grid grid-cols-2 gap-2'>
                      {secondRowFonts.map((preset) => {
                        const selected = preset.id === fontStyle;
                        return (
                          <button
                            key={preset.id}
                            type='button'
                            aria-label={`Use ${preset.label} font`}
                            title={preset.label}
                            onClick={() => {
                              setFontStyle(preset.id);
                              applyFontTheme(preset.id);
                            }}
                            className={`w-full min-h-[82px] rounded-xl border px-2 py-2 text-center transition focus-visible:outline-none ${
                              selected
                                ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/25'
                                : 'border-border bg-card hover:border-primary/40'
                            }`}
                            style={{ fontFamily: preset.fontFamily }}
                          >
                            <span className='block min-h-[2.2rem] text-[11px] leading-tight font-semibold text-card-foreground'>
                              {preset.label}
                            </span>
                            <span className='mt-0.5 block text-[11px] text-muted-foreground'>Aa</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className='rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground'>
              <div className='flex items-start gap-2'>
                <MousePointerClick size={14} className='mt-0.5 text-primary' />
                <p>
                  Quick settings apply instantly to this browser with the default brand theme style.
                </p>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'profile' && <ProfilePanel />}
        {activePanel === 'aiChat' && <AIChatPanel />}
      </div>
    </div>
  );
};

export default RightPanel;
