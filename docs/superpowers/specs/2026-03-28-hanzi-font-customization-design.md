# Hanzi Font Customization — Design Spec

**Date**: 2026-03-28
**Status**: Approved

## Overview

Allow users to choose the display font for Chinese characters (Hanzi) across flashcards, card detail, example sentences, and search results. The goal is aesthetic personalization first, accessibility second.

---

## 1. Font Registry

5 fonts available. Default: **LXGW WenKai** (changed from Noto Serif SC — aligns with Pleco/Skritter learner community consensus for Kai-style fonts).

| ID | Font | Style | Description | Web Source | License |
|---|---|---|---|---|---|
| `lxgw-wenkai` | LXGW WenKai | Kai / 楷体 | Handcrafted, warm, natural strokes | npm `lxgw-wenkai-screen-webfont` or jsDelivr | SIL OFL |
| `noto-serif` | Noto Serif SC | Song / Serif | Elegant, traditional, refined | Google Fonts CDN | SIL OFL |
| `noto-sans` | Noto Sans SC | Sans / Gothic | Clean, minimal, easy to read | Google Fonts CDN | SIL OFL |
| `ma-shan-zheng` | Ma Shan Zheng | Calligraphy | Expressive, ink-on-paper, artistic | Google Fonts CDN | SIL OFL |
| `harmonyos-sans` | HarmonyOS Sans | Geometric Gothic | Precise, geometric, modern | cdnfonts CDN | Royalty-free (no modifications) |

### Font registry file: `theme/fonts.ts`

```ts
export type HanziFontId =
  | 'lxgw-wenkai'
  | 'noto-serif'
  | 'noto-sans'
  | 'ma-shan-zheng'
  | 'harmonyos-sans';

export type HanziFontDef = {
  id: HanziFontId;
  label: string;
  family: { web: string; native: string };
  weight: string;
  preview: string;       // single character for previews
  style: string;         // "Kai · 楷体"
  description: string;   // "Handcrafted, warm, natural strokes"
};

export const DEFAULT_HANZI_FONT: HanziFontId = 'lxgw-wenkai';
export const HANZI_FONTS: HanziFontDef[] = [ ... ];
export function getHanziFont(id: HanziFontId): HanziFontDef;
```

---

## 2. Scope of Font Application

| Where | Font source | Changes with setting? |
|---|---|---|
| Flashcard hero hanzi (108px) | `fonts.hanzi` from ThemeContext | **Yes** |
| Card detail hanzi | `fonts.hanzi` | **Yes** |
| Example sentence Chinese text | `fonts.hanzi` | **Yes** |
| Search result hanzi | `fonts.hanzi` | **Yes** |
| Tab bar icons (学/找/读) | Static `SERIF` constant (Noto Serif SC) | **No** |
| All UI text (labels, pinyin, buttons) | Static `MONO` constant | **No** |

---

## 3. Architecture: Extend ThemeContext

Add font state to the existing `ThemeContext` (same pattern as color mode).

### Extended context value

```ts
interface ThemeContextValue {
  // Existing
  colors: ColorTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  // New
  fonts: { hanzi: string; hanziWeight: string };
  hanziFontId: HanziFontId;
  setHanziFont: (id: HanziFontId) => void;
}
```

### Persistence

- **AsyncStorage key**: `hanziflash_hanzi_font`
- **Supabase**: `preferences` JSONB column on `profiles` table

### Initialization sequence

1. Load `hanziflash_hanzi_font` from AsyncStorage
2. Resolve to `HanziFontDef` via registry
3. Provide `fonts.hanzi` (family string) and `fonts.hanziWeight` to all consumers
4. Wait for font to load before hiding splash screen (same as current behavior)

---

## 4. Preferences Sync (Supabase)

### Schema change

Add a `preferences` JSONB column to the `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
```

### Shape

```ts
type UserPreferences = {
  hanzi_font?: HanziFontId;
  // Future: theme_mode, font_size, auto_play_audio, etc.
};
```

### Sync pattern

- **On login**: fetch `preferences` from Supabase → merge into AsyncStorage (server wins on conflict)
- **On change**: write to AsyncStorage (instant UI update) + upsert to Supabase (fire-and-forget)
- **Offline**: AsyncStorage is the source of truth for the running app

### Lib function: `lib/preferences.ts`

```ts
fetchPreferences(userId: string): Promise<UserPreferences>
savePreference(userId: string, key: string, value: any): Promise<void>
```

---

## 5. Font Loading Strategy

### Web

| Font | Source | Load timing |
|---|---|---|
| LXGW WenKai | npm webfont package or jsDelivr | **Startup** (default) |
| Noto Serif SC | Google Fonts CDN | **Startup** (tab icons + fallback) |
| User's chosen font (if different) | CDN | **Startup** (loaded based on AsyncStorage preference) |
| Remaining fonts | CDN | **Lazy** (when font picker screen opens) |

### Native

- Bundle LXGW WenKai as default (replaces current Noto Serif SC Light OTF)
- Keep Noto Serif SC bundled (tab bar icons)
- Other fonts: bundle or download on first use via `expo-font` remote loading

### Fallback chain

If chosen font fails to load: LXGW WenKai → Noto Serif SC → system serif.

---

## 6. Font Picker Screen

### Route: `app/font-picker.tsx`

Stack screen pushed from Settings. `slide_from_right` animation.

### Desktop layout (≥768px): Font Book pattern

List left (~35% width), large preview right (~65% width).

- **Left panel**: 5 `FontOptionRow` components stacked vertically. Compact: character (28px in its own font) + label + description + checkmark.
- **Right panel**: `FlashcardPreview` component showing 永 (yǒng) at 108px in the selected font, plus example sentence. Updates live on selection.

### Mobile layout (<768px): Stacked

- `FlashcardPreview` at top (compact size, 72px hanzi)
- Font list below (5 `FontOptionRow` components)
- Updates live on selection.

### Settings entry point

**Screen**: `app/settings.tsx`
**Section**: APPEARANCE (existing — already contains the theme mode toggle)
**Position**: Below the theme mode SegmentedControl

New row:
- **Label**: "Hanzi Font" (MONO, `FS.body`, `textPrimary`)
- **Value**: Current font name displayed on the right (e.g. "LXGW WenKai") in `textSecondary`
- **Arrow**: → indicator to signal navigation
- **Action**: `router.push('/font-picker')`

Uses the same row pattern as other navigable settings items. The row is not a `Card` component (those are for the home screen action cards) — it's a simple `TouchableOpacity` row matching the existing settings screen layout.

---

## 7. New Design System Components

### A. `FontOptionRow` (`components/FontOptionRow.tsx`)

Selectable row for picking from a list of options with a visual preview character.

**Props**:

| Prop | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `character` | `string` | Yes | — | Preview character rendered in `fontFamily` |
| `fontFamily` | `string` | Yes | — | CSS/native font family for the character |
| `fontWeight` | `string` | No | `'400'` | Weight for the preview character |
| `label` | `string` | Yes | — | Option name |
| `description` | `string` | Yes | — | Short descriptors |
| `active` | `boolean` | Yes | — | Whether currently selected |
| `onPress` | `() => void` | Yes | — | Selection handler |
| `style` | `StyleProp<ViewStyle>` | No | — | Container override |

**States**:

| State | Background | Border | Character | Label | Description | Checkmark |
|---|---|---|---|---|---|---|
| **Default** | `bgCard` | `border` | `textHanzi` | `textPrimary` | `textSecondary` | Hidden (opacity 0) |
| **Hover** (web) | `inkRedGlow` | `inkRed` | `textHanzi` | `textPrimary` | `textSecondary` | Hidden |
| **Active/Selected** | `inkRedGlow` | `inkRedDim` | `textHanzi` | `textPrimary` | `textSecondary` | `inkRed` (opacity 1) |
| **Pressed** | — | — | — | — | — | `activeOpacity: 0.75` |

**Layout**: `[character 36×36px center] [gap 14px] [label + description flex:1] [checkmark Icon.correct]`

**Styling**: Square corners, 1px border, MONO font for label/description. Character renders in the provided `fontFamily` at 28px. Themed factory pattern (`useTheme()` + `useMemo` + `makeStyles`). Web: `cursor: pointer`, `transition: border-color 150ms ease, background-color 150ms ease`.

---

### B. `FlashcardPreview` (`components/FlashcardPreview.tsx`)

Read-only preview of a flashcard's content. Display component — no interactive states.

**Props**:

| Prop | Type | Required | Default | Purpose |
|---|---|---|---|---|
| `hanzi` | `string` | Yes | — | Chinese character(s) |
| `pinyin` | `string` | Yes | — | Romanization |
| `meaning` | `string` | Yes | — | English translation |
| `exHanzi` | `string` | No | — | Example sentence characters |
| `exPinyin` | `string` | No | — | Example sentence pinyin |
| `exMeaning` | `string` | No | — | Example sentence translation |
| `fontFamily` | `string` | No | Theme's `fonts.hanzi` | Override hanzi font family. Reads from `useTheme()` internally; the prop is an override for contexts like the font picker where you preview a font that isn't the active selection yet. |
| `fontWeight` | `string` | No | Theme's `fonts.hanziWeight` | Override hanzi font weight. Same override pattern as `fontFamily`. |
| `size` | `'default' \| 'compact'` | No | `'default'` | `default` = 108px, `compact` = 72px |
| `showOrnaments` | `boolean` | No | `true` | Corner `+` ornaments |
| `style` | `StyleProp<ViewStyle>` | No | — | Container override |

**Visual spec**:

| Element | Font | Size (default / compact) | Color | Spacing |
|---|---|---|---|---|
| Container | — | — | `bgCard` bg, `border` 1.5px | `padding: 32px / 24px` |
| Corner ornaments | MONO | 10px | `inkRedDim` | 8px from edges |
| Hanzi | `fontFamily` prop | 108px / 72px | `textHanzi` | `letterSpacing: LS.tighter` |
| Pinyin | MONO italic | `FS.pinyin` / `FS.body` | `inkRedText` | `letterSpacing: LS.wider`, `marginTop: space.md` |
| Meaning | MONO | `FS.definition` / `FS.body` | `textPrimary` | `letterSpacing: LS.wide`, `marginTop: space.sm` |
| Divider | — | — | `borderDim` 1px | `marginTop: space.lg` |
| Example hanzi | `fontFamily` prop | `FS.definition` | `textHanzi` | `lineHeight: LH.normal` |
| Example pinyin | MONO italic | `FS.exPinyin` | `inkRedText` | `letterSpacing: LS.example` |
| Example meaning | MONO | `FS.body` | `textSecondary` | `letterSpacing: LS.wide` |

**States**: None — pure display component. No hover, press, disabled, or loading states.

---

## 8. Documentation Updates

### `DESIGN_SYSTEM.md`

Add entries for `FontOptionRow` and `FlashcardPreview` in the Components section, following the existing format (props table, states table, usage notes).

### `app/design-system.tsx`

Add a "Font Option Row" section and a "Flashcard Preview" section to the HTML showcase screen with live examples showing all states.

---

## 9. Files to Create/Modify

| Action | File | Change |
|---|---|---|
| **Create** | `theme/fonts.ts` | Font registry, types, lookup function |
| **Create** | `lib/preferences.ts` | Supabase preferences sync functions |
| **Create** | `components/FontOptionRow.tsx` | New design system component |
| **Create** | `components/FlashcardPreview.tsx` | New design system component |
| **Create** | `app/font-picker.tsx` | Font picker screen |
| **Modify** | `context/ThemeContext.tsx` | Add fonts state, setHanziFont, persistence |
| **Modify** | `app/_layout.tsx` | Load LXGW WenKai as default + dynamic font loading |
| **Modify** | `app/settings.tsx` | Add "Hanzi Font" row in Appearance section |
| **Modify** | `app/_layout.tsx` | Register font-picker Stack.Screen |
| **Modify** | `app/session.tsx` | Replace static `SERIF` with `fonts.hanzi` for hero + examples |
| **Modify** | `app/card-detail.tsx` | Replace static `SERIF` with `fonts.hanzi` |
| **Modify** | `components/SearchResultRow.tsx` | Replace static `SERIF` with `fonts.hanzi` |
| **Modify** | `DESIGN_SYSTEM.md` | Document FontOptionRow + FlashcardPreview |
| **Modify** | `app/design-system.tsx` | Add showcase sections for new components |
| **DB** | Supabase migration | `ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}'` |

---

## 10. Out of Scope

- UI font (MONO) customization — not needed, terminal aesthetic is fixed
- Font size scaling — separate feature, can use the `preferences` JSONB later
- Native font downloading on demand — web is primary platform for now
- Theme mode migration into preferences JSONB — follow-up task
