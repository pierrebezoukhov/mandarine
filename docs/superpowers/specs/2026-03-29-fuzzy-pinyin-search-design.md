# Fuzzy Pinyin Search — Design Spec

**Date**: 2026-03-29
**Status**: Approved

## Overview

Search currently requires exact diacritic matching — typing "bai" won't find "bái" or "bǎi". Since users can't easily type tone marks, pinyin search is effectively broken. Fix by adding a tone-stripped `pinyin_normalized` column and searching against it.

This also enables predictive search — the existing 300ms debounced live results become useful once tone marks aren't blocking matches.

---

## 1. Tone Stripping Map

```
ā á ǎ à → a
ē é ě è → e
ī í ǐ ì → i
ō ó ǒ ò → o
ū ú ǔ ù → u
ǖ ǘ ǚ ǜ ü → u
```

Also lowercase the result. Spaces and other characters pass through unchanged.

---

## 2. Database Change

### New column

```sql
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pinyin_normalized TEXT;
```

### Populate from existing data

Using SQL `translate()` to map accented chars to plain ASCII:

```sql
UPDATE cards SET pinyin_normalized = LOWER(
  TRANSLATE(
    pinyin,
    'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü',
    'aaaaeeeeiiiioooouuuuuuuuu'
  )
);
```

### Index for fast `ilike` queries

```sql
CREATE INDEX idx_cards_pinyin_normalized ON cards USING gin (pinyin_normalized gin_trgm_ops);
```

If `pg_trgm` is not available, a simpler B-tree index still helps for prefix matching:

```sql
CREATE INDEX idx_cards_pinyin_normalized ON cards (pinyin_normalized);
```

---

## 3. Seed Script Update

**File**: `scripts/seed-hsk-cards.js`

Add a `normalizePinyin()` function that applies the same tone-stripping map. Include `pinyin_normalized` in the inserted rows:

```js
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

Each card row includes: `pinyin_normalized: normalizePinyin(pinyin)`.

---

## 4. Search Function Update

**File**: `lib/search.ts`

### Add `normalizePinyin()` helper

Same mapping as the seed script, implemented in TypeScript:

```ts
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

### Update search filter

Change the pinyin branch of the `.or()` filter from:

```ts
pinyin.ilike.%${safe}%
```

To:

```ts
pinyin_normalized.ilike.%${normalizedSafe}%
```

Where `normalizedSafe = escapeFilterValue(normalizePinyin(trimmed))`.

The CJK branch (hanzi search) is unchanged. The meaning branch is unchanged (English text has no diacritics).

---

## 5. What Changes for the User

- Typing "bai" now finds 白 (bái), 百 (bǎi), etc.
- Typing "ban" shows 帮助 (bāngzhù), 半 (bàn), 办法 (bànfǎ) as live suggestions
- Typing "bangzhu" finds 帮助 directly
- Pasting accented text (bāngzhù) still works — it gets normalized too
- No UI changes — same SearchField, same result rows, same debounce

---

## 6. Files to Modify

| File | Change |
|---|---|
| Supabase SQL editor | Add column + populate + index |
| `scripts/seed-hsk-cards.js` | Add `normalizePinyin()`, include `pinyin_normalized` in rows |
| `lib/search.ts` | Add `normalizePinyin()`, search against `pinyin_normalized` |

---

## 7. Out of Scope

- Typo tolerance (Levenshtein distance) — future
- "Did you mean?" suggestions — future
- Local/offline search — separate scaling decision
- Full-text search (Postgres `tsvector`) — overkill for current data size
