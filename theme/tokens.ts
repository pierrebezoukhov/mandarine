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
// All values on 4 px grid. Ratio tapers as size grows — loose for small text,
// tight for large display — rather than a flat multiplier across all sizes.
//
//   label   12 / 18  → 1.50  (small labels need generous leading)
//   body    14 / 20  → 1.43  (readable prose, just under 1.5)
//   ui      16 / 24  → 1.50  (inputs / buttons, matches label rhythm)
//   heading 21 / 28  → 1.33  (sub-headings start to tighten)
//   title   28 / 36  → 1.29  (screen titles, tighter still)
//   score   37 / 44  → 1.19  (large numerics, minimal leading needed)
//   seal    50 / 56  → 1.12  (display-size text, nearly cap-height only)
export const LH = {
  label:   18,
  body:    20,
  ui:      24,
  heading: 28,
  title:   36,
  score:   44,
  seal:    56,
} as const;
