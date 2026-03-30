# Terminal Scholar — Flashcard Composition Redesign

**Date:** 2026-03-30
**Status:** Approved
**Scope:** Full card redesign for `app/session.tsx` flashcard screen

## Overview

Redesign the flashcard composition to amplify the app's unique terminal/scholarly identity through typography, spacing, and structure — not through literal CRT textures on every surface. The card becomes a clean reading surface where the terminal feel emerges from the monospace font, corner ornaments, and information hierarchy.

## Design Principles

1. **Metaphorical terminal** — the feel comes from typography and structure, not scanlines on every surface
2. **Two focal points** — hero hanzi and example sentence hanzi dominate; everything else recedes
3. **5-size type scale** — consolidate from 11 sizes to 5 to reduce visual noise
4. **Opacity as hierarchy** — same-size text elements are differentiated by opacity and weight, not by introducing new sizes or colors
5. **No italic** — all pinyin upright for readability (tone diacritics āáǎà are clearer without italic)

## Typography

### Fonts

| Font | Role | Change |
|------|------|--------|
| **Noto Serif SC** (weight 300) | Hanzi — hero character and example sentence | No change |
| **Inconsolata** (weights 300, 400, 500) | All non-Chinese text: pinyin, meaning, labels, score strip, hints | **Replaces IBM Plex Mono** |
| **IBM Plex Mono** (weight 400) | Rating button icons only (`×` U+00D7, `✓` U+2713) | **Retained for buttons only** — these Unicode glyphs render at matched visual weight in this font |

### Type Scale — 5 sizes

| Token | Size | Used for |
|-------|------|----------|
| **Display** | 76px | Hero hanzi only |
| **Large** | 22px | Example sentence hanzi only |
| **Body** | 13px | Pinyin, english meaning, example pinyin |
| **Small** | 10px | Score strip, example english, ♪ icon, top bar icons |
| **Micro** | 8px | HSK badge, POS tag (V), tap hint, corner ornaments |

### Weight Map

| Element | Weight |
|---------|--------|
| Hero hanzi | 300 (Noto Serif SC light) |
| Example hanzi | 300 (Noto Serif SC light) |
| **Hero pinyin** | **500** (Inconsolata medium) |
| English meaning | 400 (Inconsolata regular) |
| Example pinyin | 400 (Inconsolata regular) |
| All other text | 400 |

### Opacity Map — Dark Mode

Base text color: `#e8e0d0` (existing `textPrimary` token)

| Element | Size | Weight | Opacity | Effective |
|---------|------|--------|---------|-----------|
| Hero hanzi | 76px | 300 | 1.0 | `#f0e8d8` (existing `textHanzi`) |
| Hero pinyin | 13px | 500 | 0.55 | ~5.0:1 contrast — AA pass |
| English meaning | 13px | 400 | 0.55 | ~5.0:1 — AA pass |
| Example hanzi | 22px | 300 | 1.0 | `#e8e0d0` (textPrimary) |
| Example pinyin | 13px | 400 | 0.55 | ~5.0:1 — AA pass |
| Example english | 10px | 400 | 0.30 | ~2.0:1 — below AA, intentionally tertiary |
| Score forgot/got | 10px | 400 | 0.75 | AA-adjacent for small text |
| Score remaining | 10px | 400 | 0.50 | Intentionally secondary |
| HSK badge | 8px | 400 | 0.30 | Decorative |
| POS tag (V) | 8px | 400 | 0.15 | Decorative — findable only if you look |
| Tap hint | 8px | 400 | 0.15 | Decorative |
| Corner ornaments | 8px | 400 | 0.20 | Decorative |

### Opacity Map — Light Mode

Base text color: `#2a241a` (existing `textPrimary` token)

| Element | Size | Weight | Opacity |
|---------|------|--------|---------|
| Hero hanzi | 76px | 300 | 1.0 (`#1a1610`, existing `textHanzi`) |
| Hero pinyin | 13px | 500 | 0.65 |
| English meaning | 13px | 400 | 0.58 |
| Example hanzi | 22px | 300 | 1.0 (`#2a241a`) |
| Example pinyin | 13px | 400 | 0.58 |
| Example english | 10px | 400 | 0.30 |
| Score forgot/got | 10px | 400 | 0.70-0.80 |
| Score remaining | 10px | 400 | 0.50 |
| HSK badge | 8px | 400 | 0.20 |
| POS tag (V) | 8px | 400 | 0.12 |
| Tap hint | 8px | 400 | 0.12 |
| Corner ornaments | 8px | 400 | 0.12 |

## Card Layout

### Content Order (top to bottom within card)

1. **Hero hanzi** — 76px, centered, Noto Serif SC 300, ink-red glow (`text-shadow`)
2. **Hero pinyin** — 13px, centered, Inconsolata 500, ♪ audio icon (10px) trailing
3. **POS tag** — 8px, left-aligned, single letter (V/N/A), uppercase, 1px gap to meaning below
4. **English meaning** — 13px, left-aligned, Inconsolata 400, dot-separated if multiple (`to study  ·  to learn`)
5. **Divider** — 1px horizontal rule, separates definition block from example
6. **Example hanzi** — 22px, left-aligned, Noto Serif SC 300
7. **Example pinyin** — 13px, left-aligned, Inconsolata 400
8. **Example english** — 10px, left-aligned, low opacity
9. **Tap hint** — 8px, centered, `tap · pinyin` / `tap · meaning`

### POS Tag

- Single letter abbreviation: V (verb), N (noun), A (adjective), etc.
- 8px, uppercase, wide letter-spacing (2px)
- Sits directly above english meaning with only 1px vertical gap — reads as a label for the definition
- Opacity: 0.15 dark / 0.12 light — nearly invisible unless you look for it

### Card Surface

**Dark mode:**
- Background: `#131210` (slightly lighter than page `#0c0b09`)
- No visible border
- Elevation shadow: `0 2px 16px rgba(0,0,0,0.5)`
- Hairline: `0 0 0 1px rgba(232,224,208,0.04)`
- No scanlines inside the card — clean reading surface

**Light mode:**
- Background: `#faf6ed` (existing `bgCard` on page `#f5f0e6`)
- No shadow, no border
- Card defined purely by the color step + corner ornaments

### Corner Ornaments

- Characters: `┌─` (top-left) and `─┘` (bottom-right) — unchanged
- Size: 8px (micro tier)
- Opacity: 0.20 dark / 0.12 light

### HSK Badge

- Position: absolute, top-right of card
- Text: `HSK {level}`
- Size: 8px (micro tier), letter-spacing 1.5px
- Opacity: 0.30 dark / 0.20 light

## Rating Buttons

### Shape
- 64px × 64px square
- 1px border, no fill, no texture, no scanlines
- Icons: `×` (U+00D7) and `✓` (U+2713) at 20px in **IBM Plex Mono** (unchanged from current implementation)

### Colors — Dark Mode

Button base colors: warm amber / sage

| Button | Icon color | Border color |
|--------|-----------|--------------|
| Forgot (×) | `rgba(180,120,70,0.7)` | `rgba(180,120,70,0.3)` |
| Got (✓) | `rgba(140,160,100,0.7)` | `rgba(140,160,100,0.3)` |

Score strip colors: forgot `rgba(180,120,70,0.75)`, got `rgba(140,160,100,0.75)`, remaining `rgba(232,224,208,0.50)`.

### Colors — Light Mode

Button base colors: existing theme ink-red / forest green

| Button | Icon color | Border color |
|--------|-----------|--------------|
| Forgot (×) | `rgba(168,40,24,0.6)` | `rgba(168,40,24,0.25)` |
| Got (✓) | `rgba(45,110,56,0.6)` | `rgba(45,110,56,0.25)` |

Score strip colors: forgot `rgba(168,40,24,0.70)`, got `rgba(45,110,56,0.70)`, remaining `rgba(42,36,26,0.50)`.

### Hover/Press States

Adapted to new button shape and colors:

**Button hover (web only):**
- Border brightens to full opacity of the button's base color
- Subtle glow: `box-shadow: 0 0 12px` using the button's base color at ~0.3 opacity
- Background: button base color at ~0.10 opacity (light tinted fill)
- No scanlines inside buttons (removed)

**Button press:**
- `scale(0.98)` feedback — unchanged

### Card Flash Feedback

The animated border+glow overlay on the card uses the **new button palette**, not the old theme red/green:

**Dark mode flash:**
| Result | Border color | Glow |
|--------|-------------|------|
| Forgot | `rgba(180,120,70,1.0)` | `0 0 30px rgba(180,120,70,0.5), inset 0 0 20px rgba(180,120,70,0.15)` |
| Got | `rgba(140,160,100,1.0)` | `0 0 30px rgba(140,160,100,0.5), inset 0 0 20px rgba(140,160,100,0.15)` |

**Light mode flash:**
| Result | Border color | Glow |
|--------|-------------|------|
| Forgot | `rgba(168,40,24,1.0)` | `0 0 30px rgba(168,40,24,0.4), inset 0 0 20px rgba(168,40,24,0.1)` |
| Got | `rgba(45,110,56,1.0)` | `0 0 30px rgba(45,110,56,0.4), inset 0 0 20px rgba(45,110,56,0.1)` |

The flash animation timing is unchanged: `flashAnim` fades from 1→0 over `dk.flashDuration` (default 600ms).

## Reveal Stages — Unchanged

The 3-stage progressive reveal is preserved:

1. **Stage 0:** Hero hanzi only. Tap hint reads `tap · pinyin`
2. **Stage 1:** Pinyin appears (spring animation). Tap hint reads `tap · meaning`
3. **Stage 2:** POS + english meaning + divider + example sentence appear (staggered spring animation). Tap hint fades.

All existing animation parameters (DialKit `entranceDamping`, `revealStiffness`, `staggerDelay`, etc.) are preserved.

## What Changes vs Current Implementation

| Aspect | Current | New |
|--------|---------|-----|
| Monospace font | IBM Plex Mono everywhere | **Inconsolata** everywhere except button icons |
| Pinyin style | Italic, ink-red color | **Upright, weight 500**, neutral color at opacity |
| POS tag | Separate line, `VERB`, wide | **Single letter `V`**, 8px, above english, 1px gap |
| English meaning | 15px, own row | **13px**, same row group as POS |
| Example hanzi | 18px (FSContent.formTitle) | **22px** — promoted to second focal point |
| Card border | 1.5px visible border | **Elevation shadow** (dark) / **no shadow** (light) |
| Card scanlines | Present inside card | **Removed** from card surface |
| Button shape | Circular, 64px | **Square**, 64px, 1px border |
| Button colors (dark) | Theme red/green | **Warm amber/sage** |
| Button colors (light) | Theme red/green | **Theme ink-red/forest** (existing palette) |
| Type scale | 11 distinct sizes | **5 sizes** (76, 22, 13, 10, 8) |
| Font sizes total | 11 | **5** |
| Divider position | Between pinyin and meaning | **Between english meaning and example** |

## What Does NOT Change

- 3-stage progressive reveal flow
- DialKit parameterization system
- Existing animation system (spring entrance, stagger, flash feedback)
- Top bar (close button, progress bar, back button)
- Score strip structure (forgot · remaining · got)
- `TypewriterText` component for example translation
- Corner ornament positions (TL, BR)
- ASCII icon system (`theme/icons.ts`)
- Button icon characters (`×` U+00D7, `✓` U+2713) and their font (IBM Plex Mono)
- Page-level scanlines (stay on page background)
- Responsive behavior (`useResponsive`, `ResponsiveShell`)
- Auth, data layer, resume state — no backend changes

## Implementation Notes

### Font Loading

Inconsolata needs to be loaded via `expo-font` in `app/_layout.tsx`, same pattern as the existing IBM Plex Mono and Noto Serif SC fonts. Weights needed: 300, 400, 500.

### Glyph Compatibility

The `×` (U+00D7) and `✓` (U+2713) characters must stay in IBM Plex Mono because Inconsolata may not include these glyphs or may render them at mismatched visual weights. The button components should explicitly set `fontFamily` to IBM Plex Mono regardless of the ambient font.

### DialKit Updates

Existing DialKit parameters for font sizes need to be updated to the new 5-size scale. Parameters controlling card border (`cardBorderWidth`) should be replaced with shadow parameters.

### Token Updates

- `theme/tokens.ts` — add Inconsolata font constants, update size tokens to the 5-tier scale
- `theme/colors.ts` — add warm amber/sage button colors to dark palette; light palette button colors already exist as `inkRedText` and `green`
- No new color tokens needed for text hierarchy — all handled via opacity on existing `textPrimary`

### Reference Color

Warm amber `#d4a574` — saved for potential future use (pinyin accent color, explored but deferred).
