'use client';

import SettingsToggle from '@/components/settings/SettingsToggle';
import {
  ACCENT_THEME_PRESETS,
  applyAccentTheme,
  applyFontTheme,
  applyTheme,
  FONT_THEME_PRESETS,
  type ThemeAccentId,
  type ThemeFontId,
  type ThemeMode,
} from '@/lib/theme';
import { MousePointerClick, Palette, Type } from 'lucide-react';

type Props = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  accentColor: ThemeAccentId;
  setAccentColor: (value: ThemeAccentId) => void;
  fontStyle: ThemeFontId;
  setFontStyle: (value: ThemeFontId) => void;
  ThemeSwatchIcon: ({ color }: { color: string }) => React.JSX.Element;
};

export default function AppearanceSettingsPanel({
  darkMode,
  setDarkMode,
  accentColor,
  setAccentColor,
  fontStyle,
  setFontStyle,
  ThemeSwatchIcon,
}: Props) {
  const firstRowPresets = ACCENT_THEME_PRESETS.slice(0, 3);
  const secondRowPresets = ACCENT_THEME_PRESETS.slice(3);
  const firstRowFonts = FONT_THEME_PRESETS.slice(0, 2);
  const secondRowFonts = FONT_THEME_PRESETS.slice(2, 4);

  return (
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
          <p>Quick settings apply instantly to this browser with the default brand theme style.</p>
        </div>
      </div>
    </div>
  );
}
