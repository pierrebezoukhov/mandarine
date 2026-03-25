import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorTheme, lightTheme, darkTheme } from '@/theme/colors';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ColorTheme;
  mode:   ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'hanziflash_theme_mode';

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  // Resolve effective theme
  const isDark = mode === 'system'
    ? systemScheme !== 'light' // default to dark if system preference unknown
    : mode === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  // Don't render children until we've loaded the stored preference,
  // otherwise we'd flash the wrong theme on startup.
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
