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

  // Text on Accent
  textOnAccent:   string;

  // Semantic Colors
  green:          string;
  greenBright:    string;
  greenDim:       string;
  redBtn:         string;
  redBtnBright:   string;

  // Rating button hover states
  forgotBtnHover: string;
  gotBtnHover:    string;
  gotGlow:        string;

  // Terminal Scholar — warm button palette
  forgotBtn:       string;
  forgotBtnBorder: string;
  gotBtn:          string;
  gotBtnBorder:    string;
  scoreForgot:     string;
  scoreGot:        string;
  scoreRemaining:  string;

  // Card flash feedback
  flashForgotBorder: string;
  flashForgotGlow:   string;
  flashForgotInset:  string;
  flashGotBorder:    string;
  flashGotGlow:      string;
  flashGotInset:     string;

  // Card surface (dark elevation)
  cardElevation:    string;
  cardHairline:     string;

  // Opacity scale — used for text hierarchy within the card
  opPinyin:         number;
  opMeaning:        number;
  opExampleEnglish: number;
  opDecorative:     number;
  opScoreColor:     number;
  opHskBadge:       number;
  opOrnament:       number;

  // Divider
  dividerSubtle:    string;

  // Overlay
  overlay:        string;

  // Card Shadows
  cardShadow:     string;
  cardInsetShadow:string;

  // Noise / Grain
  noiseOpacity:   number;
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

  forgotBtn:       'rgba(168,40,24,0.6)',
  forgotBtnBorder: 'rgba(168,40,24,0.25)',
  gotBtn:          'rgba(45,110,56,0.6)',
  gotBtnBorder:    'rgba(45,110,56,0.25)',
  scoreForgot:     'rgba(168,40,24,0.70)',
  scoreGot:        'rgba(45,110,56,0.70)',
  scoreRemaining:  'rgba(42,36,26,0.50)',

  flashForgotBorder: 'rgba(168,40,24,1.0)',
  flashForgotGlow:   'rgba(168,40,24,0.4)',
  flashForgotInset:  'rgba(168,40,24,0.1)',
  flashGotBorder:    'rgba(45,110,56,1.0)',
  flashGotGlow:      'rgba(45,110,56,0.4)',
  flashGotInset:     'rgba(45,110,56,0.1)',

  cardElevation:    'rgba(0,0,0,0)',
  cardHairline:     'rgba(0,0,0,0)',

  opPinyin:         0.65,
  opMeaning:        0.58,
  opExampleEnglish: 0.30,
  opDecorative:     0.12,
  opScoreColor:     0.70,
  opHskBadge:       0.20,
  opOrnament:       0.12,

  dividerSubtle:    'rgba(42,36,26,0.04)',

  overlay:         'rgba(0,0,0,0.6)',

  cardShadow:      'rgba(120,100,60,0.08)',
  cardInsetShadow: 'rgba(120,100,60,0.06)',

  noiseOpacity:    0.05,
} as const;

// ── Dark palette — "CRT Terminal" ───────────────────────────────────────────

const dark = {
  bg:              '#0c0b09',
  bgCard:          '#131210',
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

  forgotBtn:       'rgba(180,120,70,0.7)',
  forgotBtnBorder: 'rgba(180,120,70,0.3)',
  gotBtn:          'rgba(140,160,100,0.7)',
  gotBtnBorder:    'rgba(140,160,100,0.3)',
  scoreForgot:     'rgba(180,120,70,0.75)',
  scoreGot:        'rgba(140,160,100,0.75)',
  scoreRemaining:  'rgba(232,224,208,0.50)',

  flashForgotBorder: 'rgba(180,120,70,1.0)',
  flashForgotGlow:   'rgba(180,120,70,0.5)',
  flashForgotInset:  'rgba(180,120,70,0.15)',
  flashGotBorder:    'rgba(140,160,100,1.0)',
  flashGotGlow:      'rgba(140,160,100,0.5)',
  flashGotInset:     'rgba(140,160,100,0.15)',

  cardElevation:    'rgba(0,0,0,0.5)',
  cardHairline:     'rgba(232,224,208,0.04)',

  opPinyin:         0.55,
  opMeaning:        0.55,
  opExampleEnglish: 0.30,
  opDecorative:     0.15,
  opScoreColor:     0.75,
  opHskBadge:       0.30,
  opOrnament:       0.20,

  dividerSubtle:    'rgba(232,224,208,0.06)',

  overlay:         'rgba(0,0,0,0.6)',

  cardShadow:      'rgba(0,0,0,0.3)',
  cardInsetShadow: 'rgba(0,0,0,0.4)',

  noiseOpacity:    0.04,
} as const;

// ── Exports ─────────────────────────────────────────────────────────────────

export const lightTheme: ColorTheme = light;
export const darkTheme:  ColorTheme = dark;
