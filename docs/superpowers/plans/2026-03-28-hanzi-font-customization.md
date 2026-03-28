# Hanzi Font Customization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users choose their Hanzi display font from 5 options, persisted locally and synced to Supabase.

**Architecture:** Extend the existing ThemeContext with font state (same pattern as color mode). A font registry (`theme/fonts.ts`) defines all available fonts. A preferences lib (`lib/preferences.ts`) syncs to a new `preferences` JSONB column on the `profiles` table. A dedicated font picker screen uses the new `FlashcardPreview` and `FontOptionRow` design system components.

**Tech Stack:** Expo Router, React Native, Supabase, AsyncStorage, Google Fonts CDN, LXGW WenKai webfont (npm/jsDelivr)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `theme/fonts.ts` | Font registry: types, font definitions, lookup |
| Create | `lib/preferences.ts` | Supabase preferences JSONB sync |
| Create | `components/FlashcardPreview.tsx` | Read-only flashcard preview component |
| Create | `components/FontOptionRow.tsx` | Selectable font option row component |
| Create | `app/font-picker.tsx` | Font picker screen |
| Modify | `context/ThemeContext.tsx` | Add fonts state, setHanziFont, persistence |
| Modify | `app/_layout.tsx` | Font loading + register font-picker route |
| Modify | `app/settings.tsx` | Add "Hanzi Font" row |
| Modify | `app/session.tsx` | Replace static SERIF with fonts.hanzi |
| Modify | `app/card-detail.tsx` | Replace static SERIF with fonts.hanzi |
| Modify | `components/SearchResultRow.tsx` | Replace static SERIF with fonts.hanzi |
| Modify | `DESIGN_SYSTEM.md` | Document new components |
| Modify | `app/design-system.tsx` | Add showcase sections |
| DB | Supabase dashboard | Add preferences JSONB column |

---

### Task 1: Font Registry (`theme/fonts.ts`)

**Files:**
- Create: `theme/fonts.ts`

- [ ] **Step 1: Create the font registry file**

```ts
// theme/fonts.ts
import { Platform } from 'react-native';

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
  preview: string;
  style: string;
  description: string;
};

export const DEFAULT_HANZI_FONT: HanziFontId = 'lxgw-wenkai';

export const HANZI_FONTS: HanziFontDef[] = [
  {
    id: 'lxgw-wenkai',
    label: 'LXGW WenKai',
    family: {
      web: '"LXGW WenKai Screen", "LXGW WenKai TC", serif',
      native: 'LXGWWenKai-Regular',
    },
    weight: '400',
    preview: '永',
    style: 'Kai · 楷体',
    description: 'Handcrafted, warm, natural strokes',
  },
  {
    id: 'noto-serif',
    label: 'Noto Serif SC',
    family: {
      web: '"Noto Serif SC", "STSong", serif',
      native: 'NotoSerifSC-Light',
    },
    weight: '300',
    preview: '永',
    style: 'Song · Serif',
    description: 'Elegant, traditional, refined',
  },
  {
    id: 'noto-sans',
    label: 'Noto Sans SC',
    family: {
      web: '"Noto Sans SC", sans-serif',
      native: 'NotoSansSC-Regular',
    },
    weight: '400',
    preview: '永',
    style: 'Sans · Gothic',
    description: 'Clean, minimal, easy to read',
  },
  {
    id: 'ma-shan-zheng',
    label: 'Ma Shan Zheng',
    family: {
      web: '"Ma Shan Zheng", cursive',
      native: 'MaShanZheng-Regular',
    },
    weight: '400',
    preview: '永',
    style: 'Calligraphy',
    description: 'Expressive, ink-on-paper, artistic',
  },
  {
    id: 'harmonyos-sans',
    label: 'HarmonyOS Sans',
    family: {
      web: '"HarmonyOS Sans", "Noto Sans SC", sans-serif',
      native: 'HarmonyOSSans-Regular',
    },
    weight: '400',
    preview: '永',
    style: 'Geometric · Gothic',
    description: 'Precise, geometric, modern',
  },
];

export function getHanziFont(id: HanziFontId): HanziFontDef {
  return HANZI_FONTS.find(f => f.id === id) ?? HANZI_FONTS[0];
}

export function resolveHanziFontFamily(id: HanziFontId): { family: string; weight: string } {
  const def = getHanziFont(id);
  return {
    family: Platform.OS === 'web' ? def.family.web : def.family.native,
    weight: def.weight,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add theme/fonts.ts
git commit -m "feat: add hanzi font registry with 5 font definitions"
```

---

### Task 2: Preferences Sync (`lib/preferences.ts`)

**Files:**
- Create: `lib/preferences.ts`

**Prerequisite:** Run in Supabase dashboard:
```sql
ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
```

- [ ] **Step 1: Create the preferences lib**

```ts
// lib/preferences.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { HanziFontId } from '@/theme/fonts';

export type UserPreferences = {
  hanzi_font?: HanziFontId;
};

const PREFS_STORAGE_KEY = 'hanziflash_preferences';

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('profiles')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data?.preferences) return {};
  return data.preferences as UserPreferences;
}

export async function savePreference(
  userId: string,
  key: keyof UserPreferences,
  value: any,
): Promise<void> {
  // Read current prefs, merge, write back
  const current = await fetchPreferences(userId);
  const updated = { ...current, [key]: value };

  // Fire-and-forget to Supabase
  supabase
    .from('profiles')
    .update({ preferences: updated })
    .eq('user_id', userId)
    .then(({ error }) => {
      if (error) console.warn('[preferences] savePreference:', error.message);
    });
}

export async function syncPreferencesToLocal(userId: string): Promise<UserPreferences> {
  const remote = await fetchPreferences(userId);
  if (Object.keys(remote).length > 0) {
    await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(remote));
  }
  return remote;
}

export async function getLocalPreferences(): Promise<UserPreferences> {
  const raw = await AsyncStorage.getItem(PREFS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function setLocalPreference(
  key: keyof UserPreferences,
  value: any,
): Promise<void> {
  const current = await getLocalPreferences();
  const updated = { ...current, [key]: value };
  await AsyncStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updated));
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add lib/preferences.ts
git commit -m "feat: add preferences sync lib with Supabase JSONB"
```

---

### Task 3: Extend ThemeContext with Font State

**Files:**
- Modify: `context/ThemeContext.tsx`

- [ ] **Step 1: Add font imports and types**

At the top of the file, add:

```ts
import { HanziFontId, DEFAULT_HANZI_FONT, resolveHanziFontFamily } from '@/theme/fonts';
```

Replace the `ThemeContextValue` interface:

```ts
interface ThemeContextValue {
  colors: ColorTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  fonts: { hanzi: string; hanziWeight: string };
  hanziFontId: HanziFontId;
  setHanziFont: (id: HanziFontId) => void;
}
```

- [ ] **Step 2: Add font storage key and state**

Add below `THEME_STORAGE_KEY`:

```ts
const FONT_STORAGE_KEY = 'hanziflash_hanzi_font';
```

Inside `ThemeProvider`, add after the `mode` state:

```ts
const [hanziFontId, setHanziFontIdState] = useState<HanziFontId>(DEFAULT_HANZI_FONT);
```

- [ ] **Step 3: Load font preference on mount**

Replace the existing `useEffect` that loads the theme with one that loads both:

```ts
useEffect(() => {
  Promise.all([
    AsyncStorage.getItem(THEME_STORAGE_KEY),
    AsyncStorage.getItem(FONT_STORAGE_KEY),
  ]).then(([storedTheme, storedFont]) => {
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      setModeState(storedTheme);
    }
    if (storedFont) {
      setHanziFontIdState(storedFont as HanziFontId);
    }
    setLoaded(true);
  });
}, []);
```

- [ ] **Step 4: Add setHanziFont callback and resolve fonts**

After the `setMode` callback:

```ts
const setHanziFont = useCallback((id: HanziFontId) => {
  setHanziFontIdState(id);
  AsyncStorage.setItem(FONT_STORAGE_KEY, id);
}, []);

const { family: hanziFamily, weight: hanziWeight } = resolveHanziFontFamily(hanziFontId);
const fonts = { hanzi: hanziFamily, hanziWeight };
```

- [ ] **Step 5: Update Provider value**

Replace the Provider's `value` prop:

```ts
<ThemeContext.Provider value={{ colors, mode, isDark, setMode, fonts, hanziFontId, setHanziFont }}>
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 7: Commit**

```bash
git add context/ThemeContext.tsx
git commit -m "feat: extend ThemeContext with hanzi font state and persistence"
```

---

### Task 4: Update Font Loading in Root Layout

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Update Google Fonts CDN link to include all fonts**

Replace the existing `link.href` line (line 25) with:

```ts
link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@300&family=Noto+Sans+SC:wght@400&family=Ma+Shan+Zheng&family=LXGW+WenKai+TC:wght@400&display=swap';
```

Add a second `<link>` for HarmonyOS Sans after the Google Fonts link:

```ts
const link2 = document.createElement('link');
link2.rel = 'stylesheet';
link2.href = 'https://fonts.cdnfonts.com/css/harmonyos-sans';
document.head.appendChild(link2);
```

And a third for LXGW WenKai screen webfont (the optimized SC version):

```ts
const link3 = document.createElement('link');
link3.rel = 'stylesheet';
link3.href = 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1/style.css';
document.head.appendChild(link3);
```

- [ ] **Step 2: Register font-picker Stack.Screen**

Add after the `card-detail` screen registration:

```ts
<Stack.Screen name="font-picker" options={{ animation: 'slide_from_right' }} />
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load all hanzi fonts on web, register font-picker route"
```

---

### Task 5: FlashcardPreview Component

**Files:**
- Create: `components/FlashcardPreview.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/FlashcardPreview.tsx
import { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { MONO, FS, FW, LS, LH } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface FlashcardPreviewProps {
  hanzi: string;
  pinyin: string;
  meaning: string;
  exHanzi?: string;
  exPinyin?: string;
  exMeaning?: string;
  fontFamily?: string;
  fontWeight?: string;
  size?: 'default' | 'compact';
  showOrnaments?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function FlashcardPreview({
  hanzi,
  pinyin,
  meaning,
  exHanzi,
  exPinyin,
  exMeaning,
  fontFamily,
  fontWeight,
  size = 'default',
  showOrnaments = true,
  style,
}: FlashcardPreviewProps) {
  const { colors, fonts } = useTheme();
  const resolvedFamily = fontFamily ?? fonts.hanzi;
  const resolvedWeight = fontWeight ?? fonts.hanziWeight;
  const isCompact = size === 'compact';
  const s = useMemo(() => makeStyles(colors, isCompact), [colors, isCompact]);

  return (
    <View style={[s.card, style]}>
      {showOrnaments && (
        <>
          <Text style={s.ornamentTL}>{Icon.ornament}</Text>
          <Text style={s.ornamentBR}>{Icon.ornament}</Text>
        </>
      )}
      <Text style={[s.hanzi, { fontFamily: resolvedFamily, fontWeight: resolvedWeight as any }]}>
        {hanzi}
      </Text>
      <Text style={s.pinyin}>{pinyin}</Text>
      <Text style={s.meaning}>{meaning}</Text>
      {exHanzi && (
        <View style={s.example}>
          <Text style={[s.exHanzi, { fontFamily: resolvedFamily }]}>{exHanzi}</Text>
          {exPinyin && <Text style={s.exPinyin}>{exPinyin}</Text>}
          {exMeaning && <Text style={s.exMeaning}>{exMeaning}</Text>}
        </View>
      )}
    </View>
  );
}

const makeStyles = (t: ColorTheme, compact: boolean) => StyleSheet.create({
  card: {
    backgroundColor: t.bgCard,
    borderWidth: 1.5,
    borderColor: t.border,
    padding: compact ? space.xxl : space.xxxl,
    alignItems: 'center',
    position: 'relative',
  },
  ornamentTL: {
    position: 'absolute', top: 8, left: 10,
    fontFamily: MONO, fontSize: 10, color: t.inkRedDim,
  },
  ornamentBR: {
    position: 'absolute', bottom: 8, right: 10,
    fontFamily: MONO, fontSize: 10, color: t.inkRedDim,
  },
  hanzi: {
    fontSize: compact ? 72 : FS.hanzi,
    color: t.textHanzi,
    lineHeight: (compact ? 72 : FS.hanzi) * LH.single,
    letterSpacing: LS.tighter * (compact ? 72 : FS.hanzi),
  },
  pinyin: {
    fontFamily: MONO,
    fontSize: compact ? FS.body : FS.pinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.wider * (compact ? FS.body : FS.pinyin),
    marginTop: space.md,
  },
  meaning: {
    fontFamily: MONO,
    fontSize: compact ? FS.body : FS.definition,
    fontWeight: FW.light,
    color: t.textPrimary,
    letterSpacing: LS.wide * (compact ? FS.body : FS.definition),
    lineHeight: (compact ? FS.body : FS.definition) * LH.normal,
    marginTop: space.sm,
    textAlign: 'center',
  },
  example: {
    borderTopWidth: 1,
    borderTopColor: t.borderDim,
    marginTop: space.lg,
    paddingTop: space.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  exHanzi: {
    fontSize: FS.definition,
    color: t.textHanzi,
    lineHeight: FS.definition * LH.normal,
  },
  exPinyin: {
    fontFamily: MONO,
    fontSize: FS.exPinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.example * FS.exPinyin,
    marginTop: space.xs,
  },
  exMeaning: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.body,
    lineHeight: FS.body * LH.normal,
    marginTop: space.xs,
  },
});
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add components/FlashcardPreview.tsx
git commit -m "feat: add FlashcardPreview design system component"
```

---

### Task 6: FontOptionRow Component

**Files:**
- Create: `components/FontOptionRow.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/FontOptionRow.tsx
import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { Icon } from '@/theme/icons';

interface FontOptionRowProps {
  character: string;
  fontFamily: string;
  fontWeight?: string;
  label: string;
  description: string;
  active: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function FontOptionRow({
  character,
  fontFamily,
  fontWeight = '400',
  label,
  description,
  active,
  onPress,
  style,
}: FontOptionRowProps) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [hovered, setHovered] = useState(false);

  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  } as any : {};

  return (
    <TouchableOpacity
      style={[s.row, hovered && s.rowHovered, active && s.rowActive, style]}
      onPress={onPress}
      activeOpacity={0.75}
      {...webHoverProps}
    >
      <View style={s.charBox}>
        <Text style={[s.char, { fontFamily, fontWeight: fontWeight as any }]}>
          {character}
        </Text>
      </View>
      <View style={s.info}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.desc}>{description}</Text>
      </View>
      <Text style={[s.check, active && s.checkActive]}>{Icon.correct}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.bgCard,
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'border-color 150ms ease, background-color 150ms ease',
    } as any : {}),
  },
  rowHovered: {
    borderColor: t.inkRed,
    backgroundColor: t.inkRedGlow,
  },
  rowActive: {
    borderColor: t.inkRedDim,
    backgroundColor: t.inkRedGlow,
  },

  charBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  char: {
    fontSize: 28,
    color: t.textHanzi,
    lineHeight: 36,
  },

  info: { flex: 1 },
  label: {
    fontFamily: MONO,
    fontSize: FS.body,
    fontWeight: FW.medium,
    color: t.textPrimary,
    letterSpacing: LS.wide * FS.body,
    marginBottom: 1,
  },
  desc: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.label,
  },

  check: {
    fontFamily: MONO,
    fontSize: FS.definition,
    color: t.inkRed,
    opacity: 0,
  },
  checkActive: {
    opacity: 1,
  },
});
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add components/FontOptionRow.tsx
git commit -m "feat: add FontOptionRow design system component"
```

---

### Task 7: Font Picker Screen

**Files:**
- Create: `app/font-picker.tsx`

- [ ] **Step 1: Create the font picker screen**

```tsx
// app/font-picker.tsx
import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { ColorTheme } from '@/theme/colors';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { Button } from '@/components/Button';
import { FlashcardPreview } from '@/components/FlashcardPreview';
import { FontOptionRow } from '@/components/FontOptionRow';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { HANZI_FONTS, getHanziFont, resolveHanziFontFamily } from '@/theme/fonts';
import { savePreference } from '@/lib/preferences';

export default function FontPickerScreen() {
  const { user } = useAuth();
  const { colors, hanziFontId, setHanziFont } = useTheme();
  const { isDesktop } = useResponsive();
  const s = useMemo(() => makeStyles(colors, isDesktop), [colors, isDesktop]);

  const selectedDef = getHanziFont(hanziFontId);
  const { family: selectedFamily, weight: selectedWeight } = resolveHanziFontFamily(hanziFontId);

  const handleSelect = (id: typeof hanziFontId) => {
    setHanziFont(id);
    if (user?.id) {
      savePreference(user.id, 'hanzi_font', id);
    }
  };

  const preview = (
    <FlashcardPreview
      hanzi="永"
      pinyin="yǒng"
      meaning="eternal, forever"
      exHanzi="天地玄黄，宇宙洪荒。"
      exPinyin="tiān dì xuán huáng, yǔ zhòu hóng huāng"
      exMeaning="Heaven and earth, dark and yellow"
      fontFamily={selectedFamily}
      fontWeight={selectedWeight}
      size={isDesktop ? 'default' : 'compact'}
    />
  );

  const fontList = (
    <View style={s.fontList}>
      <Text style={s.sectionLabel}>SELECT FONT</Text>
      {HANZI_FONTS.map(font => {
        const { family } = resolveHanziFontFamily(font.id);
        return (
          <FontOptionRow
            key={font.id}
            character={font.preview}
            fontFamily={family}
            fontWeight={font.weight}
            label={font.label}
            description={font.description}
            active={hanziFontId === font.id}
            onPress={() => handleSelect(font.id)}
            style={s.fontRow}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={isDesktop ? 720 : 520} align="start">
        <ScrollView contentContainerStyle={s.scroll}>
          {/* Header */}
          <View style={s.nav}>
            <Button
              label={`${Icon.left} Back`}
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>
          <Text style={s.title}>Hanzi Font</Text>

          {/* Desktop: list left, preview right */}
          {isDesktop ? (
            <View style={s.desktopLayout}>
              <View style={s.desktopLeft}>{fontList}</View>
              <View style={s.desktopRight}>
                <Text style={s.sectionLabel}>PREVIEW</Text>
                {preview}
              </View>
            </View>
          ) : (
            <>
              {preview}
              <View style={s.mobileList}>{fontList}</View>
            </>
          )}
        </ScrollView>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme, isDesktop: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  scroll: { paddingBottom: space.massive },

  nav: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  title: {
    fontFamily: MONO,
    fontSize: FS.formTitle,
    fontWeight: FW.medium,
    color: t.textPrimary,
    letterSpacing: LS.tighter * FS.formTitle,
    paddingHorizontal: space.xl,
    marginBottom: space.xxl,
  },

  sectionLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.medium,
    color: t.textFaint,
    letterSpacing: LS.widest * FS.label,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },

  // Desktop: side-by-side
  desktopLayout: {
    flexDirection: 'row',
    gap: space.xxxl,
    paddingHorizontal: space.xl,
  },
  desktopLeft: {
    width: '35%' as any,
  },
  desktopRight: {
    flex: 1,
  },

  // Mobile: stacked
  mobileList: {
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
  },

  fontList: {},
  fontRow: {
    marginBottom: space.sm,
  },
});
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add app/font-picker.tsx
git commit -m "feat: add font picker screen with live preview"
```

---

### Task 8: Add "Hanzi Font" Row to Settings

**Files:**
- Modify: `app/settings.tsx`

- [ ] **Step 1: Import useTheme font properties and Icon**

Add to imports:

```ts
import { Icon } from '@/theme/icons';
```

The existing `useTheme` import already provides `hanziFontId` since we extended the context.

- [ ] **Step 2: Read font label in the component body**

After `const { colors, mode, setMode } = useTheme();` change to:

```ts
const { colors, mode, setMode, hanziFontId } = useTheme();
```

Add after that line:

```ts
import { getHanziFont } from '@/theme/fonts';
```

(Move this to the top-level imports section.)

Inside the component, after the `s` memo:

```ts
const currentFontLabel = getHanziFont(hanziFontId).label;
```

- [ ] **Step 3: Add the font row in the APPEARANCE section**

After the `SegmentedControl` for theme (line 95), add:

```tsx
<TouchableOpacity
  style={s.fontRow}
  onPress={() => router.push('/font-picker')}
  activeOpacity={0.75}
>
  <Text style={s.fontRowLabel}>HANZI FONT</Text>
  <View style={s.fontRowRight}>
    <Text style={s.fontRowValue}>{currentFontLabel}</Text>
    <Text style={s.fontRowArrow}>{Icon.right}</Text>
  </View>
</TouchableOpacity>
```

- [ ] **Step 4: Add styles**

Add to `makeStyles`:

```ts
fontRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: space.lg,
  marginTop: space.lg,
  borderTopWidth: 1,
  borderTopColor: t.borderDim,
},
fontRowLabel: {
  fontFamily: MONO,
  fontSize: FS.label,
  letterSpacing: LS.widest * FS.label,
  color: t.textFaint,
  textTransform: 'uppercase',
},
fontRowRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: space.sm,
},
fontRowValue: {
  fontFamily: MONO,
  fontSize: FS.body,
  color: t.textSecondary,
},
fontRowArrow: {
  fontFamily: MONO,
  fontSize: FS.body,
  color: t.textSecondary,
},
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add app/settings.tsx
git commit -m "feat: add Hanzi Font row to settings appearance section"
```

---

### Task 9: Replace Static SERIF in Session, Card Detail, Search Results

**Files:**
- Modify: `app/session.tsx:776, 830`
- Modify: `app/card-detail.tsx:230, 273`
- Modify: `components/SearchResultRow.tsx:104`

- [ ] **Step 1: Update session.tsx**

In `app/session.tsx`, the `makeStyles` function uses `SERIF` in two places. Add `fonts` access at the component level:

```ts
const { colors, isDark, fonts } = useTheme();
```

Then in the styles where `fontFamily: SERIF` appears for the hero hanzi (line 776) and example hanzi (line 830), these need to use `fonts.hanzi`. Since `makeStyles` doesn't have access to the context, pass the font family as a parameter:

Change the `makeStyles` call to:

```ts
const s = useMemo(() => makeStyles(colors, isDark, fonts.hanzi, fonts.hanziWeight), [colors, isDark, fonts.hanzi, fonts.hanziWeight]);
```

Update `makeStyles` signature and replace the two `fontFamily: SERIF` lines:

```ts
// line 776 (hanziChar)
fontFamily: hanziFont,  // was: SERIF
fontWeight: hanziWeight as any,  // was: FW.light

// line 830 (exHanzi)
fontFamily: hanziFont,  // was: SERIF
```

- [ ] **Step 2: Update card-detail.tsx**

Same pattern. Add `fonts` to `useTheme()` destructuring:

```ts
const { colors, fonts } = useTheme();
```

Replace the two `fontFamily: SERIF` (lines 230, 273) with `fontFamily: fonts.hanzi`.

- [ ] **Step 3: Update SearchResultRow.tsx**

Add `fonts` to `useTheme()` destructuring:

```ts
const { colors, fonts } = useTheme();
```

Replace `fontFamily: SERIF` (line 104) with `fontFamily: fonts.hanzi`.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 5: Commit**

```bash
git add app/session.tsx app/card-detail.tsx components/SearchResultRow.tsx
git commit -m "feat: replace static SERIF with dynamic fonts.hanzi from ThemeContext"
```

---

### Task 10: Sync Preferences on Login

**Files:**
- Modify: `context/AuthContext.tsx`

- [ ] **Step 1: Add preference sync on sign-in**

Import the sync function:

```ts
import { syncPreferencesToLocal } from '@/lib/preferences';
```

In the auth state change listener (the `onAuthStateChange` callback), after a successful sign-in is detected and the session is set, add:

```ts
if (session?.user?.id) {
  syncPreferencesToLocal(session.user.id).catch(() => {});
}
```

This is fire-and-forget — if it fails, the local preference is already the fallback.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add context/AuthContext.tsx
git commit -m "feat: sync font preferences from Supabase on login"
```

---

### Task 11: Update DESIGN_SYSTEM.md

**Files:**
- Modify: `DESIGN_SYSTEM.md`

- [ ] **Step 1: Add FontOptionRow documentation**

Add to the Components section:

```markdown
### FontOptionRow

Selectable row with a visual preview character. Used in the font picker screen.

| Prop | Type | Default | Description |
|---|---|---|---|
| `character` | `string` | — | Preview character rendered in `fontFamily` |
| `fontFamily` | `string` | — | CSS/native font family for the character |
| `fontWeight` | `string` | `'400'` | Weight for the preview character |
| `label` | `string` | — | Option name |
| `description` | `string` | — | Short descriptors |
| `active` | `boolean` | — | Whether currently selected |
| `onPress` | `() => void` | — | Selection handler |

**States:** Default → bgCard bg, border. Hover (web) → inkRed border, inkRedGlow bg. Active → inkRedGlow bg, inkRedDim border, checkmark visible. Pressed → activeOpacity 0.75.
```

- [ ] **Step 2: Add FlashcardPreview documentation**

```markdown
### FlashcardPreview

Read-only flashcard preview — hero hanzi, pinyin, meaning, optional example. Pure display, no interactive states.

| Prop | Type | Default | Description |
|---|---|---|---|
| `hanzi` | `string` | — | Chinese character(s) |
| `pinyin` | `string` | — | Romanization |
| `meaning` | `string` | — | English translation |
| `exHanzi` | `string?` | — | Example sentence characters |
| `exPinyin` | `string?` | — | Example sentence pinyin |
| `exMeaning` | `string?` | — | Example sentence translation |
| `fontFamily` | `string?` | Theme's fonts.hanzi | Override hanzi font family |
| `fontWeight` | `string?` | Theme's fonts.hanziWeight | Override hanzi font weight |
| `size` | `'default' \| 'compact'` | `'default'` | default = 108px, compact = 72px |
| `showOrnaments` | `boolean` | `true` | Corner + ornaments |

**Sizes:** Default renders hanzi at 108px (flashcard session). Compact renders at 72px (font picker, card detail).
```

- [ ] **Step 3: Commit**

```bash
git add DESIGN_SYSTEM.md
git commit -m "docs: add FontOptionRow and FlashcardPreview to design system"
```

---

### Task 12: Add Showcase to design-system.tsx

**Files:**
- Modify: `app/design-system.tsx`

- [ ] **Step 1: Add FontOptionRow showcase section**

Add a new section showing:
- Default state row
- Active state row
- Both using different fonts from the registry

- [ ] **Step 2: Add FlashcardPreview showcase section**

Add a new section showing:
- Default size preview with example sentence
- Compact size preview without example sentence

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: No new errors

- [ ] **Step 4: Commit**

```bash
git add app/design-system.tsx
git commit -m "docs: add FontOptionRow and FlashcardPreview to design system showcase"
```

---

### Task 13: Supabase Migration

**Files:**
- DB: Supabase dashboard

- [ ] **Step 1: Run migration in Supabase SQL editor**

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';
```

- [ ] **Step 2: Verify RLS still works**

The existing RLS policy on `profiles` scopes to `auth.uid() = user_id`. The new `preferences` column inherits this — no new policy needed.

- [ ] **Step 3: Test by inserting a test preference**

```sql
UPDATE profiles SET preferences = '{"hanzi_font": "noto-sans"}' WHERE user_id = '<your-user-id>';
SELECT preferences FROM profiles WHERE user_id = '<your-user-id>';
```

Expected: Returns `{"hanzi_font": "noto-sans"}`

---

### Task 14: Final Type-Check and Verification

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: Only pre-existing `test.tsx` error

- [ ] **Step 2: Visual verification on web**

Run: `npx expo start --web`

1. Open Settings → verify "Hanzi Font" row shows, displays "LXGW WenKai"
2. Tap "Hanzi Font" → verify font picker screen opens
3. Select a different font → verify preview updates live
4. Go back → verify flashcard session shows the new font
5. Check search results → verify hanzi renders in new font
6. Check card detail → verify hanzi renders in new font
7. Check tab bar → verify 学/找/读 icons are still Noto Serif SC (unchanged)
8. Resize below 768px → verify mobile layout (preview on top, list below)
9. Test both light and dark themes
