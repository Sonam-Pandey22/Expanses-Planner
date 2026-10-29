'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const ThemeContext = createContext<{ dark: boolean; setDark: (dark: boolean) => void } | null>(null);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, updateDark] = useState(false);
  const setDark = useCallback((value: boolean) => {
    updateDark(value);
    document.documentElement.dataset.theme = value ? 'dark' : 'light';
    try { localStorage.setItem('expanse-dark', String(value)); } catch { /* Theme still works when browser storage is unavailable. */ }
  }, []);

  useEffect(() => {
    updateDark(document.documentElement.dataset.theme === 'dark');
    const sync = (event: StorageEvent) => {
      if (event.key !== 'expanse-dark' && event.key !== null) return;
      const value = event.key !== null && event.newValue === 'true';
      updateDark(value);
      document.documentElement.dataset.theme = value ? 'dark' : 'light';
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return <ThemeContext.Provider value={{ dark, setDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme requires ThemeProvider');
  return context;
}
