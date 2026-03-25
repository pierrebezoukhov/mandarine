import { Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

/**
 * Web-only SVG noise texture overlay.
 * Uses feTurbulence fractal noise with theme-aware blend mode and opacity.
 * Light mode: multiply blend at 5% — adds paper grain texture.
 * Dark mode: overlay blend at 4% — adds CRT phosphor noise.
 * Returns null on native (no SVG filter support without heavy libs).
 */
export function NoiseOverlay() {
  const { colors, isDark } = useTheme();
  if (Platform.OS !== 'web') return null;

  const blend = isDark ? 'overlay' : 'multiply';
  const opacity = colors.noiseOpacity;

  // Render raw HTML via dangerouslySetInnerHTML for the SVG filter +
  // positioned overlay div. React Native Web supports this on <div>.
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 9997 }}
      dangerouslySetInnerHTML={{
        __html: `
          <svg width="0" height="0" style="position:absolute">
            <filter id="mandarine-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
          </svg>
          <div style="
            position:fixed;
            top:0;left:0;right:0;bottom:0;
            filter:url(#mandarine-noise);
            opacity:${opacity};
            mix-blend-mode:${blend};
            pointer-events:none;
            width:100vw;
            height:100vh;
          "></div>
        `,
      }}
    />
  );
}
