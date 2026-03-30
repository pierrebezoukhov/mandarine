# Terminal Scholar Flashcard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the flashcard session screen with a consolidated 5-size type scale, Inconsolata font, elevation-based card surface, warm button palette, and simplified visual hierarchy.

**Architecture:** Token-first approach — update theme tokens and font loading first, then refactor `session.tsx` styles to consume the new tokens. The DialKit parameterization system stays in place; we update the default values it references. No backend or data model changes.

**Tech Stack:** React Native / Expo, expo-font, Inconsolata (Google Fonts), DialKit, existing theme system (`theme/tokens.ts`, `theme/colors.ts`)

**Spec:** `docs/superpowers/specs/2026-03-30-terminal-scholar-flashcard-design.md`

---

### Task 1: Load Inconsolata font

**Files:**
- Modify: `app/_layout.tsx:14-26` (font imports and Google Fonts link)
- Modify: `theme/tokens.ts:1-11` (font constants)

- [ ] **Step 1: Install Inconsolata expo-google-fonts package**

Run:
```bash
npx expo install @expo-google-fonts/inconsolata
```
Expected: Package added to `package.json`

- [ ] **Step 2: Add Inconsolata imports to `app/_layout.tsx`**

Add after the IBM Plex Mono imports at line 18:

```typescript
import {
  Inconsolata_300Light,
} from '@expo-google-fonts/inconsolata/300Light';
import {
  Inconsolata_400Regular,
} from '@expo-google-fonts/inconsolata/400Regular';
import {
  Inconsolata_500Medium,
} from '@expo-google-fonts/inconsolata/500Medium';
```

- [ ] **Step 3: Add Inconsolata to the native font map**

In `RootLayout`, update the `fontMap` object (around line 64):

```typescript
const fontMap: Record<string, any> = {
  'IBMPlexMono-Regular': IBMPlexMono_400Regular,
  'IBMPlexMono-Medium': IBMPlexMono_500Medium,
  'Inconsolata-Light': Inconsolata_300Light,
  'Inconsolata-Regular': Inconsolata_400Regular,
  'Inconsolata-Medium': Inconsolata_500Medium,
};
```

- [ ] **Step 4: Add Inconsolata to the web Google Fonts link**

Update the Google Fonts CSS URL (line 26) to include Inconsolata. Replace the existing `link.href` with:

```typescript
link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Inconsolata:wght@300;400;500&family=Noto+Serif+SC:wght@300&family=Noto+Sans+SC:wght@400&family=Ma+Shan+Zheng&family=LXGW+WenKai+TC:wght@400&display=swap';
```

- [ ] **Step 5: Add Inconsolata font constants to `theme/tokens.ts`**

Add after the existing `MONO_MEDIUM` constant (around line 11):

```typescript
// Inconsolata — primary UI font for flashcard session (replaces IBM Plex Mono on card)
export const INCONSOLATA: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Regular';
export const INCONSOLATA_LIGHT: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Light';
export const INCONSOLATA_MEDIUM: string = Platform.OS === 'web'
  ? '"Inconsolata", monospace'
  : 'Inconsolata-Medium';
```

- [ ] **Step 6: Verify fonts load correctly**

Run:
```bash
npx expo start --web
```
Navigate to the session screen. Open browser devtools, inspect any text element, verify `font-family` includes `Inconsolata`. Check that the app doesn't crash on load (font loading failure would show a blank screen).

- [ ] **Step 7: Commit**

```bash
git add app/_layout.tsx theme/tokens.ts package.json
git commit -m "feat: load Inconsolata font (300, 400, 500 weights)"
```

---

### Task 2: Update type scale tokens

**Files:**
- Modify: `theme/tokens.ts:18-42` (font size tokens)

- [ ] **Step 1: Replace font size tokens with 5-tier scale**

Replace the `FSDisplay` and `FSContent` objects and the combined `FS` export with:

```typescript
// ── Font-size tokens — 5-tier scale ─────────────────────────────────────────
// Consolidated from 11 sizes to 5. Each tier has a single role-based value.
// Hierarchy within a tier is created by opacity and weight, not by size.

export const FS = {
  // Display — hero elements
  display:    76,   // hero hanzi character (Noto Serif SC, weight 300)

  // Large — secondary focal point
  large:      22,   // example sentence hanzi (Noto Serif SC, weight 300)

  // Body — readable text
  body:       13,   // pinyin, english meaning, example pinyin (Inconsolata)

  // Small — supporting text
  small:      10,   // score strip, example english, ♪ icon, top bar icons

  // Micro — decorative / metadata
  micro:       8,   // HSK badge, POS tag, tap hint, corner ornaments

  // Legacy aliases — used by screens outside session.tsx
  // These map old token names to the new scale for backward compat.
  // Remove as other screens migrate.
  hanzi:      76,   // → display
  formTitle:  24,   // unchanged — used by session-setup, home, auth
  pinyin:     13,   // → body
  definition: 13,   // → body
  input:      14,   // unchanged — used by form fields
  body13:     13,   // → body (renamed to avoid collision with body)
  ctaLabel:   12,   // unchanged — used by Button component
  progress:   12,   // unchanged — used outside session
  exPinyin:   13,   // → body (was 11)
  label:      10,   // → small
  micro8:      8,   // → micro (renamed to avoid collision)
} as const;
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors. If other files reference removed token names (e.g., `FS.pinyin`), the legacy aliases will catch them.

- [ ] **Step 3: Commit**

```bash
git add theme/tokens.ts
git commit -m "feat: consolidate type scale to 5 tiers (76, 22, 13, 10, 8)"
```

---

### Task 3: Add new color tokens for buttons and flash

**Files:**
- Modify: `theme/colors.ts:4-50` (ColorTheme interface + both palettes)

- [ ] **Step 1: Add new color tokens to the `ColorTheme` interface**

Add after the `gotGlow` line (around line 42):

```typescript
  // Terminal Scholar — warm button palette (dark mode)
  forgotBtn:       string;
  forgotBtnBorder: string;
  gotBtn:          string;
  gotBtnBorder:    string;
  scoreForgot:     string;
  scoreGot:        string;
  scoreRemaining:  string;

  // Card flash feedback
  flashForgotBorder: string;
  flashForgotGlow:   string;
  flashForgotInset:  string;
  flashGotBorder:    string;
  flashGotGlow:      string;
  flashGotInset:     string;

  // Card surface (dark elevation)
  cardElevation:    string;
  cardHairline:     string;
```

- [ ] **Step 2: Add dark palette values**

Add to the `dark` object, after the existing `gotGlow` line:

```typescript
  forgotBtn:       'rgba(180,120,70,0.7)',
  forgotBtnBorder: 'rgba(180,120,70,0.3)',
  gotBtn:          'rgba(140,160,100,0.7)',
  gotBtnBorder:    'rgba(140,160,100,0.3)',
  scoreForgot:     'rgba(180,120,70,0.75)',
  scoreGot:        'rgba(140,160,100,0.75)',
  scoreRemaining:  'rgba(232,224,208,0.50)',

  flashForgotBorder: 'rgba(180,120,70,1.0)',
  flashForgotGlow:   'rgba(180,120,70,0.5)',
  flashForgotInset:  'rgba(180,120,70,0.15)',
  flashGotBorder:    'rgba(140,160,100,1.0)',
  flashGotGlow:      'rgba(140,160,100,0.5)',
  flashGotInset:     'rgba(140,160,100,0.15)',

  cardElevation:    'rgba(0,0,0,0.5)',
  cardHairline:     'rgba(232,224,208,0.04)',
```

- [ ] **Step 3: Add light palette values**

Add to the `light` object, after the existing `gotGlow` line:

```typescript
  forgotBtn:       'rgba(168,40,24,0.6)',
  forgotBtnBorder: 'rgba(168,40,24,0.25)',
  gotBtn:          'rgba(45,110,56,0.6)',
  gotBtnBorder:    'rgba(45,110,56,0.25)',
  scoreForgot:     'rgba(168,40,24,0.70)',
  scoreGot:        'rgba(45,110,56,0.70)',
  scoreRemaining:  'rgba(42,36,26,0.50)',

  flashForgotBorder: 'rgba(168,40,24,1.0)',
  flashForgotGlow:   'rgba(168,40,24,0.4)',
  flashForgotInset:  'rgba(168,40,24,0.1)',
  flashGotBorder:    'rgba(45,110,56,1.0)',
  flashGotGlow:      'rgba(45,110,56,0.4)',
  flashGotInset:     'rgba(45,110,56,0.1)',

  cardElevation:    'rgba(0,0,0,0)',
  cardHairline:     'rgba(0,0,0,0)',
```

Note: light mode card has no shadow/hairline, so these are transparent. This lets the session code apply them unconditionally.

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add theme/colors.ts
git commit -m "feat: add warm button, flash, and card elevation color tokens"
```

---

### Task 4: Update opacity tokens

**Files:**
- Modify: `theme/colors.ts` (add opacity tokens to interface and palettes)

- [ ] **Step 1: Add opacity tokens to `ColorTheme` interface**

Add after the `cardHairline` line:

```typescript
  // Opacity scale — used for text hierarchy within the card
  opPinyin:         number;
  opMeaning:        number;
  opExampleEnglish: number;
  opDecorative:     number;
  opScoreColor:     number;
  opHskBadge:       number;
  opOrnament:       number;
```

- [ ] **Step 2: Add dark mode opacity values**

```typescript
  opPinyin:         0.55,
  opMeaning:        0.55,
  opExampleEnglish: 0.30,
  opDecorative:     0.15,
  opScoreColor:     0.75,
  opHskBadge:       0.30,
  opOrnament:       0.20,
```

- [ ] **Step 3: Add light mode opacity values**

```typescript
  opPinyin:         0.65,
  opMeaning:        0.58,
  opExampleEnglish: 0.30,
  opDecorative:     0.12,
  opScoreColor:     0.70,
  opHskBadge:       0.20,
  opOrnament:       0.12,
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add theme/colors.ts
git commit -m "feat: add opacity tokens for card text hierarchy"
```

---

### Task 5: Refactor session.tsx — card surface and container

**Files:**
- Modify: `app/session.tsx:460-480` (card container styles)
- Modify: `app/session.tsx:690-705` (makeStyles cardContainer)

- [ ] **Step 1: Update DialKit card parameters**

In the `useDialKit` call (around line 98), update card-related parameters:

Replace:
```typescript
cardBorderWidth:  [1.5, 0.5, 4],
```
With:
```typescript
cardBorderWidth:  [0, 0, 0],
```

- [ ] **Step 2: Update card container styles in `makeStyles`**

Replace the `cardContainer` style (around line 690):

```typescript
cardContainer: {
  width: '100%', maxWidth: 340,
  backgroundColor: t.bgCard,
  borderWidth: 0,
  paddingHorizontal: space.xxl,
  paddingTop: 28,
  paddingBottom: space.lg,
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  ...(Platform.OS === 'web' ? {
    boxShadow: `0 2px 16px ${t.cardElevation}, 0 0 0 1px ${t.cardHairline}`,
  } as any : {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: t.cardElevation === 'rgba(0,0,0,0)' ? 0 : 0.5,
    shadowRadius: 16,
    elevation: t.cardElevation === 'rgba(0,0,0,0)' ? 0 : 12,
  }),
},
```

- [ ] **Step 3: Remove scanlines from inside the card**

In the card render (around line 482), remove or comment out:

```typescript
<Scanlines color={colors.scanline} gap={4} />
```

This is the `Scanlines` inside the card container only. The page-level `Scanlines` at line 424 stays.

- [ ] **Step 4: Verify card renders correctly**

Run:
```bash
npx expo start --web
```
Navigate to a flashcard session. Verify:
- Dark mode: card has subtle shadow, no visible border, no scanlines inside card
- Light mode: card has no shadow, defined by color step only
- Page-level scanlines still present

- [ ] **Step 5: Commit**

```bash
git add app/session.tsx
git commit -m "feat: card surface — elevation shadow dark, no border light, remove card scanlines"
```

---

### Task 6: Refactor session.tsx — typography and font swap

**Files:**
- Modify: `app/session.tsx:1-25` (imports)
- Modify: `app/session.tsx:662-795` (makeStyles)

- [ ] **Step 1: Add Inconsolata imports**

At the top of `session.tsx`, add to the import from `@/theme/tokens`:

```typescript
import { INCONSOLATA, INCONSOLATA_MEDIUM, MONO, FS, FW, LH, LS } from '@/theme/tokens';
```

Remove `MONO_MEDIUM` from the import if present (Inconsolata medium replaces it for session use).

- [ ] **Step 2: Update hanzi character style**

Replace the `hanziChar` style:

```typescript
hanziChar: {
  fontFamily: hanziFont,
  fontSize: FS.display,
  fontWeight: hanziWeight as any,
  color: t.textHanzi,
  alignSelf: 'center',
  lineHeight: FS.display * LH.single,
  letterSpacing: LS.tighter * FS.display,
  textAlign: 'center',
  maxWidth: '100%',
  textShadowColor: t.inkRedGlow,
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 40,
  marginBottom: space.xl,
},
```

- [ ] **Step 3: Update pinyin styles — upright, weight 500, Inconsolata**

Replace `pinyinRow` and `pinyinText`:

```typescript
pinyinRow: {
  flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6,
  marginBottom: space.lg,
},
pinyinText: {
  fontFamily: INCONSOLATA_MEDIUM, fontSize: FS.body, fontWeight: '500',
  letterSpacing: LS.wider * FS.body,
  color: t.textPrimary, opacity: t.opPinyin,
},
pinyinAudio: {
  fontFamily: INCONSOLATA, fontSize: FS.small, color: t.textFaint, opacity: 0.5,
},
```

Note: no `fontStyle: 'italic'` — pinyin is upright now.

- [ ] **Step 4: Update POS tag — single letter, micro size, above meaning**

Replace `posTag`:

```typescript
posTag: {
  fontFamily: INCONSOLATA, fontSize: FS.micro,
  color: t.textPrimary, opacity: t.opDecorative,
  letterSpacing: 2, textTransform: 'uppercase',
  marginBottom: 1,
},
```

- [ ] **Step 5: Update meaning text**

Replace `meaningText`:

```typescript
meaningText: {
  fontFamily: INCONSOLATA, fontSize: FS.body, fontWeight: FW.regular, color: t.textPrimary,
  opacity: t.opMeaning,
  lineHeight: FS.body * LH.normal, letterSpacing: LS.wide * FS.body,
},
```

- [ ] **Step 6: Update example sentence styles**

Replace `exHanzi`, `exPinyin`, `exTranslation`:

```typescript
exHanzi: {
  fontFamily: hanziFont, fontSize: FS.large, fontWeight: hanziWeight as any,
  color: t.textPrimary,
  lineHeight: FS.large * LH.single, letterSpacing: LS.example * FS.large,
  marginBottom: space.sm,
},
exPinyin: {
  fontFamily: INCONSOLATA, fontSize: FS.body, color: t.textPrimary,
  opacity: t.opMeaning,
  letterSpacing: LS.example * FS.body, lineHeight: FS.body * LH.normal,
  marginBottom: space.xs,
},
exTranslation: {
  fontFamily: INCONSOLATA, fontSize: FS.small, color: t.textPrimary,
  opacity: t.opExampleEnglish,
},
```

- [ ] **Step 7: Update tap hint**

Replace `tapHint`:

```typescript
tapHint: {
  marginTop: space.md, alignSelf: 'center',
  fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textPrimary,
  opacity: t.opDecorative,
  letterSpacing: LS.extreme * FS.micro, textTransform: 'uppercase',
},
```

- [ ] **Step 8: Update HSK badge**

Replace `hskBadgeText`:

```typescript
hskBadgeText: {
  fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textPrimary,
  letterSpacing: 1.5, opacity: t.opHskBadge,
},
```

- [ ] **Step 9: Update score strip**

Replace `scoreItem`, `scoreForgot`, `scoreGot`, `scorePending`, `scoreSep`:

```typescript
scoreItem:   { fontFamily: INCONSOLATA, fontSize: FS.small, fontWeight: FW.regular },
scoreForgot: { color: t.scoreForgot },
scoreGot:    { color: t.scoreGot },
scorePending:{ color: t.scoreRemaining },
scoreSep:    { fontFamily: INCONSOLATA, color: t.textFaint, fontSize: FS.small },
```

- [ ] **Step 10: Update top bar icon text**

Replace `iconBtnText`:

```typescript
iconBtnText: { fontSize: FS.small, fontFamily: INCONSOLATA, letterSpacing: LS.tighter * FS.small, color: t.textSecondary },
```

- [ ] **Step 11: Update translate hint text**

Replace `translateHintText`:

```typescript
translateHintText: {
  fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textFaint,
  letterSpacing: LS.widest * FS.micro, textTransform: 'uppercase',
},
```

- [ ] **Step 12: Update divider position in render**

In the card render JSX, move the divider. Currently it sits between pinyin and meaning. Move it to between the meaning block and the example block. Find the `{/* Stage 2: POS + definition — staggered reveal */}` section and restructure so the divider comes after the meaning text, before the example block.

The content order should be:
1. Hanzi (already there)
2. Pinyin row (already there)
3. POS tag + meaning text (no divider above)
4. Divider
5. Example sentence block

- [ ] **Step 13: Update POS tag render — single letter**

In the card render, find where `card.part_of_speech` is rendered. Change from rendering the full word to a single letter:

```typescript
{card.part_of_speech && (
  <Text style={[s.posTag, { fontSize: dk.posSize, letterSpacing: dk.posLetterSpacing, marginBottom: dk.posMarginBot, color: dk.posColor }]}>
    {card.part_of_speech.charAt(0).toUpperCase()}
  </Text>
)}
```

- [ ] **Step 14: Verify typography renders correctly**

Run:
```bash
npx expo start --web
```
Navigate to a flashcard session. Verify:
- All non-Chinese text renders in Inconsolata
- Pinyin is upright (not italic), weight 500
- POS shows as single letter (V, N, A)
- Example hanzi is larger (22px)
- Divider sits between meaning and example
- No layout breaks

- [ ] **Step 15: Commit**

```bash
git add app/session.tsx
git commit -m "feat: swap to Inconsolata, 5-tier type scale, upright pinyin, restructure card layout"
```

---

### Task 7: Refactor session.tsx — rating buttons

**Files:**
- Modify: `app/session.tsx:605-654` (button render)
- Modify: `app/session.tsx:797-819` (button styles)

- [ ] **Step 1: Update button styles in `makeStyles`**

Replace `rateBtnForgot`, `rateBtnGot`, and `rateBtnIcon`:

```typescript
rateBtnForgot: {
  backgroundColor: 'transparent',
  borderColor: t.forgotBtnBorder,
},
rateBtnGot: {
  backgroundColor: 'transparent',
  borderColor: t.gotBtnBorder,
},
rateBtnIcon: { fontFamily: MONO, fontSize: 20 },
```

Note: `rateBtnIcon` keeps `MONO` (IBM Plex Mono) — this is intentional per spec.

- [ ] **Step 2: Update button hover states in render**

Replace the forgot button's hover style (around line 610):

```typescript
hoveredBtn === 'forgot' && {
  backgroundColor: t.forgotBtnBorder,
  borderColor: t.forgotBtn,
  ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${t.forgotBtnBorder}` } as any : {}),
},
```

Replace the got button's hover style (around line 635):

```typescript
hoveredBtn === 'got' && {
  backgroundColor: t.gotBtnBorder,
  borderColor: t.gotBtn,
  ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${t.gotBtnBorder}` } as any : {}),
},
```

- [ ] **Step 3: Update button icon colors in render**

For the forgot button icon text (around line 626):

```typescript
<Text style={[s.rateBtnIcon, {
  color: hoveredBtn === 'forgot' ? t.forgotBtn : t.forgotBtn,
  fontSize: dk.rateBtnIconSize,
}]}>×</Text>
```

For the got button icon text (around line 650):

```typescript
<Text style={[s.rateBtnIcon, {
  color: hoveredBtn === 'got' ? t.gotBtn : t.gotBtn,
  fontSize: dk.rateBtnIconSize,
}]}>✓</Text>
```

- [ ] **Step 4: Remove scanlines from buttons**

Remove the `<Scanlines color={colors.scanline} gap={4} />` from inside both rating buttons (around lines 624 and 648).

- [ ] **Step 5: Verify buttons render correctly**

Run:
```bash
npx expo start --web
```
Verify:
- Square buttons with 1px border, no fill
- Dark mode: amber × and sage ✓
- Light mode: ink-red × and forest ✓
- Hover: border brightens, subtle glow
- No scanlines inside buttons
- Icons render in IBM Plex Mono at matched visual weight

- [ ] **Step 6: Commit**

```bash
git add app/session.tsx
git commit -m "feat: square rating buttons with warm amber/sage (dark) and ink-red/forest (light)"
```

---

### Task 8: Update card flash feedback colors

**Files:**
- Modify: `app/session.tsx:580-599` (flash overlay)

- [ ] **Step 1: Update flash overlay to use new color tokens**

Replace the flash `Animated.View` style (around line 580):

```typescript
<Animated.View
  pointerEvents="none"
  style={[
    StyleSheet.absoluteFillObject,
    {
      borderWidth: 2,
      borderColor: flashColor.current === 'got'
        ? colors.flashGotBorder
        : colors.flashForgotBorder,
      opacity: flashAnim,
      ...(Platform.OS === 'web' ? {
        boxShadow: flashColor.current === 'got'
          ? `0 0 30px ${colors.flashGotGlow}, inset 0 0 20px ${colors.flashGotInset}`
          : `0 0 30px ${colors.flashForgotGlow}, inset 0 0 20px ${colors.flashForgotInset}`,
      } as any : {}),
    },
  ]}
/>
```

- [ ] **Step 2: Verify flash feedback**

Run the app, go through a flashcard session, tap Got and Forgot. Verify:
- Dark mode: warm amber flash on forgot, sage flash on got
- Light mode: ink-red flash on forgot, forest flash on got
- Glow fades smoothly over 600ms

- [ ] **Step 3: Commit**

```bash
git add app/session.tsx
git commit -m "feat: card flash uses warm button palette colors"
```

---

### Task 9: Update DialKit defaults

**Files:**
- Modify: `app/session.tsx:98-196` (DialKit parameter block)

- [ ] **Step 1: Update font size DialKit params to new scale**

Update these parameters in the `useDialKit` call:

```typescript
// Corner ornaments — use theme opacity
ornamentOpacity:  [colors.opOrnament, 0.05, 1],

// Hanzi hero
hanziSize:        [76, 48, 120],

// Pinyin
pinyinSize:       [13, 10, 22],

// POS tag
posSize:          [8, 6, 12],

// Meaning
meaningSize:      [13, 10, 18],

// Hint block
exHanziSize:      [22, 14, 32],
exPinyinSize:     [13, 10, 18],
exTranslSize:     [10, 8, 14],

// Tap hint
tapHintSize:      [8, 6, 12],

// HSK badge
badgeSize:        [8, 6, 12],

// Score strip
scoreSize:        [10, 8, 14],
scoreSepSize:     [10, 6, 14],
```

- [ ] **Step 2: Verify DialKit still works**

Run the app, open the DialKit overlay (if available), verify sliders adjust the card smoothly with the new default values.

- [ ] **Step 3: Commit**

```bash
git add app/session.tsx
git commit -m "feat: update DialKit defaults to 5-tier type scale"
```

---

### Task 10: Smoke test full flow

**Files:** None — testing only

- [ ] **Step 1: Test dark mode full session**

Run:
```bash
npx expo start --web
```

Start a flashcard session in dark mode. Verify the complete flow:
1. Card entrance animation works
2. Stage 0: hero hanzi centered, tap hint visible
3. Tap → Stage 1: pinyin appears (spring animation), upright, weight 500
4. Tap → Stage 2: POS letter + meaning + divider + example stagger in
5. Example hanzi is 22px (larger than before)
6. Divider sits between meaning and example
7. Rating buttons: square, amber/sage, no scanlines
8. Flash feedback: warm colors
9. Next card animates in
10. Session complete screen renders (unchanged)

- [ ] **Step 2: Test light mode full session**

Switch to light mode. Repeat the same flow. Verify:
1. Card has no shadow, no border — just the color step
2. Buttons use ink-red/forest colors
3. Flash uses ink-red/forest glow
4. All text readable

- [ ] **Step 3: Test responsive behavior**

Resize browser window below 768px (mobile) and above (desktop). Verify the card scales correctly via `ResponsiveShell`.

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit any fixes discovered during testing**

If any issues found, fix and commit with descriptive message.
