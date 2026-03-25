import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface ScanlinesProps {
  /** Override the scanline color. Defaults to theme scanline token. */
  color?: string;
  /** Pixel gap between scanlines. Default: 3 */
  gap?: number;
}

/**
 * Web-only scanline / paper-grain overlay.
 * In dark mode: CRT-style scanlines (cool, faint).
 * In light mode: warm paper-grain stripes.
 * Returns null on native — the effect is too subtle to warrant the perf cost.
 */
export function Scanlines({ color, gap = 3 }: ScanlinesProps) {
  const { colors } = useTheme();
  if (Platform.OS !== 'web') return null;

  const c = color ?? colors.scanline;

  return (
    <View
      pointerEvents="none"
      style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        // @ts-expect-error — web-only CSS property
        backgroundImage: `repeating-linear-gradient(0deg, ${c} 0px, ${c} 1px, transparent 1px, transparent ${gap + 1}px)`,
      }}
    />
  );
}
