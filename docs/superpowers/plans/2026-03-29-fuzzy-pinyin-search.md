# Fuzzy Pinyin Search — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable diacritic-insensitive pinyin search so users can type plain ASCII ("bai") and find accented entries ("bái", "bǎi").

**Architecture:** Add a `pinyin_normalized` column to the `cards` table containing tone-stripped ASCII pinyin. Search queries against this column instead of `pinyin`. A `normalizePinyin()` helper strips diacritics in both the seed script (JS) and the search function (TS).

**Tech Stack:** Supabase (Postgres), Node.js seed script, TypeScript search lib

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| DB | Supabase SQL editor | Add column + populate + index |
| Modify | `scripts/seed-hsk-cards.js` | Add normalizePinyin(), include pinyin_normalized in rows |
| Modify | `lib/search.ts` | Add normalizePinyin(), search against pinyin_normalized |

---

### Task 1: Database Migration

**Files:**
- DB: Supabase SQL editor

- [ ] **Step 1: Run migration in Supabase SQL editor**

```sql
-- Add the normalized pinyin column
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pinyin_normalized TEXT;

-- Populate from existing data (strip tone diacritics)
UPDATE cards SET pinyin_normalized = LOWER(
  TRANSLATE(
    pinyin,
    'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü',
    'aaaaeeeeiiiioooouuuuuuuuu'
  )
);

-- Index for faster ilike queries
CREATE INDEX IF NOT EXISTS idx_cards_pinyin_normalized ON cards (pinyin_normalized);
```

- [ ] **Step 2: Verify**

```sql
SELECT hanzi, pinyin, pinyin_normalized FROM cards WHERE pinyin_normalized LIKE '%bangzhu%';
```

Expected: Returns 帮助 with `pinyin = 'bāngzhù'`, `pinyin_normalized = 'bāngzhù'` → wait, should be `'bangzhu'`. Verify the TRANSLATE worked.

```sql
SELECT hanzi, pinyin, pinyin_normalized FROM cards LIMIT 10;
```

Verify `pinyin_normalized` contains no diacritics.

---

### Task 2: Update Seed Script

**Files:**
- Modify: `scripts/seed-hsk-cards.js`

- [ ] **Step 1: Add normalizePinyin function**

Add after the `parseEnv` function (around line 24), before the Supabase helpers:

```js
// ── Pinyin normalization ─────────────────────────────────────────────────────
function normalizePinyin(pinyin) {
  const map = {
    'ā':'a','á':'a','ǎ':'a','à':'a',
    'ē':'e','é':'e','ě':'e','è':'e',
    'ī':'i','í':'i','ǐ':'i','ì':'i',
    'ō':'o','ó':'o','ǒ':'o','ò':'o',
    'ū':'u','ú':'u','ǔ':'u','ù':'u',
    'ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u','ü':'u',
  };
  return pinyin.split('').map(c => map[c] || c).join('').toLowerCase();
}
```

- [ ] **Step 2: Add pinyin_normalized to card rows**

Find the row mapping at line 974:

```js
const rows = newWords.map(([hanzi, pinyin, meaning, part_of_speech], i) => ({
  hanzi,
  pinyin,
  meaning,
  part_of_speech,
  hsk_level: level,
  frequency_rank: (level - 1) * 10000 + (i + 1),
```

Add `pinyin_normalized` to the object:

```js
const rows = newWords.map(([hanzi, pinyin, meaning, part_of_speech], i) => ({
  hanzi,
  pinyin,
  pinyin_normalized: normalizePinyin(pinyin),
  meaning,
  part_of_speech,
  hsk_level: level,
  frequency_rank: (level - 1) * 10000 + (i + 1),
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-hsk-cards.js
git commit -m "feat: add pinyin_normalized to seed script for tone-stripped search"
```

---

### Task 3: Update Search Function

**Files:**
- Modify: `lib/search.ts`

- [ ] **Step 1: Add TONE_MAP and normalizePinyin helper**

Add after the existing `escapeFilterValue` function:

```ts
/** Strip pinyin tone diacritics to plain ASCII for fuzzy matching */
const TONE_MAP: Record<string, string> = {
  'ā':'a','á':'a','ǎ':'a','à':'a',
  'ē':'e','é':'e','ě':'e','è':'e',
  'ī':'i','í':'i','ǐ':'i','ì':'i',
  'ō':'o','ó':'o','ǒ':'o','ò':'o',
  'ū':'u','ú':'u','ǔ':'u','ù':'u',
  'ǖ':'u','ǘ':'u','ǚ':'u','ǜ':'u','ü':'u',
};

function normalizePinyin(s: string): string {
  return s.split('').map(c => TONE_MAP[c] || c).join('').toLowerCase();
}
```

- [ ] **Step 2: Update the search filter**

In `searchCards()`, find the filter construction:

```ts
const safe = escapeFilterValue(trimmed);
if (!safe) return [];

const isCJK = hasCJK(safe);

let q = supabase
  .from('cards')
  .select('id, hanzi, pinyin, meaning, hsk_level, part_of_speech, ex_hanzi, ex_pinyin, ex_meaning')
  .or(
    isCJK
      ? `hanzi.ilike.%${safe}%`
      : `pinyin.ilike.%${safe}%,meaning.ilike.%${safe}%`
  )
  .limit(limit);
```

Replace with:

```ts
const safe = escapeFilterValue(trimmed);
if (!safe) return [];

const isCJK = hasCJK(safe);
const normalizedSafe = normalizePinyin(safe);

let q = supabase
  .from('cards')
  .select('id, hanzi, pinyin, meaning, hsk_level, part_of_speech, ex_hanzi, ex_pinyin, ex_meaning')
  .or(
    isCJK
      ? `hanzi.ilike.%${safe}%`
      : `pinyin_normalized.ilike.%${normalizedSafe}%,meaning.ilike.%${safe}%`
  )
  .limit(limit);
```

The only change: `pinyin.ilike` → `pinyin_normalized.ilike` and the value is normalized.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: Only pre-existing `test.tsx` error

- [ ] **Step 4: Commit**

```bash
git add lib/search.ts
git commit -m "feat: fuzzy pinyin search — strip tone diacritics for matching"
```

---

### Task 4: Verification

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit 2>&1 | grep -v "^skills/"`
Expected: Only pre-existing `test.tsx` error

- [ ] **Step 2: Manual test**

Run `npx expo start --web`, navigate to Search tab:

1. Type "bai" → should show 白 (bái), 百 (bǎi), and any other bai* words
2. Type "bangzhu" → should show 帮助 (bāngzhù)
3. Type "ni hao" → should show 你好 (nǐ hǎo)
4. Type "bāngzhù" (with accents) → should still work (normalized before matching)
5. Type "hello" → should match via meaning column (unchanged)
6. Type "你" → should match via hanzi column (unchanged)
