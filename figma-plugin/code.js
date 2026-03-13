/**
 * Mandarine Flashcard Screens — Figma Plugin
 *
 * Creates 5 native Figma frames (one per colour variation) on the current page.
 * Every element is a real, editable Figma node — text nodes are selectable,
 * colours are token-accurate, and layers are named to match the codebase.
 *
 * How to load:
 *   Figma → Plugins → Development → Import plugin from manifest…
 *   Select figma-plugin/manifest.json, then run the plugin.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

const W = 375;      // frame width  (iPhone viewport)
const H = 812;      // frame height
const GAP = 56;     // horizontal gap between frames

const SANS  = { family: 'Inter', style: 'Regular' };
const SANS_M = { family: 'Inter', style: 'Medium' };
const MONO  = { family: 'Roboto Mono', style: 'Regular' };
const MONO_M = { family: 'Roboto Mono', style: 'Medium' };

// ── Themes ────────────────────────────────────────────────────────────────────

const THEMES = [
  {
    name: 'Current · Cinnabar',
    bg: '#131109', surface2: '#252118',
    border: { hex: '#FFF8DC', o: 0.08 },
    textPrimary: '#F0EBE0', textMuted: '#928A78', textHanzi: '#F5F0E8',
    accent: '#C0392B',
    error: '#E05252',
    errorDim: { hex: '#E05252', o: 0.12 }, errorBorder: { hex: '#E05252', o: 0.25 },
    success: '#4A9E6B',
    successDim: { hex: '#4A9E6B', o: 0.12 }, successBorder: { hex: '#4A9E6B', o: 0.25 },
    exHanzi: '#C8BFA8', exPinyin: '#7A7060', exMeaning: '#8C8070',
  },
  {
    name: 'Amber Terminal',
    bg: '#13100A', surface2: '#262015',
    border: { hex: '#FFF0C8', o: 0.08 },
    textPrimary: '#F2E8D0', textMuted: '#907A58', textHanzi: '#F5EDD8',
    accent: '#C07830',
    error: '#E05252',
    errorDim: { hex: '#E05252', o: 0.12 }, errorBorder: { hex: '#E05252', o: 0.25 },
    success: '#4A9E6B',
    successDim: { hex: '#4A9E6B', o: 0.12 }, successBorder: { hex: '#4A9E6B', o: 0.25 },
    exHanzi: '#C8B898', exPinyin: '#7A6848', exMeaning: '#8C7860',
  },
  {
    name: 'Jade',
    bg: '#131109', surface2: '#252118',
    border: { hex: '#FFF8DC', o: 0.08 },
    textPrimary: '#F0EBE0', textMuted: '#928A78', textHanzi: '#F5F0E8',
    accent: '#3D8B6E',
    error: '#E05252',
    errorDim: { hex: '#E05252', o: 0.12 }, errorBorder: { hex: '#E05252', o: 0.25 },
    success: '#6AB98A',
    successDim: { hex: '#6AB98A', o: 0.12 }, successBorder: { hex: '#6AB98A', o: 0.25 },
    exHanzi: '#C8BFA8', exPinyin: '#7A7060', exMeaning: '#8C8070',
  },
  {
    name: 'Ink & Gold',
    bg: '#0F0D09', surface2: '#211E14',
    border: { hex: '#FFF8DC', o: 0.07 },
    textPrimary: '#F0EBE0', textMuted: '#908870', textHanzi: '#F5F0E8',
    accent: '#A8841F',
    error: '#E05252',
    errorDim: { hex: '#E05252', o: 0.12 }, errorBorder: { hex: '#E05252', o: 0.25 },
    success: '#4A9E6B',
    successDim: { hex: '#4A9E6B', o: 0.12 }, successBorder: { hex: '#4A9E6B', o: 0.25 },
    exHanzi: '#C0B898', exPinyin: '#78704A', exMeaning: '#8A8060',
  },
  {
    name: 'Cold',
    bg: '#0A0F16', surface2: '#161D28',
    border: { hex: '#C8DCFF', o: 0.08 },
    textPrimary: '#E8EEF5', textMuted: '#6A7A8E', textHanzi: '#EEF2F8',
    accent: '#4A7FBE',
    error: '#E05252',
    errorDim: { hex: '#E05252', o: 0.12 }, errorBorder: { hex: '#E05252', o: 0.25 },
    success: '#4A9E6B',
    successDim: { hex: '#4A9E6B', o: 0.12 }, successBorder: { hex: '#4A9E6B', o: 0.25 },
    exHanzi: '#B8C4D0', exPinyin: '#6A7A8A', exMeaning: '#7A8A9A',
  },
];

// ── Colour helpers ────────────────────────────────────────────────────────────

function rgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

// Accepts '#rrggbb' or { hex, o } (hex + opacity).
function paint(c) {
  if (typeof c === 'string') return [{ type: 'SOLID', color: rgb(c) }];
  return [{ type: 'SOLID', color: rgb(c.hex), opacity: c.o }];
}

// ── Node helpers ──────────────────────────────────────────────────────────────

function rect(parent, { name, x, y, w, h, fill, stroke, corner = 0 }) {
  const r = figma.createRectangle();
  r.name = name;
  r.x = x; r.y = y;
  r.resize(w, h);
  r.cornerRadius = corner;
  r.fills  = fill  ? paint(fill)  : [];
  r.strokes = stroke ? paint(stroke) : [];
  if (stroke) r.strokeWeight = 1;
  parent.appendChild(r);
  return r;
}

function ellipse(parent, { name, cx, cy, r, fill, stroke }) {
  const e = figma.createEllipse();
  e.name = name;
  e.resize(r * 2, r * 2);
  e.x = cx - r; e.y = cy - r;
  e.fills  = fill  ? paint(fill)  : [];
  e.strokes = stroke ? paint(stroke) : [];
  if (stroke) e.strokeWeight = 1;
  parent.appendChild(e);
  return e;
}

// Creates a text node auto-sized to content, centred at (cx, y).
// For left-aligned nodes just pass x instead of cx.
function text(parent, { name, chars, font, size, color, opacity = 1,
                         ls, cx, x, y, align = 'LEFT' }) {
  const t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.fontSize = size;
  if (ls !== undefined) t.letterSpacing = { value: ls, unit: 'PIXELS' };
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = chars;

  const hex = typeof color === 'object' ? color.hex : color;
  const op  = typeof color === 'object' ? color.o   : opacity;
  t.fills = [{ type: 'SOLID', color: rgb(hex), opacity: op }];

  t.textAlignHorizontal = align;
  t.x = cx !== undefined ? Math.round(cx - t.width / 2) : x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

// Mixed-colour text: chars is a string, ranges is [{start,end,color}].
function mixedText(parent, { name, chars, font, size, ls, ranges, cx, x, y }) {
  const t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.fontSize = size;
  if (ls !== undefined) t.letterSpacing = { value: ls, unit: 'PIXELS' };
  t.textAutoResize = 'WIDTH_AND_HEIGHT';
  t.characters = chars;
  for (const { start, end, color } of ranges) {
    t.setRangeFills(start, end, paint(color));
  }
  t.x = cx !== undefined ? Math.round(cx - t.width / 2) : x;
  t.y = y;
  parent.appendChild(t);
  return t;
}

// ── Screen builder ────────────────────────────────────────────────────────────

async function buildScreen(t, xOffset) {
  const cx = W / 2;

  // Frame
  const frame = figma.createFrame();
  frame.name = `Flashcard — ${t.name}`;
  frame.resize(W, H);
  frame.x = xOffset; frame.y = 0;
  frame.fills = paint(t.bg);
  frame.cornerRadius = 40;
  frame.clipsContent = true;

  // ── TOP BAR ────────────────────────────────────────────────────────────────
  text(frame, { name: 'nav/close', chars: '✕', font: SANS, size: 20,
    color: t.textMuted, cx: 28, y: 57 });

  rect(frame, { name: 'progress/track', x: 56, y: 67, w: 210, h: 4,
    fill: t.surface2, corner: 2 });

  rect(frame, { name: 'progress/fill', x: 56, y: 67, w: 84 /* 8/20 = 40% */, h: 4,
    fill: { hex: t.accent, o: 0.7 }, corner: 2 });

  // "8 / 20" — "8" in primary, " / 20" in muted
  mixedText(frame, {
    name: 'progress/counter',
    chars: '8 / 20', font: MONO, size: 12, ls: 0,
    ranges: [
      { start: 0, end: 1, color: t.textPrimary },
      { start: 1, end: 6, color: t.textMuted },
    ],
    x: 278, y: 59,
  });

  text(frame, { name: 'nav/back', chars: '‹', font: SANS, size: 24,
    color: t.textMuted, cx: W - 28, y: 54 });

  // ── SCORE STRIP ────────────────────────────────────────────────────────────
  // "✕  2   ·   5  ✓"
  //  0123  456789A  BCDE   (hex for lengths)
  //  [0,4) = error, [4,11) = muted, [11,15) = success
  mixedText(frame, {
    name: 'score/strip',
    chars: '✕  2   ·   5  ✓', font: MONO, size: 14, ls: 0.5,
    ranges: [
      { start: 0,  end: 4,  color: t.error },
      { start: 4,  end: 11, color: t.textMuted },
      { start: 11, end: 15, color: t.success },
    ],
    cx, y: 103,
  });

  // ── HSK BADGE ──────────────────────────────────────────────────────────────
  rect(frame, { name: 'badge/bg', x: 297, y: 142, w: 56, h: 22,
    stroke: t.border, corner: 11 });

  text(frame, { name: 'badge/label', chars: 'HSK 1', font: MONO, size: 10,
    color: t.textMuted, ls: 1.5, cx: 325, y: 150 });

  // ── HANZI ──────────────────────────────────────────────────────────────────
  text(frame, { name: 'card/hanzi', chars: '学', font: SANS, size: 96,
    color: t.textHanzi, ls: -4.8, cx, y: 236 });

  // ── PINYIN ─────────────────────────────────────────────────────────────────
  text(frame, { name: 'card/pinyin', chars: 'xué', font: MONO, size: 21,
    color: { hex: t.accent, o: 0.85 }, ls: 3, cx, y: 350 });

  // ── DIVIDER ────────────────────────────────────────────────────────────────
  rect(frame, { name: 'divider', x: cx - 12, y: 392, w: 24, h: 1,
    fill: t.border });

  // ── EXAMPLE ────────────────────────────────────────────────────────────────
  text(frame, { name: 'example/hanzi', chars: '我在学中文', font: SANS, size: 21,
    color: t.exHanzi, cx, y: 406 });

  text(frame, { name: 'example/pinyin', chars: 'wǒ zài xué zhōngwén',
    font: MONO, size: 12, color: t.exPinyin, ls: 1, cx, y: 434 });

  text(frame, { name: 'example/meaning', chars: "I'm studying Chinese",
    font: SANS, size: 14, color: t.exMeaning, cx, y: 460 });

  // ── CARD MEANING ───────────────────────────────────────────────────────────
  text(frame, { name: 'card/pos', chars: 'VERB', font: MONO_M, size: 12,
    color: t.textMuted, ls: 2, cx, y: 496 });

  text(frame, { name: 'card/meaning', chars: 'to study; to learn',
    font: SANS, size: 21, color: t.textPrimary, ls: -0.5, cx, y: 522 });

  // ── HINT ───────────────────────────────────────────────────────────────────
  text(frame, { name: 'hint', chars: 'fully revealed', font: MONO, size: 12,
    color: { hex: t.textMuted, o: 0.6 }, ls: 1.5, cx, y: 672 });

  // ── FAB: FORGOT ────────────────────────────────────────────────────────────
  ellipse(frame, { name: 'fab/forgot-bg',
    cx: 70, cy: 730, r: 30, fill: t.errorDim, stroke: t.errorBorder });
  text(frame, { name: 'fab/forgot-icon', chars: '✕', font: SANS, size: 21,
    color: t.error, cx: 70, y: 718 });

  // ── FAB: GOT ───────────────────────────────────────────────────────────────
  ellipse(frame, { name: 'fab/got-bg',
    cx: W - 70, cy: 730, r: 30, fill: t.successDim, stroke: t.successBorder });
  text(frame, { name: 'fab/got-icon', chars: '✓', font: SANS, size: 21,
    color: t.success, cx: W - 70, y: 718 });

  return frame;
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  // Load every font we'll use before touching any text node.
  await Promise.all([
    figma.loadFontAsync(SANS),
    figma.loadFontAsync(SANS_M),
    figma.loadFontAsync(MONO),
    figma.loadFontAsync(MONO_M),
  ]);

  const frames = [];
  for (let i = 0; i < THEMES.length; i++) {
    const frame = await buildScreen(THEMES[i], i * (W + GAP));
    frames.push(frame);
  }

  // Select all frames and zoom to them.
  figma.currentPage.selection = frames;
  figma.viewport.scrollAndZoomIntoView(frames);

  figma.closePlugin(`✓ Created ${frames.length} flashcard frames`);
}

main().catch(err => figma.closePlugin('✗ ' + err.message));
