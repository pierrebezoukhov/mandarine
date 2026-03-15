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
  bgDeep:       '#0c0b09',      // session screen — darker than global bg
  surface:      '#1e1b12',
  surface2:     '#252118',
  surfaceCard:  '#111008',      // explicit card container in session

  // Borders
  border:       'rgba(255,248,220,0.08)',
  borderFocus:  'rgba(255,248,220,0.22)',

  // Text
  textPrimary:  '#F0EBE0',
  textSecondary:'#A09880',
  textMuted:    '#928A78',
  textHanzi:    '#f0e8d8',      // warm parchment for hero character
  textFaint:    '#4a4438',      // ultra-low-emphasis (tap hints, ornaments)

  // Accent (red)
  accent:       '#C0392B',
  accentDim:    'rgba(192,57,43,0.12)',
  accentBorder: 'rgba(192,57,43,0.28)',

  // Semantic
  error:        '#E05252',
  success:      '#3a7a44',      // darker green — better contrast on dark bg
} as const;

// ── Typography helpers ────────────────────────────────────────────────────────
// Serif — Noto Serif SC for Hanzi display (loaded via expo-font in _layout.tsx)
export const SERIF: string = Platform.OS === 'web'
  ? '"Noto Serif SC", "STSong", serif'
  : 'NotoSerifSC-Light';

// Monospace — IBM Plex Mono for session labels, counters, pinyin (loaded via expo-font)
export const MONO: string = Platform.OS === 'web'
  ? '"IBM Plex Mono", monospace'
  : 'IBMPlexMono-Regular';
export const MONO_MEDIUM: string = Platform.OS === 'web'
  ? '"IBM Plex Mono", monospace'
  : 'IBMPlexMono-Medium';

// ── Font-size scale ───────────────────────────────────────────────────────────
//
// Two independent mathematical scales + one manual override:
//
//   DISPLAY — Perfect Fourth (1.333) from 16px base
//     Used for screen headings, deck names, navigation context.
//     Provides editorial weight without competing with the flashcard hero character.
//
//   BODY — Major Third (1.250) from 16px base
//     Used for flashcard text roles (pinyin, translation, example sentence).
//     1.250 keeps enough contrast between 4 learning levels without dropping
//     below the 12px Chinese-character legibility floor on mobile.
//
//   CHARACTER — Manual override, NOT derived from either scale
//     The Chinese character is the product being learned, not a heading.
//     96px in Noto Serif SC Light ensures it is the unambiguous primary stimulus.

// Display / Title scale — Perfect Fourth (1.333), heading hierarchy.
export const FSDisplay = {
  hanzi:      108, // flashcard hero character — manual override, outside scales (serif display)
  seal:       50,  // session completion seal — decorative, outside scales
  score:      42,  // large numeric display — same as title for visual parity
  title:      42,  // screen titles / H1 — 16 × 1.333³
  heading:    32,  // deck names, H2  — 16 × 1.333²
  subheading: 21,  // sub-headings, card headings — 16 × 1.333¹
} as const;

// Body / Content scale — Major Third (1.250), readable content + UI controls.
export const FSBody = {
  pinyin: 20,  // pinyin romanization — 16 × 1.250¹
  ui:     16,  // inputs, buttons, nav controls — base size
  body:   16,  // body text, translations — base size
  label:  13,  // example sentences, captions, section labels — 16 ÷ 1.250
} as const;

// Combined — all existing FS.* references continue to work unchanged.
// NOTE: FSDisplay.score was removed — use FSDisplay.title for large numerics.
export const FS = { ...FSDisplay, ...FSBody } as const;

// ── Letter-spacing scale ──────────────────────────────────────────────────────
// Unitless em multipliers. Usage: letterSpacing: LS.tight * FS.title
//
//   FS.score, FS.seal, FS.hanzi       → LS.tighter  (large display, dense tracking)
//   FS.heading, FS.title, FS.subheading → LS.tight   (heading hierarchy)
//   FS.ui, FS.body, FS.label          → LS.normal    (no tracking — default)
//
// EXCEPTIONS: MONO phonetic / badge text keeps its positive tracking
// (pinyin, hskBadge, posTag, exPinyin) since it aids phonetic readability.
// Positive tracking on pinyin is a pedagogical choice: learners parse
// syllable-by-syllable ("zhōng" + "guó"), and air between syllables
// aligns with that parsing behaviour.
export const LS = {
  tighter: -0.05,   // score / seal / hanzi  — large display
  tight:   -0.025,  // title / heading        — heading hierarchy
  normal:   0,      // body / UI text         — default
  loose:    0.025,  // available; not currently applied
} as const;

// ── Font-weight scale ─────────────────────────────────────────────────────────
// Four values — no bold (700). Bold thickens Chinese character strokes,
// reducing white space between strokes and degrading legibility at display sizes.
// Semibold (600) adds heading emphasis without muddy stroke rendering.
//
//   FW.light    → serif Hanzi display only — thin strokes for elegance
//   FW.semibold → screen headings, component names, nav bar labels
//   FW.medium   → interactive controls (Button, Chip, Tab), list primary labels
//   FW.regular  → prose, subtitles, captions, pinyin (default; omit)
//
// The hero character MUST be regular weight — learners should see strokes as
// they appear in normal reading. Adding weight teaches a visual form that
// doesn't transfer to real-world text.
//
// Rule of thumb: size signals priority · weight signals interactivity · color signals role.
export const FW = {
  light:    '300' as const,  // serif Hanzi display — thin strokes for elegance
  regular:  '400' as const,  // default prose — omit in styles, rely on system default
  medium:   '500' as const,  // interactive / list primary
  semibold: '600' as const,  // headings / titles / prominent labels
} as const;

// ── Line-height scale ─────────────────────────────────────────────────────────
// All values on 4 px grid. Ratio tapers as size grows — generous for small
// text (multi-line readability), tight for large display (single lines).
// Chinese characters fill the full em square, so these ratios are calibrated
// for CJK-primary text. Latin-only lines will feel slightly airy — acceptable.
//
//   label        13 / 20  → 1.54  (small text, multi-line examples)
//   body / ui    16 / 24  → 1.50  (prose, inputs, buttons)
//   pinyin       20 / 28  → 1.40  (phonetic annotations)
//   subheading   21 / 28  → 1.33  (sub-headings start to tighten)
//   heading      32 / 40  → 1.25  (deck names, H2)
//   title/score  42 / 48  → 1.14  (screen titles, large numerics)
//   seal         50 / 56  → 1.12  (display-size decorative)
//   hanzi        108 / 120 → 1.11  (hero character, serif display)
export const LH = {
  label:      20,
  body:       24,
  ui:         24,
  pinyin:     28,
  subheading: 28,
  heading:    40,
  title:      48,
  score:      48,
  seal:       56,
  hanzi:      120,
} as const;
