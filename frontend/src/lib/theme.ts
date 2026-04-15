/** Storage key — keep in sync with the inline script in `src/app/layout.tsx`. */
export const THEME_STORAGE_KEY = 'timeout-theme';
export const THEME_ACCENT_STORAGE_KEY = 'timeout-accent';
export const THEME_FONT_STORAGE_KEY = 'timeout-font';

export type ThemeMode = 'light' | 'dark';
export type ThemeAccentId = 'mint' | 'blue' | 'violet' | 'orange' | 'red' | 'indigo';
export type ThemeFontId = 'geist' | 'poppins' | 'inter' | 'roboto';

type ThemeAccentPreset = {
  id: ThemeAccentId;
  label: string;
  primary: string;
  primaryDark: string;
  ring: string;
  accent: string;
};

type ThemeFontPreset = {
  id: ThemeFontId;
  label: string;
  fontFamily: string;
};

export const ACCENT_THEME_PRESETS: ThemeAccentPreset[] = [
  {
    id: 'mint',
    label: 'Default',
    primary: '#088395',
    primaryDark: '#09637e',
    ring: '#088395',
    accent: '#7ab2b2',
  },
  {
    id: 'blue',
    label: 'Blue',
    primary: '#1d8cf8',
    primaryDark: '#1769c7',
    ring: '#1d8cf8',
    accent: '#a9d4fb',
  },
  {
    id: 'violet',
    label: 'Violet',
    primary: '#7c3aed',
    primaryDark: '#5b21b6',
    ring: '#8b5cf6',
    accent: '#c4b5fd',
  },
  {
    id: 'orange',
    label: 'Orange',
    primary: '#f59e0b',
    primaryDark: '#d97706',
    ring: '#f59e0b',
    accent: '#fde68a',
  },
  {
    id: 'red',
    label: 'Red',
    primary: '#ef4444',
    primaryDark: '#dc2626',
    ring: '#ef4444',
    accent: '#fecaca',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    ring: '#2563eb',
    accent: '#bfdbfe',
  },
];

export const FONT_THEME_PRESETS: ThemeFontPreset[] = [
  {
    id: 'geist',
    label: 'Geist',
    fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'poppins',
    label: 'Poppins',
    fontFamily: 'var(--font-poppins), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'inter',
    label: 'Inter',
    fontFamily: 'var(--font-inter), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'roboto',
    label: 'Roboto',
    fontFamily: 'var(--font-roboto), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  },
];

export function isThemeAccentId(value: string): value is ThemeAccentId {
  return ACCENT_THEME_PRESETS.some((preset) => preset.id === value);
}

export function isThemeFontId(value: string): value is ThemeFontId {
  return FONT_THEME_PRESETS.some((preset) => preset.id === value);
}

export function applyAccentTheme(accentId: ThemeAccentId): void {
  const root = document.documentElement;
  const preset = ACCENT_THEME_PRESETS.find((entry) => entry.id === accentId);
  if (!preset) return;
  root.style.setProperty('--primary', preset.primary);
  root.style.setProperty('--primary-dark', preset.primaryDark);
  root.style.setProperty('--ring', preset.ring);
  root.style.setProperty('--accent', preset.accent);
  try {
    localStorage.setItem(THEME_ACCENT_STORAGE_KEY, accentId);
  } catch {
    /* private mode / quota */
  }
}

export function applyFontTheme(fontId: ThemeFontId): void {
  const root = document.documentElement;
  const preset = FONT_THEME_PRESETS.find((entry) => entry.id === fontId);
  if (!preset) return;
  root.style.setProperty('--app-font-family', preset.fontFamily);
  try {
    localStorage.setItem(THEME_FONT_STORAGE_KEY, fontId);
  } catch {
    /* private mode / quota */
  }
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* private mode / quota */
  }
}
