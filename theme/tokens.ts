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

// ── Font-size scale ───────────────────────────────────────────────────────────
// Perfect Fourth modular scale (ratio 1.333) anchored at base 16 px.
// 8 semantic steps + hanzi (outside prose scale).
export const FS = {
  label:   12,  // section labels, hints, captions, badges
  body:    14,  // body text, subtitles, secondary copy
  ui:      16,  // inputs, buttons, nav controls — base size
  heading: 21,  // sub-headings, card headings
  title:   28,  // screen titles, stat values, display text
  score:   37,  // large numeric / decorative display
  seal:    50,  // session completion seal
  hanzi:   96,  // flashcard Chinese character (outside prose scale)
} as const;

// ── Line-height scale ─────────────────────────────────────────────────────────
// body / ui sizes → 1.5× font-size; heading+ sizes → 1.3× font-size.
export const LH = {
  label:   18,  // 12 × 1.5
  body:    21,  // 14 × 1.5
  ui:      24,  // 16 × 1.5
  heading: 27,  // 21 × 1.3
  title:   36,  // 28 × 1.3
  score:   48,  // 37 × 1.3
  seal:    65,  // 50 × 1.3
} as const;
