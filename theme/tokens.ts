import { Platform } from 'react-native';

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

// Inconsolata — primary UI font for flashcard session (replaces IBM Plex Mono on card)
export const INCONSOLATA: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Regular';
export const INCONSOLATA_LIGHT: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Light';
export const INCONSOLATA_MEDIUM: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Medium';

// ── Font-size tokens — 5-tier scale ─────────────────────────────────────────
// Consolidated from 11 sizes to 5. Each tier has a single role-based value.
// Hierarchy within a tier is created by opacity and weight, not by size.

export const FS = {
  // Display — hero elements
  display:    76,   // hero hanzi character (Noto Serif SC, weight 300)

  // Large — secondary focal point
  large:      22,   // example sentence hanzi (Noto Serif SC, weight 300)

  // Body — readable text
  body:       13,   // pinyin, english meaning, example pinyin (Inconsolata)

  // Small — supporting text
  small:      10,   // score strip, example english, ♪ icon, top bar icons

  // Micro — decorative / metadata
  micro:       8,   // HSK badge, POS tag, tap hint, corner ornaments

  // Legacy aliases — used by screens outside session.tsx
  // These map old token names to the new scale for backward compat.
  // Remove as other screens migrate.
  hanzi:      76,   // → display
  formTitle:  24,   // unchanged — used by session-setup, home, auth
  pinyin:     13,   // → body
  definition: 13,   // → body
  input:      14,   // unchanged — used by form fields
  body13:     13,   // → body (renamed to avoid collision with body)
  ctaLabel:   12,   // unchanged — used by Button component
  progress:   12,   // unchanged — used outside session
  exPinyin:   13,   // → body (was 11)
  label:      10,   // → small
  micro8:      8,   // → micro (renamed to avoid collision)
} as const;

// Legacy named exports — kept for backward compat (type references, spreads)
export const FSDisplay = {
  hanzi:     FS.hanzi,
  formTitle: FS.formTitle,
} as const;

export const FSContent = {
  pinyin:     FS.pinyin,
  definition: FS.definition,
  input:      FS.input,
  body:       FS.body13,
  ctaLabel:   FS.ctaLabel,
  progress:   FS.progress,
  exPinyin:   FS.exPinyin,
  label:      FS.label,
  micro:      FS.micro8,
} as const;

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
