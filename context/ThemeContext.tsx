import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorTheme, lightTheme, darkTheme } from '@/theme/colors';
import { HanziFontId, DEFAULT_HANZI_FONT, resolveHanziFontFamily } from '@/theme/fonts';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ColorTheme;
  mode:   ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  fonts: { hanzi: string; hanziWeight: string };
  hanziFontId: HanziFontId;
  setHanziFont: (id: HanziFontId) => void;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = 'hanziflash_theme_mode';
const FONT_STORAGE_KEY = 'hanziflash_hanzi_font';

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hanziFontId, setHanziFontIdState] = useState<HanziFontId>(DEFAULT_HANZI_FONT);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(THEME_STORAGE_KEY),
      AsyncStorage.getItem(FONT_STORAGE_KEY),
    ]).then(([storedTheme, storedFont]) => {
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        setModeState(storedTheme);
      }
      if (storedFont) {
        setHanziFontIdState(storedFont as HanziFontId);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const setHanziFont = useCallback((id: HanziFontId) => {
    setHanziFontIdState(id);
    AsyncStorage.setItem(FONT_STORAGE_KEY, id);
  }, []);

  // Resolve effective theme
  const isDark = mode === 'system'
    ? systemScheme !== 'light' // default to dark if system preference unknown
    : mode === 'dark';

  const colors = isDark ? darkTheme : lightTheme;

  const fonts = useMemo(() => {
    const { family, weight } = resolveHanziFontFamily(hanziFontId);
    return { hanzi: family, hanziWeight: weight };
  }, [hanziFontId]);

  // Don't render children until we've loaded the stored preference,
  // otherwise we'd flash the wrong theme on startup.
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, mode, isDark, setMode, fonts, hanziFontId, setHanziFont }}>
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
