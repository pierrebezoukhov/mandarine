# Typography Refinement Plan

## Summary of changes

1. Kill italic globally
2. Split FS into Display + Body scale groups
3. Add `LS` letter-spacing token export
4. Apply LS semantically; remove ad-hoc overrides
5. Update design-system page

---

## 1 · Kill italic (2 files)

| File | Line | Change |
|---|---|---|
| `app/session.tsx` | ~404 | remove `fontStyle: 'italic'` from `exMeaning` |
| `app/session.tsx` | ~409 | remove `fontStyle: 'italic'` from `meaningText` |
| `app/design-system.tsx` | ITALIC USAGE section | replace with a "No italic — not used" note; remove `italicRuleEm`/`italicSample` italic styles |

---

## 2 · Split FS into two named groups — `theme/tokens.ts`

No import changes anywhere — `FS.*` keeps working. Two new named exports are added alongside the combined one, used only by the design-system page to iterate the two groups separately.

```ts
// Display/Title scale — large, prominent, heading hierarchy
export const FSDisplay = {
  hanzi:   96,  // flashcard character — outside prose scale
  seal:    50,  // session completion seal
  score:   37,  // large numeric display
  title:   28,  // screen titles
  heading: 21,  // sub-headings, card headings
} as const;

// Body/Content scale — readable content, UI controls
export const FSBody = {
  ui:    16,  // inputs, buttons, nav controls — base size
  body:  14,  // body text, subtitles, secondary copy
  label: 12,  // section labels, captions, badges
} as const;

// Combined (backward-compat — all existing FS.* references still work)
export const FS = { ...FSDisplay, ...FSBody } as const;
```

---

## 3 · Add `LS` letter-spacing tokens — `theme/tokens.ts`

Unitless em multipliers. Usage in styles: `letterSpacing: LS.tight * FS.title`

```ts
export const LS = {
  tighter: -0.05,   // FS.score, FS.seal  — large display
  tight:   -0.025,  // FS.heading, FS.title — heading hierarchy
  normal:   0,      // default — no tracking
  loose:    0.025,  // FS.label/body — available for future use
} as const;
```

---

## 4 · Apply LS semantically; remove ad-hoc overrides

### Rule
- `FS.score`, `FS.seal` → `letterSpacing: LS.tighter * FS.score` etc.
- `FS.heading`, `FS.title` → `letterSpacing: LS.tight * FS.heading` etc.
- Everything else → `letterSpacing` removed (defaults to 0)
- **Exception — MONO phonetic/badge text**: pinyin (`letterSpacing: 3`), posTag, hskBadge, exPinyin retain their values since positive tracking is functionally needed for phonetic readability. These are exempted from the zero-elsewhere rule.

### Ad-hoc overrides to remove (non-MONO, non-heading)

| File | Style | Current value | Action |
|---|---|---|---|
| `app/(tabs)/home.tsx` | `logoHanzi` | `letterSpacing: 2` | → `LS.tight * FS.heading` (heading-size) |
| `app/(tabs)/home.tsx` | `logoLabel` | `letterSpacing: 6` | remove (label size, decorative) |
| `app/(tabs)/home.tsx` | `greetSub` | `letterSpacing: 0.5` | remove |
| `app/auth.tsx` | `logoHanzi` | `letterSpacing: 2` | → `LS.tighter * FS.score` (score-size) |
| `app/auth.tsx` | `logoLabel` | `letterSpacing: 6` | remove |
| `app/auth.tsx` | `forgotText` | `letterSpacing: 1` | remove |
| `app/auth.tsx` | `dividerText` | `letterSpacing: 2` | remove |
| `app/auth.tsx` | `backText` | `letterSpacing: 1` | remove |
| `app/profile.tsx` | `avatarHint` | `letterSpacing: 0.5` | remove |
| `app/session-setup.tsx` | `backText` | `letterSpacing: 0.5` | remove |
| `app/session-setup.tsx` | `headerTitle` | `letterSpacing: 0.5` | remove |
| `components/Avatar.tsx` | initials | `letterSpacing: 1` | remove |
| `components/StatCard.tsx` | label | `letterSpacing: 2` | remove |
| `components/Section.tsx` | label | `letterSpacing: 2.5` | remove |
| `components/Field.tsx` | label | `letterSpacing: 2` | remove |
| `components/Field.tsx` | sublabel | `letterSpacing: 0.5` | remove |
| `app/settings.tsx` | (label) | `letterSpacing: 2.5` | remove |

### Add LS where heading/display sizes are used

| File | Style | Font size | Applies |
|---|---|---|---|
| `app/auth.tsx` | `logoHanzi` | `FS.score` | `LS.tighter * FS.score` |
| `app/(tabs)/home.tsx` | `logoHanzi` | `FS.heading` | `LS.tight * FS.heading` |
| `app/(tabs)/home.tsx` | `greetTitle` | `FS.title` | `LS.tight * FS.title` |
| `app/session.tsx` | `hanziText` | `FS.hanzi` | `LS.tighter * FS.hanzi` |
| `app/session.tsx` | `meaningText` | `FS.heading` | `LS.tight * FS.heading` |
| `app/session.tsx` | `sc.title` | `FS.title` | `LS.tight * FS.title` |
| `app/session.tsx` | `sc.statVal` | `FS.score` | `LS.tighter * FS.score` |
| `app/session-setup.tsx` | deck name styles | `FS.heading` | `LS.tight * FS.heading` |
| `components/Card.tsx` | title | `FS.heading` | `LS.tight * FS.heading` |
| `components/StatCard.tsx` | value | `FS.title` | `LS.tight * FS.title` |

---

## 5 · Design-system page — Typography tab

### Current sections → New sections

| Old | New |
|---|---|
| SCALE (single list of 8) | **DISPLAY SCALE** (5 tokens: hanzi→heading) |
| | **BODY SCALE** (3 tokens: ui→label) |
| LINE HEIGHTS — LH | LINE HEIGHTS — LH (unchanged) |
| MONOSPACE — MONO | MONOSPACE — MONO (unchanged) |
| ITALIC USAGE (2 entries) | **No italic** — replaced with a single callout noting italic is not used |
| *(new)* | **LETTER SPACING — LS** section |

### DISPLAY SCALE section
- Iterates `FSDisplay` object
- Shows computed `letterSpacing` values alongside each token (e.g., "tight: −0.70px @ 28px")
- Visual: sample text with actual tracking applied

### BODY SCALE section
- Iterates `FSBody` object
- Shows "tracking: 0" for all entries

### LETTER SPACING section (new)
Rows: token name | em value | computed px at reference size | usage rule

| Token | em | Example (computed) | Applies to |
|---|---|---|---|
| LS.tighter | −0.05em | −1.85px @ FS.score(37) | score, seal |
| LS.tight | −0.025em | −0.70px @ FS.title(28) | heading, title |
| LS.normal | 0em | 0px | all body/UI text |
| LS.loose | +0.025em | +0.35px @ FS.label(12) | available; not currently applied |

---

## Files changed (summary)

| File | Type of change |
|---|---|
| `theme/tokens.ts` | Add `FSDisplay`, `FSBody`, `LS` |
| `app/session.tsx` | Remove italic; apply LS to heading/display; keep MONO tracking |
| `app/auth.tsx` | Apply LS to logoHanzi (score-size); remove ad-hoc LS |
| `app/(tabs)/home.tsx` | Apply LS to title/heading; remove ad-hoc LS |
| `app/session-setup.tsx` | Remove ad-hoc LS |
| `app/profile.tsx` | Remove ad-hoc LS |
| `app/settings.tsx` | Remove ad-hoc LS |
| `components/Card.tsx` | Apply LS to title |
| `components/StatCard.tsx` | Apply LS to value; remove ad-hoc LS from label |
| `components/Section.tsx` | Remove ad-hoc LS from label |
| `components/Field.tsx` | Remove ad-hoc LS |
| `components/Avatar.tsx` | Remove ad-hoc LS |
| `app/design-system.tsx` | Split SCALE into Display+Body; add LS section; remove italic section |
