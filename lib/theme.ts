export type ThemeName = 'mint' | 'sakura' | 'lavender' | 'sky' | 'peach' | 'coral';

export type ThemeConfig = {
  name: ThemeName;
  label: string;
  primary: string;
  light: string;
  pale: string;
  gradient: string;
};

export const THEMES: ThemeConfig[] = [
  {
    name: 'mint',
    label: 'ミント',
    primary: '#2dd4bf',
    light: '#ccfbf1',
    pale: '#f0fdfa',
    gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
  },
  {
    name: 'sakura',
    label: 'さくら',
    primary: '#f472b6',
    light: '#fce7f3',
    pale: '#fdf2f8',
    gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
  },
  {
    name: 'lavender',
    label: 'ラベンダー',
    primary: '#a78bfa',
    light: '#ede9fe',
    pale: '#f5f3ff',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
  },
  {
    name: 'sky',
    label: 'スカイ',
    primary: '#38bdf8',
    light: '#e0f2fe',
    pale: '#f0f9ff',
    gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
  },
  {
    name: 'peach',
    label: 'ピーチ',
    primary: '#fb923c',
    light: '#ffedd5',
    pale: '#fff7ed',
    gradient: 'linear-gradient(135deg, #fb923c, #ea580c)',
  },
  {
    name: 'coral',
    label: 'コーラル',
    primary: '#f87171',
    light: '#fee2e2',
    pale: '#fef2f2',
    gradient: 'linear-gradient(135deg, #f87171, #dc2626)',
  },
];

export const DEFAULT_THEME: ThemeName = 'mint';

export function getTheme(name: ThemeName): ThemeConfig {
  return THEMES.find((t) => t.name === name) ?? THEMES[0];
}
