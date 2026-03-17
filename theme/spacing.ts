// ── Spacing scale ─────────────────────────────────────────────────────────────
// Named spacing constants — use in components and new screens for consistency.
// Existing screens may still use raw numbers; migrate incrementally.

export const space = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  xxl:   24,
  xxxl:  28,
  huge:  36,
  giant: 48,
} as const;

// ── Border-radius scale ───────────────────────────────────────────────────────
export const radius = {
  square: 4,  // session rating buttons — minimal rounding
  sm:    8,   // icon buttons
  md:    10,  // segmented controls, search inputs
  lg:    12,  // inputs, chips, card icons
  input: 12,  // alias: text inputs
  card:  16,  // action cards
  modal: 20,  // bottom-sheet corners
  pill:  100, // primary CTA buttons
} as const;
