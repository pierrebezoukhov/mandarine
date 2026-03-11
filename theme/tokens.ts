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
// Display / Title scale — large, prominent, heading hierarchy.
export const FSDisplay = {
  hanzi:   96,  // flashcard character — outside prose scale
  seal:    50,  // session completion seal
  score:   37,  // large numeric display
  title:   28,  // screen titles
  heading: 21,  // sub-headings, card headings
} as const;

// Body / Content scale — readable content, UI controls.
export const FSBody = {
  ui:    16,  // inputs, buttons, nav controls — base size
  body:  14,  // body text, subtitles, secondary copy
  label: 12,  // section labels, captions, badges
} as const;

// Combined — all existing FS.* references continue to work unchanged.
export const FS = { ...FSDisplay, ...FSBody } as const;

// ── Letter-spacing scale ──────────────────────────────────────────────────────
// Unitless em multipliers. Usage: letterSpacing: LS.tight * FS.title
//
//   FS.score, FS.seal, FS.hanzi  → LS.tighter  (large display, dense tracking)
//   FS.heading, FS.title         → LS.tight     (heading hierarchy)
//   FS.ui, FS.body, FS.label     → LS.normal    (no tracking — default)
//
// EXCEPTIONS: MONO phonetic / badge text keeps its positive tracking
// (pinyin, hskBadge, posTag, exPinyin) since it aids phonetic readability.
export const LS = {
  tighter: -0.05,   // score / seal / hanzi  — large display
  tight:   -0.025,  // title / heading        — heading hierarchy
  normal:   0,      // body / UI text         — default
  loose:    0.025,  // available; not currently applied
} as const;

// ── Font-weight scale ─────────────────────────────────────────────────────────
// Three values only. FW.regular is the system default and rarely written
// explicitly in code — only FW.medium and FW.semibold appear in stylesheets.
//
//   FW.semibold → screen headings, component names, nav bar labels
//   FW.medium   → interactive controls (Button, Chip, Tab), list primary labels
//   FW.regular  → prose, subtitles, captions, metadata (default; omit from style)
//
// Rule of thumb: size signals priority · weight signals interactivity · color signals role.
export const FW = {
  regular:  '400' as const,  // default prose — omit in styles, rely on system default
  medium:   '500' as const,  // interactive / list primary
  semibold: '600' as const,  // headings / titles / prominent labels
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
