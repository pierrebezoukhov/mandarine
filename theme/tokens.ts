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
// Single source of truth for font sizes. Use FS.x everywhere instead of
// raw numeric literals in StyleSheet.
export const FS = {
  micro:   9,   // logo tagline, tiny badges
  label:   10,  // section labels, stat labels
  hint:    11,  // inline hints, chip sublabels, avatar hint
  caption: 12,  // metadata, session info rows
  note:    13,  // secondary scores, auth footer
  body:    14,  // standard body text, email, subtitles
  input:   15,  // text inputs, buttons
  ui:      16,  // screen headers, nav controls
  sub:     18,  // sub-headings, score items
  heading: 22,  // card icons, auth logo small
  title:   26,  // auth headings
  logo:    32,  // auth logo large hanzi
  stat:    28,  // stat card values
  display: 30,  // home greeting
  score:   40,  // session end score number
  seal:    48,  // session completion seal
  hanzi:   96,  // main flashcard character
} as const;
