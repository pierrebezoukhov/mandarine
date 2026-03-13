# Hanziflash Design System

A minimal, dark-themed component library for the Hanziflash React Native / Expo app.
All tokens and components live in `theme/` and `components/` and are shared across every screen.

---

## Table of contents

1. [Colour tokens](#1-colour-tokens)
2. [Typography](#2-typography)
3. [Spacing & radius](#3-spacing--radius)
4. [Components](#4-components)
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
5. [Conventions](#5-conventions)

---

## 1. Colour tokens

**File:** `theme/tokens.ts`
**Import:** `import { T } from '@/theme/tokens'`

### Backgrounds

| Token | Value | Usage |
|---|---|---|
| `T.bg` | `#131109` | Screen background |
| `T.surface` | `#1e1b12` | Cards, inputs, sheets |
| `T.surface2` | `#252118` | Progress tracks, search inputs, nested surfaces |

### Borders

| Token | Value | Usage |
|---|---|---|
| `T.border` | `rgba(255,248,220, 0.08)` | Default border on all elements |
| `T.borderFocus` | `rgba(255,248,220, 0.22)` | Input focus ring, custom count input |

### Text

| Token | Value | Usage |
|---|---|---|
| `T.textPrimary` | `#F0EBE0` | Headings, active labels, card titles |
| `T.textSecondary` | `#A09880` | Body text, secondary labels |
| `T.textMuted` | `#928A78` | Section labels, placeholders, inactive states — passes WCAG AA (4.5:1) on all surfaces |
| `T.textHanzi` | `#F5F0E8` | The large Hanzi character on flashcards |

### Accent

| Token | Value | Usage |
|---|---|---|
| `T.accent` | `#C0392B` | Primary CTAs, active underlines, pinyin text |
| `T.accentDim` | `rgba(192,57,43, 0.12)` | Active chip / segment background fill |
| `T.accentBorder` | `rgba(192,57,43, 0.28)` | Active chip / segment border |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `T.error` | `#E05252` | Error states, "forgot" FAB, error score |
| `T.success` | `#4A9E6B` | Success states, "got it" FAB, success score |

---

## 2. Typography

**File:** `theme/tokens.ts`

### Dual-scale architecture

The type system uses two independent mathematical scales plus one manual override:

| Scale | Ratio | Name | Domain |
|---|---|---|---|
| Body / supporting | 1.250 | Major Third | Flashcard text roles, UI copy, captions |
| Display / title | 1.333 | Perfect Fourth | Screen headings, deck names, navigation |

**Why two scales?** A single scale cannot serve both the flashcard's pedagogical hierarchy (pinyin → translation → example sentence) and the app's navigational hierarchy (screen title → deck name → sub-heading) without one distorting the other.

### Display scale (Perfect Fourth 1.333)

| Token | Value | Role |
|---|---|---|
| `FSDisplay.hanzi` | 72px | Flashcard hero character (manual override — not derived from scale) |
| `FSDisplay.seal` | 50px | Session completion seal |
| `FSDisplay.score` | 42px | Large numeric display |
| `FSDisplay.title` | 42px | Screen titles / H1 |
| `FSDisplay.heading` | 32px | Deck names / H2 |
| `FSDisplay.subheading` | 21px | Sub-headings, card headings |

### Body scale (Major Third 1.250)

| Token | Value | Role |
|---|---|---|
| `FSBody.pinyin` | 20px | Pinyin romanization |
| `FSBody.ui` | 16px | Inputs, buttons, nav controls (base) |
| `FSBody.body` | 16px | Body text, translations (base) |
| `FSBody.label` | 13px | Example sentences, captions, section labels |

### Why 1.250 for the body scale?

Chinese characters read more dramatically than Latin text at equivalent sizes. 1.250 keeps enough contrast between pinyin (20px), translation (16px), and example sentence (13px) without dropping below the ~12px Chinese-character legibility floor on mobile.

### Character sizing (72px)

The hero character is a manual override — not derived from either scale. It is the product being learned, not a heading. 72px ensures it is the unambiguous primary stimulus. The gap between 72px and the next-largest element (title at 42px) creates a deliberate rupture that signals "this is the thing."

### Line heights

| Token | Font size | Line height | Ratio |
|---|---|---|---|
| `LH.label` | 13px | 20px | 1.54 |
| `LH.body` / `LH.ui` | 16px | 24px | 1.50 |
| `LH.pinyin` | 20px | 28px | 1.40 |
| `LH.subheading` | 21px | 28px | 1.33 |
| `LH.heading` | 32px | 40px | 1.25 |
| `LH.title` / `LH.score` | 42px | 48px | 1.14 |
| `LH.seal` | 50px | 56px | 1.12 |
| `LH.hanzi` | 72px | 80px | 1.11 |

### Font weights

Three weights only. No bold (700) — it thickens Chinese character strokes, reducing legibility.

| Token | Weight | Role |
|---|---|---|
| `FW.regular` | 400 | Prose, translations, pinyin, captions (default — omit from style) |
| `FW.medium` | 500 | Interactive controls: buttons, chips, tabs, list labels |
| `FW.semibold` | 600 | Screen headings, deck names, section titles |

**Why no bold?** Size signals priority. Weight signals interactivity. Color signals role. Each weight encodes a semantic role. The hero character must be regular weight — learners should see strokes as they appear in normal reading.

### Monospace

| Constant | Value |
|---|---|
| `MONO` | `Menlo` on iOS · `monospace` on Android |

`MONO` is used for counters, pinyin, part-of-speech tags, and any fixed-width numerical display.
All other text uses the system default (San Francisco on iOS, Roboto on Android).

---

## 3. Spacing & radius

**File:** `theme/spacing.ts`
**Import:** `import { space, radius } from '@/theme/spacing'`

### Spacing scale

| Name | Value (px) |
|---|---|
| `space.xs` | 4 |
| `space.sm` | 8 |
| `space.md` | 12 |
| `space.lg` | 16 |
| `space.xl` | 20 |
| `space.xxl` | 24 |
| `space.xxxl` | 28 |
| `space.huge` | 36 |
| `space.giant` | 48 |

### Border-radius scale

| Name | Value (px) | Intended use |
|---|---|---|
| `radius.sm` | 8 | Icon buttons |
| `radius.md` | 10 | Segmented controls, search inputs |
| `radius.lg` / `radius.input` | 12 | Text inputs, chips |
| `radius.card` | 16 | Action cards |
| `radius.modal` | 20 | Bottom-sheet top corners |
| `radius.pill` | 100 | Primary CTA buttons |

> **Note:** Existing screens may still use raw numbers. Use `space` / `radius` in all new components and screens going forward.

---

## 4. Components

---

### Avatar

**File:** `components/Avatar.tsx`

Circular profile photo with an initials fallback. Optionally tappable.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `uri` | `string \| null` | — | Public URL of the user's photo |
| `initials` | `string` | `'?'` | 1–2 characters shown when no photo is available |
| `size` | `number` | `80` | Diameter in pixels |
| `onPress` | `() => void` | — | When provided, wraps the avatar in a `TouchableOpacity` |
| `style` | `ViewStyle` | — | Override the outer container |

#### Fallback behaviour

When `uri` is absent or null, a dark circle (`T.surface2`) is rendered with the initials centered in `T.textSecondary`. The font size scales with `size` (`size × 0.35`).

#### Usage

```tsx
import { Avatar } from '@/components/Avatar';

// Header button (initials, small)
<Avatar
  initials="JD"
  size={36}
  onPress={() => router.push('/profile')}
/>

// Profile page (photo, large, tappable to change)
<Avatar
  uri={avatarUri}
  initials={initials}
  size={96}
  onPress={pickAvatar}
/>

// Read-only display
<Avatar uri={user.avatar_url} initials="AB" size={48} />
```

---

### Button

**File:** `components/Button.tsx`

The primary call-to-action element. Handles disabled and loading states internally.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Button text |
| `onPress` | `() => void` | — | Press handler |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` | Visual style |
| `shape` | `'pill' \| 'rounded'` | `'pill'` | Border radius |
| `disabled` | `boolean` | `false` | Disables interaction + dims opacity |
| `loading` | `boolean` | `false` | Replaces label with `ActivityIndicator` |
| `style` | `ViewStyle` | — | Override container style |

#### Variants

| Variant | Background | Border | Text colour |
|---|---|---|---|
| `primary` | `T.accent` | none | `#fff` |
| `secondary` | `T.surface` | `T.border` | `T.textSecondary` |
| `ghost` | none | none | `T.textMuted` |

#### Shapes

| Shape | `borderRadius` |
|---|---|
| `pill` (default) | `100` |
| `rounded` | `12` — use for OAuth / social login buttons |

#### Usage

```tsx
import { Button } from '@/components/Button';

// Primary CTA
<Button label="Start Session" onPress={startSession} />

// Disabled primary
<Button label="Start Session" onPress={startSession} disabled={!canStart} />

// Loading state
<Button label="Sign in" onPress={submit} loading={loading} />

// Secondary outlined
<Button label="Back to home" variant="secondary" onPress={goHome} />

// OAuth / social (rounded shape)
<Button label="Continue with Google" variant="secondary" shape="rounded" onPress={googleSignIn} />

// Ghost text link
<Button label="Cancel" variant="ghost" onPress={cancel} />
```

---

### Field

**File:** `components/Field.tsx`

Labelled text input with internal focus management, error border, and inline error message.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Uppercase label above input |
| `value` | `string` | — | Controlled value |
| `onChange` | `(v: string) => void` | — | Change handler |
| `placeholder` | `string` | — | Placeholder text |
| `secureTextEntry` | `boolean` | `false` | Password masking |
| `hasError` | `boolean` | `false` | Shows error border without message |
| `errorText` | `string` | — | Shows error border + red message below |
| `style` | `ViewStyle` | — | Override wrapper style |

#### States

| State | Border colour |
|---|---|
| Default | `T.border` |
| Focused | `T.borderFocus` |
| Error | `T.error` (dim, `rgba(224,82,82,0.4)`) |

#### Usage

```tsx
import { Field } from '@/components/Field';

<Field
  label="EMAIL"
  value={email}
  onChange={setEmail}
  placeholder="you@example.com"
  hasError={!!error && !email}
/>

<Field
  label="PASSWORD"
  value={password}
  onChange={setPassword}
  placeholder="Min. 8 characters"
  secureTextEntry
  errorText={error || undefined}
/>
```

---

### Card

**File:** `components/Card.tsx`

Action row with a Chinese-character icon, title, subtitle, and directional arrow. Used on the home screen for primary navigation actions.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | — | Single character displayed in a 48×48 box |
| `title` | `string` | — | Primary label |
| `subtitle` | `string` | — | Secondary description |
| `onPress` | `() => void` | — | Press handler |
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual weight |
| `disabled` | `boolean` | `false` | Hides arrow, dims to 45% opacity |
| `style` | `ViewStyle` | — | Override container style |

#### Variants

| Variant | Icon background | Border | Icon text |
|---|---|---|---|
| `primary` | `T.accentDim` + `T.accentBorder` border | `T.accentBorder` | `T.textPrimary` |
| `secondary` | `T.surface2` | `T.border` | `T.textMuted` |

#### Usage

```tsx
import { Card } from '@/components/Card';

<Card
  icon="开"
  title="New session"
  subtitle="Start a fresh round of flashcards"
  variant="primary"
  onPress={startNew}
/>

<Card
  icon="续"
  title="Resume session"
  subtitle={hasSession ? 'Continue where you left off' : 'No session in progress'}
  variant="secondary"
  onPress={resume}
  disabled={!hasSession}
/>
```

---

### Chip

**File:** `components/Chip.tsx`

Selectable toggle row with a dot indicator, label, and optional sublabel. Used for multi-select filter options (e.g. difficulty selection).

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Primary label |
| `sublabel` | `string` | — | Secondary descriptor below label |
| `active` | `boolean` | — | Selected state |
| `onPress` | `() => void` | — | Toggle handler |
| `style` | `ViewStyle` | — | Override container style |

#### States

| State | Background | Border | Dot colour | Label colour |
|---|---|---|---|---|
| Inactive | `T.surface` | `T.border` | `T.textMuted` | `T.textMuted` |
| Active | `T.accentDim` | `T.accentBorder` | `T.accent` | `T.textPrimary` |

#### Usage

```tsx
import { Chip } from '@/components/Chip';

<Chip
  label="New"
  sublabel="Haven't seen yet"
  active={difficulties.includes('new')}
  onPress={() => toggleDifficulty('new')}
/>
```

---

### StatCard

**File:** `components/StatCard.tsx`

A metric tile displaying a large numeric value and a short uppercase label below. Used in the profile page stat grid.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Short uppercase label (e.g. `"Sessions"`, `"Moy. /ses."`) |
| `value` | `string \| number` | — | The metric displayed prominently |
| `style` | `ViewStyle` | — | Override the card container — use `flex: 1` for grid cells, or omit for full-width |

#### Usage

```tsx
import { StatCard } from '@/components/StatCard';

// In a 2-column grid (each cell takes equal width)
<View style={{ flexDirection: 'row', gap: 10 }}>
  <StatCard label="Sessions"    value={42}    style={{ flex: 1 }} />
  <StatCard label="Cartes vues" value={380}   style={{ flex: 1 }} />
</View>

// Full-width (secondary metric)
<StatCard label="Réussite globale" value="71%" />
```

---

### SegmentedControl

**File:** `components/SegmentedControl.tsx`

Horizontal row of preset option segments with an optional custom numeric input.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ label: string; value: number \| string }[]` | — | Preset segments |
| `value` | `number \| string` | — | Currently selected value |
| `onChange` | `(v: number \| string) => void` | — | Called on preset or custom tab press |
| `allowCustom` | `boolean` | `false` | Appends a "Custom" segment |
| `customValue` | `number` | — | Controlled custom number (parent-owned) |
| `onCustomChange` | `(v: number) => void` | — | Called when custom text input changes |
| `style` | `ViewStyle` | — | Override wrapper style |

#### Behaviour

- A segment is active when `value === option.value`.
- When `allowCustom` is true and `value` is not in `options`, the **Custom** segment activates and a `TextInput` (`keyboardType="number-pad"`) slides in below the row.
- `onChange` fires for both preset and custom selections. Use `onCustomChange` to handle the typed numeric value separately if needed.

#### Usage

```tsx
import { SegmentedControl } from '@/components/SegmentedControl';

<SegmentedControl
  options={[
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
  ]}
  value={isCustomCount ? '' : cardCount}
  onChange={v => {
    const n = v as number;
    setCardCount(n, n !== 10 && n !== 20 && n !== 50);
  }}
  allowCustom
  customValue={isCustomCount ? cardCount : undefined}
  onCustomChange={n => setCardCount(n, true)}
/>
```

---

### TabSwitcher

**File:** `components/TabSwitcher.tsx`

Horizontal tab row with an animated underline indicator for the active tab. Used at the top of the auth screen to switch between Sign in and Create account.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tabs` | `{ label: string; value: string }[]` | — | Tab definitions |
| `value` | `string` | — | Currently active tab value |
| `onChange` | `(v: string) => void` | — | Tab press handler |
| `style` | `ViewStyle` | — | Override row style |

#### Usage

```tsx
import { TabSwitcher } from '@/components/TabSwitcher';

<TabSwitcher
  tabs={[
    { label: 'Sign in',        value: 'login'  },
    { label: 'Create account', value: 'signup' },
  ]}
  value={screen}
  onChange={v => setScreen(v as Screen)}
/>
```

---

### BottomSheetModal

**File:** `components/BottomSheetModal.tsx`

Slide-up sheet built on React Native `Modal`. Provides the standard shell — backdrop, drag handle, title row with a "Done" button, and keyboard-avoiding behaviour. Pass your content as `children`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `visible` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called by backdrop tap or "Done" button |
| `title` | `string` | Sheet header title |
| `children` | `ReactNode` | Content rendered below the header |

#### Usage

```tsx
import { BottomSheetModal } from '@/components/BottomSheetModal';

<BottomSheetModal
  visible={showPicker}
  onClose={() => { setShowPicker(false); setQuery(''); }}
  title="Select Deck"
>
  <TextInput value={query} onChangeText={setQuery} placeholder="Search…" />
  <FlatList data={items} renderItem={renderItem} />
</BottomSheetModal>
```

---

### ProgressBar

**File:** `components/ProgressBar.tsx`

Thin fill track with a `{current} / {total}` counter to the right. Used in the session topbar.

#### Props

| Prop | Type | Description |
|---|---|---|
| `current` | `number` | Current position (1-based for display) |
| `total` | `number` | Total count |
| `style` | `ViewStyle` | Override the row wrapper (e.g. `flex: 1`) |

#### Visual

```
──────────────────────────    3 / 20
  fill (T.accent, 70% opacity)        MONO counter:
                                        current → T.textPrimary
                                        / total → T.textMuted
```

#### Usage

```tsx
import { ProgressBar } from '@/components/ProgressBar';

<ProgressBar current={idx + 1} total={cards.length} style={{ flex: 1 }} />
```

---

### Section

**File:** `components/Section.tsx`

Labelled section wrapper. Renders an uppercase label (`FSBody.label`, `T.textMuted`, `LS.loose` letter-spacing) above its children with a `28px` bottom margin.

#### Props

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Section heading (rendered uppercase, spaced) |
| `children` | `ReactNode` | Section content |
| `style` | `ViewStyle` | Override wrapper style |

#### Usage

```tsx
import { Section } from '@/components/Section';

<Section label="DIFFICULTY">
  {/* chips, controls, etc. */}
</Section>
```

---

## 5. Conventions

### Imports

Always import tokens and components using the `@/` alias:

```ts
import { T, MONO, FSDisplay, FSBody, LH, FW } from '@/theme/tokens';
import { space, radius }     from '@/theme/spacing';
import { Button }            from '@/components/Button';
```

Never redeclare a local `T = { ... }` object in a screen file.

### Adding a new colour

1. Add the token to `theme/tokens.ts` with a comment describing its intended use.
2. Do not hardcode the hex in a component — always reference `T.*`.

### Adding a new component

1. Create `components/YourComponent.tsx`.
2. Import `T` (and `MONO` if needed) from `@/theme/tokens`.
3. Use `StyleSheet.create` — no inline style objects for anything beyond one-off overrides.
4. Export a named function (not default export) so tree-shaking works correctly.
5. Document props here in this file.

### Changing the accent colour

Edit `T.accent` in `theme/tokens.ts` — the change propagates to every Button, Chip, ProgressBar, active Tab underline, pinyin text, and SessionComplete seal automatically.

### What stays in screens (not extracted)

Some patterns are intentionally **not** shared components because they are specific to a single screen's domain:

| Pattern | Screen | Reason |
|---|---|---|
| Animated flashcard + spring | `session.tsx` | Flashcard-domain specific |
| Hanzi / pinyin / example layout | `session.tsx` | Flashcard-domain specific |
| FAB row (got / forgot) | `session.tsx` | Tied to card reveal logic |
| SessionComplete stat display | `session.tsx` | One-off summary view |
| LoginForm / SignupForm / ForgotForm | `auth.tsx` | Auth-specific composition |
| Deck selector TouchableOpacity row | `session-setup.tsx` | One-off trigger for BottomSheetModal |
| HSK level progress row             | `profile.tsx`       | Specific to profile breakdown layout |
| Recent session row                 | `profile.tsx`       | One-off summary row, not reused elsewhere |
