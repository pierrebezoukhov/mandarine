#!/usr/bin/env node
/**
 * generate-figma-screens.js
 *
 * Produces one SVG per colour-variation of the flashcard session screen.
 * Drag the SVGs into Figma — they import as editable vector frames.
 *
 * Usage:  node scripts/generate-figma-screens.js
 * Output: figma-exports/flashcard-{variation}.svg
 */

const fs = require('fs');
const path = require('path');

// ── Themes ───────────────────────────────────────────────────────────────────

const themes = {
  current: {
    name: 'Current (Cinnabar)',
    bg:           '#131109',
    surface2:     '#252118',
    border:       { hex: '#FFF8DC', opacity: 0.08 },
    textPrimary:  '#F0EBE0',
    textSecondary:'#A09880',
    textMuted:    '#928A78',
    textHanzi:    '#F5F0E8',
    accent:       '#C0392B',
    accentDim:    { hex: '#C0392B', opacity: 0.12 },
    accentBorder: { hex: '#C0392B', opacity: 0.28 },
    error:        '#E05252',
    errorDim:     { hex: '#E05252', opacity: 0.12 },
    errorBorder:  { hex: '#E05252', opacity: 0.25 },
    success:      '#4A9E6B',
    successDim:   { hex: '#4A9E6B', opacity: 0.12 },
    successBorder:{ hex: '#4A9E6B', opacity: 0.25 },
    exHanzi:      '#C8BFA8',
    exPinyin:     '#7A7060',
    exMeaning:    '#8C8070',
    hanziShadow:  { hex: '#F0EBE0', opacity: 0.06 },
  },

  amber: {
    name: 'Amber Terminal',
    bg:           '#13100A',
    surface2:     '#262015',
    border:       { hex: '#FFF0C8', opacity: 0.08 },
    textPrimary:  '#F2E8D0',
    textSecondary:'#A89870',
    textMuted:    '#907A58',
    textHanzi:    '#F5EDD8',
    accent:       '#C07830',
    accentDim:    { hex: '#C07830', opacity: 0.12 },
    accentBorder: { hex: '#C07830', opacity: 0.28 },
    error:        '#E05252',
    errorDim:     { hex: '#E05252', opacity: 0.12 },
    errorBorder:  { hex: '#E05252', opacity: 0.25 },
    success:      '#4A9E6B',
    successDim:   { hex: '#4A9E6B', opacity: 0.12 },
    successBorder:{ hex: '#4A9E6B', opacity: 0.25 },
    exHanzi:      '#C8B898',
    exPinyin:     '#7A6848',
    exMeaning:    '#8C7860',
    hanziShadow:  { hex: '#F2E8D0', opacity: 0.06 },
  },

  jade: {
    name: 'Jade',
    bg:           '#131109',
    surface2:     '#252118',
    border:       { hex: '#FFF8DC', opacity: 0.08 },
    textPrimary:  '#F0EBE0',
    textSecondary:'#A09880',
    textMuted:    '#928A78',
    textHanzi:    '#F5F0E8',
    accent:       '#3D8B6E',
    accentDim:    { hex: '#3D8B6E', opacity: 0.12 },
    accentBorder: { hex: '#3D8B6E', opacity: 0.28 },
    error:        '#E05252',
    errorDim:     { hex: '#E05252', opacity: 0.12 },
    errorBorder:  { hex: '#E05252', opacity: 0.25 },
    success:      '#6AB98A',
    successDim:   { hex: '#6AB98A', opacity: 0.12 },
    successBorder:{ hex: '#6AB98A', opacity: 0.25 },
    exHanzi:      '#C8BFA8',
    exPinyin:     '#7A7060',
    exMeaning:    '#8C8070',
    hanziShadow:  { hex: '#F0EBE0', opacity: 0.06 },
  },

  gold: {
    name: 'Ink and Gold',
    bg:           '#0F0D09',
    surface2:     '#211E14',
    border:       { hex: '#FFF8DC', opacity: 0.07 },
    textPrimary:  '#F0EBE0',
    textSecondary:'#A09878',
    textMuted:    '#908870',
    textHanzi:    '#F5F0E8',
    accent:       '#A8841F',
    accentDim:    { hex: '#A8841F', opacity: 0.12 },
    accentBorder: { hex: '#A8841F', opacity: 0.28 },
    error:        '#E05252',
    errorDim:     { hex: '#E05252', opacity: 0.12 },
    errorBorder:  { hex: '#E05252', opacity: 0.25 },
    success:      '#4A9E6B',
    successDim:   { hex: '#4A9E6B', opacity: 0.12 },
    successBorder:{ hex: '#4A9E6B', opacity: 0.25 },
    exHanzi:      '#C0B898',
    exPinyin:     '#78704A',
    exMeaning:    '#8A8060',
    hanziShadow:  { hex: '#F0EBE0', opacity: 0.05 },
  },

  cold: {
    name: 'Cold',
    bg:           '#0A0F16',
    surface2:     '#161D28',
    border:       { hex: '#C8DCFF', opacity: 0.08 },
    textPrimary:  '#E8EEF5',
    textSecondary:'#8A9AAE',
    textMuted:    '#6A7A8E',
    textHanzi:    '#EEF2F8',
    accent:       '#4A7FBE',
    accentDim:    { hex: '#4A7FBE', opacity: 0.12 },
    accentBorder: { hex: '#4A7FBE', opacity: 0.28 },
    error:        '#E05252',
    errorDim:     { hex: '#E05252', opacity: 0.12 },
    errorBorder:  { hex: '#E05252', opacity: 0.25 },
    success:      '#4A9E6B',
    successDim:   { hex: '#4A9E6B', opacity: 0.12 },
    successBorder:{ hex: '#4A9E6B', opacity: 0.25 },
    exHanzi:      '#B8C4D0',
    exPinyin:     '#6A7A8A',
    exMeaning:    '#7A8A9A',
    hanziShadow:  { hex: '#C8DCFF', opacity: 0.05 },
  },
};

// ── Card data for the mockup ─────────────────────────────────────────────────

const card = {
  hanzi: '学',
  pinyin: 'xué',
  hskLevel: 1,
  exHanzi: '我在学中文',
  exPinyin: 'wǒ zài xué zhōngwén',
  exMeaning: 'I\'m studying Chinese',
  pos: 'VERB',
  meaning: 'to study; to learn',
};

const progress = { current: 8, total: 20 };
const score = { forgot: 2, got: 5 };

// ── SVG dimensions ───────────────────────────────────────────────────────────

const W = 375;
const H = 812;
const SAFE_TOP = 54;
const MONO = "'SF Mono', 'Menlo', 'Consolas', monospace";
const SANS = "-apple-system, 'Helvetica Neue', sans-serif";

// ── SVG generator ────────────────────────────────────────────────────────────

function generateSVG(t) {
  const fillOpacity = (c) =>
    typeof c === 'object' ? `fill="${c.hex}" fill-opacity="${c.opacity}"` : `fill="${c}"`;
  const strokeOpacity = (c) =>
    typeof c === 'object' ? `stroke="${c.hex}" stroke-opacity="${c.opacity}"` : `stroke="${c}"`;

  // Progress bar calculations
  const barX = 56;
  const barW = 210;
  const barFill = Math.round(barW * (progress.current / progress.total));

  // Vertical layout anchors
  const topBarY = SAFE_TOP;
  const scoreY = topBarY + 50;
  const hskBadgeY = scoreY + 38;
  const hanziY = 320;
  const pinyinY = hanziY + 48;
  const dividerY = pinyinY + 28;
  const exHanziY = dividerY + 24;
  const exPinyinY = exHanziY + 26;
  const exMeaningY = exPinyinY + 28;
  const posY = exMeaningY + 34;
  const meaningY = posY + 26;
  const hintY = 680;
  const fabY = 730;
  const cx = W / 2;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
     xmlns="http://www.w3.org/2000/svg">

  <!-- ═══ ${t.name} ═══ -->

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${t.bg}" rx="40"/>

  <!-- ── Top bar ── -->
  <g>
    <!-- Close button -->
    <text x="28" y="${topBarY + 18}" font-family="${SANS}" font-size="21"
          fill="${t.textMuted}" text-anchor="middle">✕</text>

    <!-- Progress track -->
    <rect x="${barX}" y="${topBarY + 12}" width="${barW}" height="4" rx="2"
          fill="${t.surface2}"/>
    <!-- Progress fill -->
    <rect x="${barX}" y="${topBarY + 12}" width="${barFill}" height="4" rx="2"
          fill="${t.accent}" fill-opacity="0.7"/>

    <!-- Progress counter -->
    <text x="${barX + barW + 12}" y="${topBarY + 18}" font-family="${MONO}" font-size="12">
      <tspan fill="${t.textPrimary}">${progress.current}</tspan>
      <tspan fill="${t.textMuted}"> / ${progress.total}</tspan>
    </text>

    <!-- Back button -->
    <text x="${W - 28}" y="${topBarY + 20}" font-family="${SANS}" font-size="24"
          fill="${t.textMuted}" text-anchor="middle">‹</text>
  </g>

  <!-- ── Score strip ── -->
  <g>
    <text x="${cx}" y="${scoreY + 14}" font-family="${MONO}" font-size="14"
          text-anchor="middle" letter-spacing="0.5">
      <tspan fill="${t.error}">✕  ${score.forgot}</tspan>
      <tspan fill="${t.textMuted}">   ·   </tspan>
      <tspan fill="${t.success}">${score.got}  ✓</tspan>
    </text>
  </g>

  <!-- ── HSK badge ── -->
  <g>
    <rect x="${W - 78}" y="${hskBadgeY}" width="56" height="22" rx="11"
          fill="none" ${strokeOpacity(t.border)} stroke-width="1"/>
    <text x="${W - 50}" y="${hskBadgeY + 15}" font-family="${MONO}" font-size="10"
          fill="${t.textMuted}" text-anchor="middle" letter-spacing="1.5">HSK ${card.hskLevel}</text>
  </g>

  <!-- ── Hanzi character ── -->
  <text x="${cx}" y="${hanziY}" font-family="${SANS}" font-size="96"
        fill="${t.textHanzi}" text-anchor="middle"
        letter-spacing="-4.8">${card.hanzi}</text>

  <!-- ── Pinyin ── -->
  <text x="${cx}" y="${pinyinY}" font-family="${MONO}" font-size="21"
        fill="${t.accent}" fill-opacity="0.85" text-anchor="middle"
        letter-spacing="3">${card.pinyin}</text>

  <!-- ── Example divider ── -->
  <line x1="${cx - 12}" y1="${dividerY}" x2="${cx + 12}" y2="${dividerY}"
        ${strokeOpacity(t.border)} stroke-width="1"/>

  <!-- ── Example hanzi ── -->
  <text x="${cx}" y="${exHanziY}" font-family="${SANS}" font-size="21"
        fill="${t.exHanzi}" text-anchor="middle">${card.exHanzi}</text>

  <!-- ── Example pinyin ── -->
  <text x="${cx}" y="${exPinyinY}" font-family="${MONO}" font-size="12"
        fill="${t.exPinyin}" text-anchor="middle"
        letter-spacing="1">${card.exPinyin}</text>

  <!-- ── Example meaning ── -->
  <text x="${cx}" y="${exMeaningY}" font-family="${SANS}" font-size="14"
        fill="${t.exMeaning}" text-anchor="middle">${card.exMeaning}</text>

  <!-- ── Part of speech ── -->
  <text x="${cx}" y="${posY}" font-family="${MONO}" font-size="12"
        fill="${t.textMuted}" text-anchor="middle"
        letter-spacing="2" font-weight="500">${card.pos}</text>

  <!-- ── Meaning ── -->
  <text x="${cx}" y="${meaningY}" font-family="${SANS}" font-size="21"
        fill="${t.textPrimary}" text-anchor="middle"
        letter-spacing="-0.525">${card.meaning}</text>

  <!-- ── Tap hint ── -->
  <text x="${cx}" y="${hintY}" font-family="${MONO}" font-size="12"
        fill="${t.textMuted}" fill-opacity="0.6" text-anchor="middle"
        letter-spacing="1.5">fully revealed</text>

  <!-- ── FAB: Forgot ── -->
  <g>
    <circle cx="70" cy="${fabY}" r="30"
            ${fillOpacity(t.errorDim)} ${strokeOpacity(t.errorBorder)} stroke-width="1"/>
    <text x="70" y="${fabY + 7}" font-family="${SANS}" font-size="21"
          fill="${t.error}" text-anchor="middle">✕</text>
  </g>

  <!-- ── FAB: Got it ── -->
  <g>
    <circle cx="${W - 70}" cy="${fabY}" r="30"
            ${fillOpacity(t.successDim)} ${strokeOpacity(t.successBorder)} stroke-width="1"/>
    <text x="${W - 70}" y="${fabY + 7}" font-family="${SANS}" font-size="21"
          fill="${t.success}" text-anchor="middle">✓</text>
  </g>

  <!-- ── Variation label (for reference in Figma) ── -->
  <text x="${cx}" y="${H - 20}" font-family="${MONO}" font-size="10"
        fill="${t.textMuted}" fill-opacity="0.4" text-anchor="middle"
        letter-spacing="2">${t.name.toUpperCase()}</text>

</svg>`;
}

// ── Write files ──────────────────────────────────────────────────────────────

const outDir = path.join(__dirname, '..', 'figma-exports');
fs.mkdirSync(outDir, { recursive: true });

for (const [key, theme] of Object.entries(themes)) {
  const filename = `flashcard-${key}.svg`;
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, generateSVG(theme), 'utf-8');
  console.log(`  ✓ ${filename}`);
}

console.log(`\n  ${Object.keys(themes).length} screens written to figma-exports/`);
console.log('  → Drag them into Figma to import as editable vector frames.\n');
