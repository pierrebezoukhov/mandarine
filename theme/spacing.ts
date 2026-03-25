// ── Spacing scale ─────────────────────────────────────────────────────────────
// Named spacing constants — use in components and new screens for consistency.
// Existing screens may still use raw numbers; migrate incrementally.

export const space = {
  xs:      4,
  sm:      8,
  md:     12,
  lg:     16,
  xl:     20,
  xxl:    24,
  xxxl:   32,
  huge:   40,
  giant:  48,
  massive: 64,
} as const;

// ── Border-radius scale ───────────────────────────────────────────────────────
// Everything uses square corners by default. Only the bottom-sheet modal
// retains rounded corners for visual separation from the overlay.
export const radius = {
  modal: 20,  // bottom-sheet corners
} as const;
