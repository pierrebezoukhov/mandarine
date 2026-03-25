import { Platform } from 'react-native';

// ── Colour tokens ─────────────────────────────────────────────────────────────
// DEPRECATED: Use `useTheme()` from `@/context/ThemeContext` instead.
// This static export is the dark palette only and exists for backward compat
// during the migration to dual-theme support. It will be removed once all
// screens and components have been converted to `useTheme()`.
//
// New code should import: import { useTheme } from '@/context/ThemeContext';
// and use: const { colors } = useTheme();

import { darkTheme } from '@/theme/colors';
export const T = darkTheme;

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

// ── Font-size tokens ────────────────────────────────────────────────────────
// Role-based values from the design spec. Grouped by function, not by
// mathematical ratio. Sizes were chosen by the designer for visual hierarchy
// — each value is tuned to its specific text role.

// Display — large, structural hierarchy
export const FSDisplay = {
  hanzi:      108,  // flashcard hero character (Noto Serif SC, weight 300)
  formTitle:   24,  // form/screen headings (MONO, uppercase, weight 500)
} as const;

// Content — readable text, UI controls, labels
export const FSContent = {
  pinyin:       18,  // pinyin romanization (MONO, italic, inkRedText)
  definition:   15,  // card meaning/translation text (MONO, weight 300)
  input:        14,  // form input text (MONO, weight 400)
  body:         13,  // body secondary, descriptions, subtitles
  ctaLabel:     12,  // primary CTA button labels (MONO, uppercase, weight 500)
  progress:     12,  // progress counter, example translation
  exPinyin:     11,  // example sentence pinyin (MONO, italic)
  label:        10,  // form labels, dividers, section headers (uppercase)
  micro:         9,  // tap hints, rating button labels (uppercase)
} as const;

// Backward compat alias
export const FSBody = FSContent;

// Combined — all FS.* references work
export const FS = { ...FSDisplay, ...FSContent } as const;

// ── Letter-spacing scale ──────────────────────────────────────────────────────
// Unitless em multipliers. Usage: letterSpacing: LS.wide * FS.definition
//
//   FS.hanzi           → LS.tighter  (large display, dense tracking)
//   FS.body, FS.input  → LS.normal   (no tracking — default)
//
// EXCEPTIONS: MONO phonetic / badge text keeps its positive tracking
// (pinyin, hskBadge, posTag, exPinyin) since it aids phonetic readability.
// Positive tracking on pinyin is a pedagogical choice: learners parse
// syllable-by-syllable ("zhōng" + "guó"), and air between syllables
// aligns with that parsing behaviour.
export const LS = {
  tighter:   -0.02,   // hanzi display
  normal:     0,      // default
  subtle:     0.01,   // subtitles
  wide:       0.04,   // definition text, body, oauth buttons
  progress:   0.05,   // progress counters
  example:    0.06,   // example hanzi, example pinyin
  wider:      0.08,   // pinyin, score labels
  cta:        0.12,   // CTA button labels
  widest:     0.14,   // button labels, form labels
  divider:    0.16,   // divider text, hint triggers
  ultrawide:  0.18,   // uppercase card labels (POS · HSK level)
  extreme:    0.22,   // micro text ("Tap to reveal")
} as const;

// ── Font-weight scale ─────────────────────────────────────────────────────────
// Three values — no bold (700) or semibold (600). Bold thickens Chinese
// character strokes, reducing white space between strokes and degrading
// legibility at display sizes.
//
//   FW.light    → serif Hanzi display only — thin strokes for elegance
//   FW.medium   → interactive controls (Button, Chip, Tab), headings, titles
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
  medium:   '500' as const,  // interactive / headings / titles / prominent labels
} as const;

// ── Line-height ratios ──────────────────────────────────────────────────────
// Simple multipliers applied as: lineHeight: fontSize * LH.normal
// Matches the design spec's approach (1.0, 1.2, 1.5).
export const LH = {
  single:   1.0,   // single-line: buttons, counters, scores, pinyin, labels
  tight:    1.2,   // form titles, headings
  normal:   1.5,   // multi-line body, definitions, example sentences
} as const;
