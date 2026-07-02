export type ThemeName = 'mint' | 'sakura' | 'lavender' | 'sky' | 'peach' | 'coral';

export type ThemeConfig = {
  name: ThemeName;
  label: string;
  primary: string; // 400-level — buttons, icons, active state
  mid: string;     // 200-level — borders, chip backgrounds
  light: string;   // 100-level — section backgrounds
  pale: string;    // 50-level  — page tints, focus rings
};

export const THEMES: ThemeConfig[] = [
  { name: 'mint',     label: 'ミント',    primary: '#2dd4bf', mid: '#99f6e4', light: '#ccfbf1', pale: '#f0fdfa' },
  { name: 'sakura',   label: 'さくら',    primary: '#f472b6', mid: '#fbcfe8', light: '#fce7f3', pale: '#fdf2f8' },
  { name: 'lavender', label: 'ラベンダー', primary: '#a78bfa', mid: '#ddd6fe', light: '#ede9fe', pale: '#f5f3ff' },
  { name: 'sky',      label: 'スカイ',    primary: '#38bdf8', mid: '#bae6fd', light: '#e0f2fe', pale: '#f0f9ff' },
  { name: 'peach',    label: 'ピーチ',    primary: '#fb923c', mid: '#fed7aa', light: '#ffedd5', pale: '#fff7ed' },
  { name: 'coral',    label: 'コーラル',  primary: '#f87171', mid: '#fecaca', light: '#fee2e2', pale: '#fef2f2' },
];

export const DEFAULT_THEME: ThemeName = 'mint';

export function getTheme(name: ThemeName): ThemeConfig {
  return THEMES.find((t) => t.name === name) ?? THEMES[0];
}
