// ── ASCII Iconography ─────────────────────────────────────────────────────────
// Pure text characters — no SVG icon sets. All icons are rendered in monospace
// font and inherit their color from semantic context.

export const Icon = {
  close:     '\u2715',   // ✕
  next:      '\u203A',   // ›
  ornament:  '+',        // +
  dropdown:  '\u25BE',   // ▾
  audio:     '\u266A',   // ♪
  separator: '\u00B7',   // ·
  correct:   '\u2713',   // ✓
  repeat:    '\u21BA',   // ↺
  left:      '\u2190',   // ←
  right:     '\u2192',   // →

  // Navigation tabs
  study:     '\u5B66',   // 学
  search:    '\u627E',   // 找
  stories:   '\u8BFB',   // 读

  // Search
  prompt:    '>_',       // terminal prompt
} as const;
