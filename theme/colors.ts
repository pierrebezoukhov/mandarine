// ── Color palettes ────────────────────────────────────────────────────────────
// Dual-theme palette: light ("Red Ink on Aged Parchment") and dark ("CRT Terminal").
// Every component reads colors via useTheme() — never import these directly.

export interface ColorTheme {
  // Paper Surface
  bg:             string;
  bgCard:         string;
  bgCard2:        string;
  border:         string;
  borderDim:      string;
  scanline:       string;

  // Red Ink System
  inkRed:         string;
  inkRedDim:      string;
  inkRedGlow:     string;
  inkRedText:     string;

  // Text Hierarchy
  textPrimary:    string;
  textSecondary:  string;
  textFaint:      string;
  textHanzi:      string;

  // Semantic Colors
  green:          string;
  greenBright:    string;
  redBtn:         string;
  redBtnBright:   string;

  // Card Shadows
  cardShadow:     string;
  cardInsetShadow:string;

  // Noise / Grain
  noiseOpacity:   number;

  // ── Backward-compat aliases (remove once migration complete) ──────────────
  accent:         string;
  accentDim:      string;
  accentBorder:   string;
  surface:        string;
  surface2:       string;
  surfaceCard:    string;
  bgDeep:         string;
  borderFocus:    string;
  textMuted:      string;
  error:          string;
  errorDim:       string;
  errorMuted:     string;
  errorBright:    string;
  success:        string;
  successBright:  string;
}

// ── Light palette — "Red Ink on Aged Parchment" ─────────────────────────────

const light = {
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
  textFaint:       '#b0a898',
  textHanzi:       '#1a1610',

  green:           '#2d6e38',
  greenBright:     '#3a8a42',
  redBtn:          '#c45a4e',
  redBtnBright:    '#b8301e',

  cardShadow:      'rgba(120,100,60,0.08)',
  cardInsetShadow: 'rgba(120,100,60,0.06)',

  noiseOpacity:    0.05,
} as const;

// ── Dark palette — "CRT Terminal" ───────────────────────────────────────────

const dark = {
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
  textFaint:       '#4a4438',
  textHanzi:       '#f0e8d8',

  green:           '#3a7a44',
  greenBright:     '#4fa858',
  redBtn:          '#7a1e14',
  redBtnBright:    '#c8382a',

  cardShadow:      'rgba(0,0,0,0.3)',
  cardInsetShadow: 'rgba(0,0,0,0.4)',

  noiseOpacity:    0.04,
} as const;

// ── Alias layer ─────────────────────────────────────────────────────────────
// Maps old T.* token names to new palette keys so existing code keeps working
// during the migration. Remove these once every call-site uses new names.

function withAliases(palette: typeof light | typeof dark): ColorTheme {
  return {
    ...palette,
    // old accent → new ink red system
    accent:        palette.inkRed,
    accentDim:     palette.inkRedGlow,
    accentBorder:  palette.inkRedDim,
    // old surfaces → new bg system
    surface:       palette.bgCard,
    surface2:      palette.bgCard2,
    surfaceCard:   palette.bgCard,
    bgDeep:        palette.bg,
    // old border focus → ink red based
    borderFocus:   palette.inkRed,
    // old text
    textMuted:     palette.textSecondary,
    // old semantic → new semantic
    error:         palette.redBtn,
    errorDim:      palette.inkRedGlow,
    errorMuted:    palette.inkRedDim,
    errorBright:   palette.inkRedText,
    success:       palette.green,
    successBright: palette.greenBright,
  };
}

// ── Exports ─────────────────────────────────────────────────────────────────

export const lightTheme: ColorTheme = withAliases(light);
export const darkTheme:  ColorTheme = withAliases(dark);
