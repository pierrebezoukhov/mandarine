import { Platform } from 'react-native';

// ── Colour tokens ─────────────────────────────────────────────────────────────
// Single source of truth — import T from here in every screen and component.
// Previously each screen had its own copy; all conflicts have been resolved:
//   - accentDim:    0.12 (was 0.10 in session-setup)
//   - border:       0.08 (was 0.07 in session)
//   - error/success: canonical names (session used 'again'/'good')
//   - textHanzi:    now global (was session-only)

export const T = {
  // Backgrounds
  bg:           '#131109',
  surface:      '#1e1b12',
  surface2:     '#252118',

  // Borders
  border:       'rgba(255,248,220,0.08)',
  borderFocus:  'rgba(255,248,220,0.22)',

  // Text
  textPrimary:  '#F0EBE0',
  textSecondary:'#A09880',
  textMuted:    '#5C5646',
  textHanzi:    '#F5F0E8',

  // Accent (red)
  accent:       '#C0392B',
  accentDim:    'rgba(192,57,43,0.12)',
  accentBorder: 'rgba(192,57,43,0.28)',

  // Semantic
  error:        '#E05252',
  success:      '#4A9E6B',
} as const;

// ── Typography helpers ────────────────────────────────────────────────────────
export const MONO: string =
  Platform.OS === 'ios' ? 'Menlo' : Platform.OS === 'android' ? 'monospace' : 'monospace';
