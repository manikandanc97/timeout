/** Storage key — keep in sync with the inline script in `src/app/layout.tsx`. */
export const THEME_STORAGE_KEY = 'timeout-theme';

export type ThemeMode = 'light' | 'dark';

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
