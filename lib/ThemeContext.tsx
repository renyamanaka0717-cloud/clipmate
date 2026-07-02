'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { THEMES, ThemeName, ThemeConfig, DEFAULT_THEME, getTheme } from './theme';

type ThemeContextType = {
  theme: ThemeConfig;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'clipmate-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (saved && THEMES.find((t) => t.name === saved)) {
      setThemeName(saved);
    }
  }, []);

  useEffect(() => {
    const t = getTheme(themeName);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primary);
    root.style.setProperty('--color-primary-light', t.light);
    root.style.setProperty('--color-primary-pale', t.pale);
    root.style.setProperty('--color-gradient', t.gradient);
    localStorage.setItem(STORAGE_KEY, themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ theme: getTheme(themeName), themeName, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
