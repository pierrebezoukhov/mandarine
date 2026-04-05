#!/usr/bin/env node
// ── Generate Tokens Studio JSON for Figma ────────────────────────────────────
// Outputs: figma-exports/tokens.json
//
// Canonical sources (keep in sync):
//   theme/colors.ts   — light + dark color palettes
//   theme/tokens.ts   — FS, FW, LS, LH typography tokens
//   theme/spacing.ts  — space + radius scales
//   theme/fonts.ts    — hanzi font definitions
//
// Usage:
//   node scripts/generate-figma-tokens.js
//   # Then import figma-exports/tokens.json into Tokens Studio for Figma

const fs = require('fs');
const path = require('path');

// ── Inlined token values ─────────────────────────────────────────────────────
// Duplicated from TypeScript sources because those import react-native Platform.

const lightColors = {
  bg:              '#f5f0e6',
  bgCard:          '#faf6ed',
  bgCard2:         '#f0ebe0',
  border:          '#d4c9b8',
  borderDim:       '#e0d8cc',
  scanline:        'rgba(120,100,60,0.03)',
  inkRed:          '#b8301e',
  inkRedDim:       '#c45a4e',
  inkRedGlow:      'rgba(184,48,30,0.12)',
  inkRedText:      '#a82818',
  textPrimary:     '#2a241a',
  textSecondary:   '#6b6050',
  textFaint:       '#887a68',
  textHanzi:       '#1a1610',
  textOnAccent:    '#faf6ed',
  green:           '#2d6e38',
  greenBright:     '#3a8a42',
  greenDim:        'rgba(45,110,56,0.08)',
  redBtn:          '#c45a4e',
  redBtnBright:    '#b8301e',
  forgotBtnHover:  'rgba(184,48,30,0.16)',
  gotBtnHover:     'rgba(45,110,56,0.16)',
  gotGlow:         'rgba(45,110,56,0.2)',
  overlay:         'rgba(0,0,0,0.6)',
  cardShadow:      'rgba(120,100,60,0.08)',
  cardInsetShadow: 'rgba(120,100,60,0.06)',
  noiseOpacity:    0.05,
};

const darkColors = {
  bg:              '#0c0b09',
  bgCard:          '#111008',
  bgCard2:         '#161410',
  border:          '#2a2620',
  borderDim:       '#1e1c18',
  scanline:        'rgba(255,240,200,0.018)',
  inkRed:          '#c8382a',
  inkRedDim:       '#7a1e14',
  inkRedGlow:      'rgba(200,56,42,0.18)',
  inkRedText:      '#e04030',
  textPrimary:     '#e8e0d0',
  textSecondary:   '#8a8070',
  textFaint:       '#6b6055',
  textHanzi:       '#f0e8d8',
  textOnAccent:    '#f0e8d8',
  green:           '#3a7a44',
  greenBright:     '#4fa858',
  greenDim:        'rgba(58,122,68,0.12)',
  redBtn:          '#7a1e14',
  redBtnBright:    '#c8382a',
  forgotBtnHover:  'rgba(122,30,20,0.25)',
  gotBtnHover:     'rgba(58,122,68,0.25)',
  gotGlow:         'rgba(58,122,68,0.2)',
  overlay:         'rgba(0,0,0,0.6)',
  cardShadow:      'rgba(0,0,0,0.3)',
  cardInsetShadow: 'rgba(0,0,0,0.4)',
  noiseOpacity:    0.04,
};

const space = {
  xs:      4,
  sm:      8,
  md:      12,
  lg:      16,
  xl:      20,
  xxl:     24,
  xxxl:    32,
  huge:    40,
  giant:   48,
  massive: 64,
};

const borderRadius = {
  modal: 20,
};

const fontSize = {
  hanzi:      108,
  formTitle:  24,
  pinyin:     18,
  definition: 15,
  input:      14,
  body:       13,
  ctaLabel:   12,
  progress:   12,
  exPinyin:   11,
  label:      10,
  micro:      9,
};

const fontWeight = {
  light:   '300',
  regular: '400',
  medium:  '500',
};

// em multipliers → percentage for Tokens Studio
const letterSpacing = {
  tighter:   -2,
  normal:     0,
  subtle:     1,
  wide:       4,
  progress:   5,
  example:    6,
  wider:      8,
  cta:        12,
  widest:     14,
  divider:    16,
  ultrawide:  18,
  extreme:    22,
};

const lineHeight = {
  single: 100,
  tight:  120,
  normal: 150,
};

const fontFamilies = {
  serif:     'Noto Serif SC',
  mono:      'IBM Plex Mono',
};

const hanziFonts = {
  'hanzi-lxgw-wenkai':    'LXGW WenKai Screen',
  'hanzi-noto-serif':     'Noto Serif SC',
  'hanzi-noto-sans':      'Noto Sans SC',
  'hanzi-ma-shan-zheng':  'Ma Shan Zheng',
  'hanzi-harmonyos-sans': 'HarmonyOS Sans',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function rgbaToHex8(str) {
  if (typeof str !== 'string') return str;
  const m = str.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)$/);
  if (!m) return str; // already hex or other format
  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  const hex = (c) => c.toString(16).padStart(2, '0');
  const alpha = Math.round(a * 255);
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(alpha)}`;
}

const colorDescriptions = {
  bg:              'Main page background. Used on root screen containers and behind all content.',
  bgCard:          'Card surface fill. Used on flashcard faces, form containers, and elevated panels.',
  bgCard2:         'Secondary card/input background. Used on form inputs (Field), chips, and nested surfaces.',
  border:          'Primary border color. Used on card edges, input outlines, and divider lines.',
  borderDim:       'Subtle border color. Used on secondary dividers and inactive input borders.',
  scanline:        'Decorative scanline overlay color. Used by the Scanlines component for the CRT/parchment effect.',
  inkRed:          'Primary brand accent. Used on Button fills, active tab indicators, ProgressBar fills, and primary CTAs.',
  inkRedDim:       'Muted red accent. Used on secondary/hover states of red elements and inactive red buttons.',
  inkRedGlow:      'Red glow/halo effect. Used as box-shadow or background behind inkRed elements for emphasis.',
  inkRedText:      'Red text color. Used specifically on pinyin text and red-colored inline text (not on backgrounds).',
  textPrimary:     'Primary text color. Used on body text, headings, card definitions, and form input values.',
  textSecondary:   'Secondary text color. Used on subtitles, descriptions, helper text, and less prominent labels.',
  textFaint:       'Faint/hint text color. Used on placeholders, tap hints, disabled labels, and tertiary information.',
  textHanzi:       'Hanzi character text color. Used exclusively on the hero flashcard character (108px display).',
  textOnAccent:    'Text on colored backgrounds. Used on Button labels, badges, and any text placed over inkRed or green fills.',
  green:           'Success/correct color. Used on "Got it" buttons, correct answer indicators, and positive feedback.',
  greenBright:     'Bright success color. Used on hover/active state of green buttons and highlighted success states.',
  greenDim:        'Subtle green background. Used as background tint behind "Got it" buttons and success regions.',
  redBtn:          'Red button color. Used on "Forgot" button fill and negative/destructive secondary actions.',
  redBtnBright:    'Bright red button color. Used on hover/active state of "Forgot" buttons.',
  forgotBtnHover:  'Forgot button hover background. Used as background tint on hover for the "Forgot" rating button.',
  gotBtnHover:     'Got it button hover background. Used as background tint on hover for the "Got it" rating button.',
  gotGlow:         'Green glow effect. Used as shadow/halo behind "Got it" button when active or focused.',
  overlay:         'Modal overlay backdrop. Used behind BottomSheetModal and any fullscreen overlay/dialog.',
  cardShadow:      'Card drop shadow color. Used as the box-shadow color on Card components for elevation.',
  cardInsetShadow: 'Card inset shadow color. Used as inner shadow on pressed/recessed card states.',
  noiseOpacity:    'NoiseOverlay intensity. Controls the opacity of the paper grain texture overlay per theme.',
};

function buildColorSet(palette) {
  const colors = {};
  const opacity = {};
  for (const [key, value] of Object.entries(palette)) {
    const desc = colorDescriptions[key];
    if (typeof value === 'number') {
      const token = { $type: 'number', $value: value };
      if (desc) token.$description = desc;
      opacity[key] = token;
    } else {
      const token = { $type: 'color', $value: rgbaToHex8(value) };
      if (desc) token.$description = desc;
      colors[key] = token;
    }
  }
  return { color: colors, opacity };
}

// ── Build token sets ─────────────────────────────────────────────────────────

const globalSet = {
  spacing: {},
  borderRadius: {},
  fontFamily: {},
  fontSize: {},
  fontWeight: {},
  letterSpacing: {},
  lineHeight: {},
};

for (const [k, v] of Object.entries(space)) {
  globalSet.spacing[k] = { $type: 'dimension', $value: `${v}px` };
}

for (const [k, v] of Object.entries(borderRadius)) {
  globalSet.borderRadius[k] = { $type: 'dimension', $value: `${v}px` };
}

for (const [k, v] of Object.entries({ ...fontFamilies, ...hanziFonts })) {
  globalSet.fontFamily[k] = { $type: 'fontFamily', $value: v };
}

for (const [k, v] of Object.entries(fontSize)) {
  globalSet.fontSize[k] = { $type: 'dimension', $value: `${v}px` };
}

for (const [k, v] of Object.entries(fontWeight)) {
  globalSet.fontWeight[k] = { $type: 'fontWeight', $value: v };
}

for (const [k, v] of Object.entries(letterSpacing)) {
  globalSet.letterSpacing[k] = { $type: 'dimension', $value: `${v}%` };
}

for (const [k, v] of Object.entries(lineHeight)) {
  globalSet.lineHeight[k] = { $type: 'number', $value: `${v}%` };
}

// ── Assemble final output ────────────────────────────────────────────────────

const tokens = {
  global: globalSet,
  'theme/light': buildColorSet(lightColors),
  'theme/dark': buildColorSet(darkColors),
  $themes: [
    {
      id: 'light',
      name: 'Light — Red Ink on Aged Parchment',
      selectedTokenSets: {
        global: 'enabled',
        'theme/light': 'enabled',
        'theme/dark': 'disabled',
      },
    },
    {
      id: 'dark',
      name: 'Dark — CRT Terminal',
      selectedTokenSets: {
        global: 'enabled',
        'theme/light': 'disabled',
        'theme/dark': 'enabled',
      },
    },
  ],
  $metadata: {
    tokenSetOrder: ['global', 'theme/light', 'theme/dark'],
  },
};

// ── Write ────────────────────────────────────────────────────────────────────

const outDir = path.join(__dirname, '..', 'figma-exports');
fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'tokens.json');
fs.writeFileSync(outPath, JSON.stringify(tokens, null, 2) + '\n');

console.log(`Wrote ${outPath}`);
console.log(`  Token sets: global, theme/light, theme/dark`);
console.log(`  Themes: Light, Dark`);
console.log(`\nImport into Figma via Tokens Studio plugin → Load from file.`);
