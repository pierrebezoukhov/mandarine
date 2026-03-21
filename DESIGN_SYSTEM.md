# Mandarine Design System

A dual-theme component library for the Mandarine (Hanziflash) React Native / Expo app.
Light mode: "Red Ink on Aged Parchment." Dark mode: "CRT Terminal."
All tokens live in `theme/`, components in `components/`, shared across every screen.

---

## Table of contents

1. [Theme system](#1-theme-system)
2. [Colour palettes](#2-colour-palettes)
3. [Typography](#3-typography)
4. [Iconography](#4-iconography)
5. [Spacing & radius](#5-spacing--radius)
6. [Components](#6-components)
   - [Avatar](#avatar)
   - [Button](#button)
   - [Field](#field)
   - [Card](#card)
   - [Chip](#chip)
   - [SegmentedControl](#segmentedcontrol)
   - [StatCard](#statcard)
   - [TabSwitcher](#tabswitcher)
   - [BottomSheetModal](#bottomsheetmodal)
   - [ProgressBar](#progressbar)
   - [Section](#section)
   - [Scanlines](#scanlines)
   - [NoiseOverlay](#noiseoverlay)
7. [Conventions](#7-conventions)
8. [Session surfaces](#8-session-surfaces)
9. [Visual effects — web vs native](#9-visual-effects--web-vs-native)
10. [Art direction](#10-art-direction)
11. [Technical decisions](#11-technical-decisions)

---

## 1. Theme system

### Architecture

The app supports **light**, **dark**, and **system** (follows OS preference) themes.

| File | Purpose |
|---|---|
| `theme/colors.ts` | Raw light + dark palettes, `ColorTheme` type, backward-compat aliases |
| `context/ThemeContext.tsx` | `ThemeProvider` + `useTheme()` hook |
| `theme/tokens.ts` | Typography (fonts, sizes, weights, line heights, letter spacing) — theme-independent |
| `theme/icons.ts` | ASCII icon constants |
| `theme/spacing.ts` | Spacing and border-radius scales — theme-independent |

### Usage pattern

All components and screens use the **themed factory pattern**:

```tsx
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

export function MyComponent() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return <View style={s.wrap}>...</View>;
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  wrap: { backgroundColor: t.bg },
});
```

**Do not** import `T` from `theme/tokens.ts` for colors — that is a deprecated backward-compat alias pointing to the dark palette only.

### Theme persistence

- Stored in AsyncStorage under key `hanziflash_theme_mode`
- Values: `'light' | 'dark' | 'system'`
- Default: `'system'` (reads `useColorScheme()` from React Native)
- User toggles theme in Settings → Appearance → Theme (SegmentedControl)

### Provider setup

`ThemeProvider` wraps the entire app in `app/_layout.tsx`, outside `AuthProvider`:

```tsx
<ThemeProvider>
  <AuthProvider>
    <RouteGuard />
    <Scanlines />
    <NoiseOverlay />
    <Stack>...</Stack>
  </AuthProvider>
</ThemeProvider>
```

---

## 2. Colour palettes

**File:** `theme/colors.ts`
**Access:** `const { colors } = useTheme()`

### Paper Surface

| Token | Light | Dark | Usage |
|---|---|---|---|
| `bg` | `#f5f0e6` | `#0c0b09` | Screen background |
| `bgCard` | `#faf6ed` | `#111008` | Cards, inputs, sheets, form controls |
| `bgCard2` | `#f0ebe0` | `#161410` | Nested surfaces, focused inputs, search fields |
| `border` | `#d4c9b8` | `#2a2620` | Default border on all elements |
| `borderDim` | `#e0d8cc` | `#1e1c18` | Subtle dividers, hint block borders |
| `scanline` | `rgba(120,100,60,0.03)` | `rgba(255,240,200,0.018)` | Scanline / paper-grain overlay color |

### Red Ink System

| Token | Light | Dark | Usage |
|---|---|---|---|
| `inkRed` | `#b8301e` | `#c8382a` | Primary CTA fill, active underlines, focus borders |
| `inkRedDim` | `#c45a4e` | `#7a1e14` | Active chip/segment border, corner ornaments |
| `inkRedGlow` | `rgba(184,48,30,0.12)` | `rgba(200,56,42,0.18)` | Active chip/segment background, box-shadow glow |
| `inkRedText` | `#a82818` | `#e04030` | Pinyin text, error messages, links |

### Text Hierarchy

| Token | Light | Dark | Usage |
|---|---|---|---|
| `textPrimary` | `#2a241a` | `#e8e0d0` | Headings, active labels, card titles |
| `textSecondary` | `#6b6050` | `#8a8070` | Body text, secondary labels, subtitles |
| `textFaint` | `#b0a898` | `#4a4438` | Labels, placeholders, tap hints, ornaments |
| `textHanzi` | `#1a1610` | `#f0e8d8` | Large Hanzi character on flashcards |

### Semantic Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `green` | `#2d6e38` | `#3a7a44` | Success/correct states, "got it" button |
| `greenBright` | `#3a8a42` | `#4fa858` | Hover/active success state |
| `redBtn` | `#c45a4e` | `#7a1e14` | Error/wrong states, "forgot" button |
| `redBtnBright` | `#b8301e` | `#c8382a` | Hover/active error state |

### Card Shadows

| Token | Light | Dark | Usage |
|---|---|---|---|
| `cardShadow` | `rgba(120,100,60,0.08)` | `rgba(0,0,0,0.3)` | Outer card shadow |
| `cardInsetShadow` | `rgba(120,100,60,0.06)` | `rgba(0,0,0,0.4)` | Inset card shadow (web-only) |

### Noise

| Token | Light | Dark | Usage |
|---|---|---|---|
| `noiseOpacity` | `0.05` | `0.04` | SVG noise overlay opacity |

Light mode uses `multiply` blend; dark mode uses `overlay` blend (set in `NoiseOverlay` component).

### Backward-compat aliases

During migration, old `T.*` names are mapped to new palette keys in `withAliases()`:

| Old name | Maps to |
|---|---|
| `accent` | `inkRed` |
| `accentDim` | `inkRedGlow` |
| `accentBorder` | `inkRedDim` |
| `surface` / `surfaceCard` | `bgCard` |
| `surface2` | `bgCard2` |
| `bgDeep` | `bg` |
| `borderFocus` | `inkRed` |
| `textMuted` | `textSecondary` |
| `error` / `errorDim` / `errorMuted` / `errorBright` | `redBtn` / `inkRedGlow` / `inkRedDim` / `inkRedText` |
| `success` / `successBright` | `green` / `greenBright` |

These aliases will be removed once all call-sites use the new names.

---

## 3. Typography

**File:** `theme/tokens.ts`

### Fonts

| Constant | Native | Web | Role |
|---|---|---|---|
| `SERIF` | `NotoSerifSC-Light` | `"Noto Serif SC", "STSong", serif` | Hanzi hero character, example sentences |
| `MONO` | `IBMPlexMono-Regular` | `"IBM Plex Mono", monospace` | All UI text, labels, inputs, counters, pinyin |
| `MONO_MEDIUM` | `IBMPlexMono-Medium` | `"IBM Plex Mono", monospace` | Score strip values, interactive mono labels |

**Key rule:** All UI text uses `MONO` (IBM Plex Mono). Chinese characters use `SERIF` (Noto Serif SC). This creates contrast between "machine" and "tradition."

### Display scale (Perfect Fourth 1.333)

| Token | Value | Role |
|---|---|---|
| `FSDisplay.hanzi` | 108px | Flashcard hero character (manual override) |
| `FSDisplay.seal` | 50px | Session completion seal |
| `FSDisplay.score` | 42px | Large numeric display |
| `FSDisplay.title` | 42px | Screen titles / H1 |
| `FSDisplay.heading` | 32px | Deck names / H2 |
| `FSDisplay.subheading` | 21px | Sub-headings, card headings |

### Body scale (Major Third 1.250)

| Token | Value | Role |
|---|---|---|
| `FSBody.pinyin` | 20px | Pinyin romanization |
| `FSBody.ui` | 16px | Navigation controls (base) |
| `FSBody.body` | 16px | Body text, translations (base) |
| `FSBody.label` | 13px | Captions, section labels |
| `FSBody.progress` | 12px | Progress counter, example translation |
| `FSBody.scoreNumber` | 13px | Score display numbers (weight 500) |
| `FSBody.micro` | 9px | Tap hints, button labels — minimum legible size |
| `FSBody.buttonLabel` | 9px | Action button labels (Wrong, Right, Again) |

### Letter spacing

| Token | Value | Usage |
|---|---|---|
| `LS.tighter` | `-0.05` | Score / seal / hanzi — large display |
| `LS.tight` | `-0.025` | Title / heading hierarchy |
| `LS.normal` | `0` | Body / UI text — default |
| `LS.loose` | `0.025` | Section labels |
| `LS.wide` | `0.04` | Definition text, body secondary, input text |
| `LS.wider` | `0.08` | Pinyin, score labels, sidebar brand |
| `LS.widest` | `0.14` | Button labels, form labels, sidebar nav |
| `LS.ultrawide` | `0.18` | Uppercase card labels (POS · HSK level) |
| `LS.extreme` | `0.22` | Micro text ("Tap to reveal") |

### Font weights

Four weights — no bold (700). Bold thickens Chinese character strokes.

| Token | Weight | Role |
|---|---|---|
| `FW.light` | 300 | Serif Hanzi display, form inputs, definitions |
| `FW.regular` | 400 | Pinyin, labels, captions (default — omit from style) |
| `FW.medium` | 500 | Interactive controls, primary CTA labels, score numbers |
| `FW.semibold` | 600 | Screen headings, titles |

### Line heights

| Token | Font size | Line height | Ratio |
|---|---|---|---|
| `LH.micro` | 9px | 12px | 1.33 |
| `LH.progress` | 12px | 12px | 1.00 |
| `LH.scoreNumber` | 13px | 16px | 1.23 |
| `LH.label` | 13px | 20px | 1.54 |
| `LH.body` / `LH.ui` | 16px | 24px | 1.50 |
| `LH.pinyin` | 20px | 28px | 1.40 |
| `LH.subheading` | 21px | 28px | 1.33 |
| `LH.heading` | 32px | 40px | 1.25 |
| `LH.title` / `LH.score` | 42px | 48px | 1.14 |
| `LH.seal` | 50px | 56px | 1.12 |
| `LH.hanzi` | 108px | 120px | 1.11 |

### Typography rules

1. All UI text uses monospace (IBM Plex Mono) — this creates the terminal/ASCII aesthetic
2. Chinese characters use Noto Serif SC serif — contrast between "machine" and "tradition"
3. Pinyin is always italic with `inkRedText` color
4. Uppercase labels use wide letter-spacing (`LS.widest` to `LS.extreme`)
5. Body text uses light-to-normal weights (300–400) for an elegant, non-heavy feel
6. Numbers use `fontFeatureSettings: 'tnum'` for tabular alignment
7. No text ever goes below 9px (`FSBody.micro`)

---

## 4. Iconography

**File:** `theme/icons.ts`
**Import:** `import { Icon } from '@/theme/icons'`

Pure ASCII/text characters — no SVG icon sets. All icons are rendered in `MONO` font and inherit their color from semantic context.

| Constant | Character | Usage |
|---|---|---|
| `Icon.close` | `×` | Close buttons |
| `Icon.next` | `›` | Next / forward |
| `Icon.ornament` | `+` | Corner ornaments on cards |
| `Icon.dropdown` | `▾` | Dropdown indicators, hint chevrons |
| `Icon.audio` | `♪` | Audio playback hint |
| `Icon.separator` | `·` | Dot separators in score strips |
| `Icon.correct` | `✓` | Correct/got-it indicator |
| `Icon.repeat` | `↺` | Repeat/again action |
| `Icon.left` | `←` | Left navigation |
| `Icon.right` | `→` | Right navigation, card arrows |

---

## 5. Spacing & radius

**File:** `theme/spacing.ts`
**Import:** `import { space, radius } from '@/theme/spacing'`

### Spacing scale (4px base)

| Name | Value |
|---|---|
| `space.xs` | 4px |
| `space.sm` | 8px |
| `space.md` | 12px |
| `space.lg` | 16px |
| `space.xl` | 20px |
| `space.xxl` | 24px |
| `space.xxxl` | 28px |
| `space.huge` | 36px |
| `space.giant` | 48px |

### Border-radius scale

| Name | Value | Use |
|---|---|---|
| `radius.square` | 4 | Session rating buttons |
| `radius.sm` | 8 | Icon buttons |
| `radius.md` | 10 | Legacy — kept for compat |
| `radius.lg` / `radius.input` | 12 | Legacy — kept for compat |
| `radius.card` | 16 | Action cards (Card component) |
| `radius.modal` | 20 | Bottom-sheet top corners |
| `radius.pill` | 100 | Primary CTA buttons |

> **Note:** Form elements (Field, Chip, SegmentedControl) now use **square corners** (no border-radius) matching the terminal aesthetic. The rounded radii above are kept for Card and Button components which have their own shapes.

---

## 6. Components

All components use the themed factory pattern: `useTheme()` + `useMemo(() => makeStyles(colors), [colors])`.

---

### Avatar

**File:** `components/Avatar.tsx`

Circular profile photo with an initials fallback. Optionally tappable.

| Prop | Type | Default | Description |
|---|---|---|---|
| `uri` | `string \| null` | — | Photo URL |
| `initials` | `string` | `'?'` | 1–2 character fallback |
| `size` | `number` | `80` | Diameter in pixels |
| `onPress` | `() => void` | — | Makes it tappable |
| `style` | `ViewStyle` | — | Override outer container |

Fallback circle uses `bgCard2` background, `border` stroke, `textSecondary` initials.

---

### Button

**File:** `components/Button.tsx`

Primary call-to-action element.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Button text |
| `onPress` | `() => void` | — | Press handler |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style |
| `shape` | `'pill' \| 'rounded'` | `'pill'` | Border radius |
| `disabled` | `boolean` | `false` | Dims to 18% opacity |
| `loading` | `boolean` | `false` | Shows ActivityIndicator |
| `style` | `ViewStyle` | — | Override container |

#### Variants

| Variant | Background | Border | Text |
|---|---|---|---|
| `primary` | `inkRed` | none | `#fff` |
| `secondary` | `bgCard` | `border` | `textSecondary` |
| `ghost` | none | none | `textSecondary` |

---

### Field

**File:** `components/Field.tsx`

Labelled text input with focus management, error states, and ink-glow focus ring.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Uppercase label (10px, MONO, `LS.widest`) |
| `value` | `string` | — | Controlled value |
| `onChange` | `(v: string) => void` | — | Change handler |
| `placeholder` | `string` | — | Placeholder text (`textFaint`) |
| `secureTextEntry` | `boolean` | `false` | Password masking |
| `hasError` | `boolean` | `false` | Error border without message |
| `errorText` | `string` | — | Error border + red message below |
| `style` | `ViewStyle` | — | Override wrapper |

#### Visual spec

- Square corners (no border-radius)
- `MONO` font, 15px, weight 300, `letterSpacing: LS.wide`
- Padding: 8px vertical, 12px horizontal
- Focus: `inkRed` border + `inkRedGlow` box-shadow (web)
- Error: `inkRed` border + `inkRedGlow` box-shadow (web), `inkRedText` message

---

### Card

**File:** `components/Card.tsx`

Action row with icon box, title, subtitle, and arrow. Used on home screen.

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | — | Single character in 48×48 box |
| `title` | `string` | — | Primary label |
| `subtitle` | `string` | — | Secondary description |
| `onPress` | `() => void` | — | Press handler |
| `variant` | `'primary' \| 'secondary'` | `'secondary'` | Visual weight |
| `disabled` | `boolean` | `false` | 45% opacity, hides arrow |
| `style` | `ViewStyle` | — | Override container |

#### Variants

| Variant | Icon bg | Border | Icon text |
|---|---|---|---|
| `primary` | `inkRedGlow` + `inkRedDim` border | `inkRedDim` | `textPrimary` |
| `secondary` | `bgCard2` | `border` | `textSecondary` |

---

### Chip

**File:** `components/Chip.tsx`

Selectable toggle with dot indicator. Square corners, `MONO` font.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Primary label |
| `sublabel` | `string` | — | Secondary descriptor |
| `active` | `boolean` | — | Selected state |
| `onPress` | `() => void` | — | Toggle handler |
| `style` | `ViewStyle` | — | Override container |

#### States

| State | Background | Border | Dot | Label |
|---|---|---|---|---|
| Inactive | `bgCard` | `border` | `textSecondary` | `textSecondary` |
| Active | `inkRedGlow` | `inkRedDim` | `inkRed` | `textPrimary` |

---

### SegmentedControl

**File:** `components/SegmentedControl.tsx`

Horizontal segments with optional custom numeric input. Square corners, `MONO` font.

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label, value }[]` | — | Preset segments |
| `value` | `number \| string` | — | Selected value |
| `onChange` | `(v) => void` | — | Selection handler |
| `allowCustom` | `boolean` | `false` | Adds "Custom" segment |
| `customValue` | `number` | — | Custom number value |
| `onCustomChange` | `(v: number) => void` | — | Custom input handler |
| `style` | `ViewStyle` | — | Override wrapper |

Active segment: `inkRedGlow` background, `inkRedDim` border.

---

### StatCard

**File:** `components/StatCard.tsx`

Metric tile with large number and uppercase label.

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | — |
| `value` | `string \| number` | — |
| `style` | `ViewStyle` | — |

Uses `bgCard` background, `border` stroke, `textFaint` label.

---

### TabSwitcher

**File:** `components/TabSwitcher.tsx`

Horizontal tabs with `inkRed` underline indicator.

| Prop | Type | Default |
|---|---|---|
| `tabs` | `{ label, value }[]` | — |
| `value` | `string` | — |
| `onChange` | `(v: string) => void` | — |
| `style` | `ViewStyle` | — |

---

### BottomSheetModal

**File:** `components/BottomSheetModal.tsx`

Slide-up sheet (mobile) / centered dialog (desktop). `bgCard` background, `border` handle.

| Prop | Type | Description |
|---|---|---|
| `visible` | `boolean` | Controls visibility |
| `onClose` | `() => void` | Backdrop tap or "Done" |
| `title` | `string` | Header title |
| `children` | `ReactNode` | Content slot |

---

### ProgressBar

**File:** `components/ProgressBar.tsx`

Thin 2px fill track with `{current} / {total}` counter.

| Prop | Type | Description |
|---|---|---|
| `current` | `number` | Current position |
| `total` | `number` | Total count |
| `style` | `ViewStyle` | Override row wrapper |

Track: `border` color. Fill: `inkRed`. Counter: `MONO`, `textSecondary` / `textFaint`.

---

### Section

**File:** `components/Section.tsx`

Uppercase label above children. Label: `textFaint`, `LS.loose` tracking, 28px bottom margin.

---

### Scanlines

**File:** `components/Scanlines.tsx`

Web-only scanline / paper-grain overlay using CSS `repeating-linear-gradient`. Returns null on native.

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | theme `scanline` | Override scanline color |
| `gap` | `number` | `3` | Pixel gap between lines |

Applied globally in `_layout.tsx` and per-element in session screen (card, buttons).

---

### NoiseOverlay

**File:** `components/NoiseOverlay.tsx`

Web-only SVG feTurbulence noise texture. Returns null on native.

- Light mode: `multiply` blend at 5% opacity
- Dark mode: `overlay` blend at 4% opacity

Applied globally in `_layout.tsx`.

---

## 7. Conventions

### Imports

```ts
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { MONO, SERIF, FS, FW, LH, LS } from '@/theme/tokens';
import { Icon } from '@/theme/icons';
import { space, radius } from '@/theme/spacing';
import { Button } from '@/components/Button';
```

### Adding a new colour

1. Add to both `light` and `dark` objects in `theme/colors.ts`.
2. Add to the `ColorTheme` interface.
3. Access via `colors.yourToken` from `useTheme()`.

### Adding a new component

1. Create `components/YourComponent.tsx`.
2. Use the themed factory pattern: `useTheme()` + `makeStyles(t: ColorTheme)`.
3. Use `StyleSheet.create` — no inline style objects except one-off overrides.
4. Export a named function (not default).
5. Document here.

### What stays in screens (not extracted)

| Pattern | Screen | Reason |
|---|---|---|
| Animated flashcard + spring | `session.tsx` | Flashcard-domain specific |
| Card container + corner ornaments | `session.tsx` | Session-specific visual treatment |
| Rating buttons (Wrong / Right) | `session.tsx` | Tied to card reveal logic |
| LoginForm / SignupForm / ForgotForm | `auth.tsx` | Auth-specific composition |
| Deck selector row | `session-setup.tsx` | One-off trigger for BottomSheetModal |

---

## 8. Session surfaces

The session screen (`app/session.tsx`) has a focused "study mode" feel.

### Card container

- Background: `bgCard`
- Border: `border` (1.5px)
- Shadow: `cardShadow` token (warm brown in light, deep black in dark)
- Corner ornaments: `+` in `inkRedDim` at top-left and bottom-right
- Scanlines: web-only, theme-aware color

### 4-stage progressive reveal with staggered animation

Each tap reveals one layer with spring animation (`damping: 18, stiffness: 200`) and `translateY: 10→0`:

| Stage | Shows | Animation |
|---|---|---|
| 0 | Hanzi only | Card entrance: `scale 0.96→1` + `translateY 20→0` |
| 1 | + Pinyin | Spring `opacity + translateY` |
| 2 | + POS + definition | Spring with 80ms stagger, then hint block |
| 3 | + Example (collapsible) | Staggered 80ms after meaning |

### Rating buttons

Two 64×64 square buttons with scanline overlays and per-theme states:

| Button | Default bg | Hover bg (light) | Hover bg (dark) | Glow |
|---|---|---|---|---|
| Wrong (×) | `inkRedGlow` | `rgba(184,48,30,0.16)` | `rgba(122,30,20,0.25)` | `inkRedGlow` |
| Right (✓) | green at 8–12% | `rgba(45,110,56,0.16)` | `rgba(58,122,68,0.25)` | green glow |

### Feedback flash

On rating: border flash (2px, `greenBright` or `inkRedText`) + web-only `boxShadow` glow pulse (30px, 600ms fade-out).

---

## 9. Visual effects — web vs native

| Effect | Web | Native | Notes |
|---|---|---|---|
| Scanlines / paper grain | `repeating-linear-gradient` | Skipped | `Scanlines` component |
| Noise texture | SVG `feTurbulence` | Skipped | `NoiseOverlay` component |
| Ink-bleed text shadow | `textShadow*` | `textShadow*` | Cross-platform |
| Card shadow | `shadowColor` + `cardShadow` token | `shadowColor` / `elevation` | Cross-platform |
| Ink glow (focus/hover) | CSS `box-shadow` | Skipped | Web-only enhancement |
| Feedback flash glow | `boxShadow` pulse | Border-only | Graceful degradation |
| Translation blur | CSS `filter: blur(5px)` | Opacity 0.15 fallback | |
| Button hover states | `onMouseEnter`/`onMouseLeave` | N/A | Touch-only on mobile |
| CSS transitions | `transition` property | N/A | Web-only smooth states |

---

## 10. Art direction

### Philosophy

A design language born from CRT terminal nostalgia meets traditional Chinese calligraphy ink. Monospace typography with serif Hanzi display, red ink accents with aged paper surfaces, ASCII iconography with careful motion.

### Rules

1. Paper grain overlay in light mode: warm brown stripes at near-zero opacity
2. CRT scanlines in dark mode: cool faint lines
3. Noise texture: SVG feTurbulence — `multiply` at 5% (light), `overlay` at 4% (dark)
4. Ink glow effects: red accent elements get `box-shadow: 0 0 12px inkRedGlow`
5. Card shadows: warm brown `rgba(120,100,60,0.08)` in light; deep black in dark
6. No images, no illustrations — pure typographic and geometric composition
7. No SVG icon sets — all icons are ASCII characters in monospace font

---

## 11. Technical decisions

### IBM Plex Mono as universal UI font

All UI text uses IBM Plex Mono — not just session labels. This creates the consistent terminal/ASCII aesthetic described in the design language. The serif font (Noto Serif SC) is reserved exclusively for Chinese character display.

### Square corners on form elements

Form inputs, chips, and segmented controls use zero border-radius (square corners) to reinforce the terminal aesthetic. Only Cards (16px), Buttons (pill/rounded), and Modals (20px) retain rounded corners.

### Dual-theme via React Context

The `ThemeProvider` + `useTheme()` pattern was chosen over other approaches (CSS variables, styled-components) because:
- Works cross-platform (web + native) without platform-specific code
- `useMemo` with `colors` dependency means styles recompute only on theme change
- Matches existing patterns (`useAuth()`, `useResponsive()`)
- `StyleSheet.create` validation is preserved via the factory pattern

### Reveal model: 4 stages with staggered animation

Progressive reveal forces active recall at different levels (character → pronunciation → meaning → context). Each stage uses spring animation with `translateY: 10→0` and 80ms stagger between elements for a polished feel.
