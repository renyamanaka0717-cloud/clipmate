export type ThemeName = 'mint' | 'sakura' | 'lavender' | 'sky' | 'peach' | 'coral';

export type ThemeConfig = {
  name: ThemeName;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  pale: string;
  gradient: string;
  avatarGradient: string;
};

export const THEMES: ThemeConfig[] = [
  {
    name: 'mint',
    label: 'ミント',
    primary: '#2dd4bf',
    secondary: '#818cf8',
    accent: '#34d399',
    light: '#ccfbf1',
    pale: '#f0fdfa',
    gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)',
    avatarGradient: 'linear-gradient(135deg, #2dd4bf, #818cf8)',
  },
  {
    name: 'sakura',
    label: 'さくら',
    primary: '#f472b6',
    secondary: '#c084fc',
    accent: '#fb7185',
    light: '#fce7f3',
    pale: '#fdf2f8',
    gradient: 'linear-gradient(135deg, #f472b6, #c084fc)',
    avatarGradient: 'linear-gradient(135deg, #f472b6, #c084fc)',
  },
  {
    name: 'lavender',
    label: 'ラベンダー',
    primary: '#a78bfa',
    secondary: '#818cf8',
    accent: '#c084fc',
    light: '#ede9fe',
    pale: '#f5f3ff',
    gradient: 'linear-gradient(135deg, #a78bfa, #818cf8)',
    avatarGradient: 'linear-gradient(135deg, #a78bfa, #c084fc)',
  },
  {
    name: 'sky',
    label: 'スカイ',
    primary: '#38bdf8',
    secondary: '#34d399',
    accent: '#818cf8',
    light: '#e0f2fe',
    pale: '#f0f9ff',
    gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    avatarGradient: 'linear-gradient(135deg, #38bdf8, #34d399)',
  },
  {
    name: 'peach',
    label: 'ピーチ',
    primary: '#fb923c',
    secondary: '#fbbf24',
    accent: '#f87171',
    light: '#ffedd5',
    pale: '#fff7ed',
    gradient: 'linear-gradient(135deg, #fb923c, #f59e0b)',
    avatarGradient: 'linear-gradient(135deg, #fb923c, #fbbf24)',
  },
  {
    name: 'coral',
    label: 'コーラル',
    primary: '#f87171',
    secondary: '#fb923c',
    accent: '#fbbf24',
    light: '#fee2e2',
    pale: '#fef2f2',
    gradient: 'linear-gradient(135deg, #f87171, #fb923c)',
    avatarGradient: 'linear-gradient(135deg, #f87171, #fb923c)',
  },
];

export const DEFAULT_THEME: ThemeName = 'mint';

export function getTheme(name: ThemeName): ThemeConfig {
  return THEMES.find((t) => t.name === name) ?? THEMES[0];
}
