# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose platform)
npx expo start
npx expo start --web

# Type-check (no emit)
npx tsc --noEmit

# Build for web (outputs to dist/)
npx expo export --platform web

# Run DB seeding scripts (requires SUPABASE_SERVICE_KEY in .env.local)
node scripts/seed-hsk-cards.js
node scripts/generate-examples.js
```

## Architecture

### Routing (Expo Router — file-based)

```
app/
  _layout.tsx          ← Root layout: wraps app in <AuthProvider>, runs RouteGuard
  index.tsx            ← Redirects to /auth
  auth.tsx             ← Login / signup / forgot / confirm (public)
  session-setup.tsx    ← Deck + count + difficulty config (protected)
  session.tsx          ← Flashcard session player (protected, ?resume=true)
  (tabs)/
    _layout.tsx        ← Tab group with hidden tab bar
    home.tsx           ← Start / resume session (protected)
```

The `RouteGuard` in `app/_layout.tsx` drives all auth-based redirects. There is no middleware — all guarding is done inside that single component.

### Data Layer

**`lib/supabase.ts`** — Supabase client (reads `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON`).

**`lib/progress.ts`** — All DB interaction for progress tracking. No React; pure async functions consumed by screens. Key functions:

| Function | Called from | Purpose |
|---|---|---|
| `fetchCardsForSession` | `session.tsx` load effect | Fetch + shuffle cards, apply difficulty filters |
| `loadResumeState` | `session.tsx` load effect | DB-first resume, AsyncStorage fallback |
| `upsertResumeSession` | `session.tsx` `rate()` | Fire-and-forget resume state sync to DB |
| `deleteResumeSession` | `session.tsx`, `session-setup.tsx` | Clear resume row from DB |
| `writeSessionResults` | `session.tsx` on last card | Insert session summary + per-card RPC upserts |
| `hasActiveResumeSession` | `home.tsx` | Controls whether Resume button is enabled |

### AsyncStorage Keys (all defined in `lib/progress.ts`)

| Key constant | Value | Stored data |
|---|---|---|
| `RESUME_SESSION_KEY` | `hanziflash_resume_session` | `ResumeState` (cards, idx, results, startedAt) |
| `SESSION_CONFIG_KEY` | `hanziflash_session_config` | `SessionConfig` (deck, cardCount, difficulties) |
| `SESSION_KEY` | `hanziflash_active_session` | Legacy; preserved for back-compat |

`hanziflash_last_deck` and `hanziflash_last_user_id` are stored directly (not exported as constants) in `session-setup.tsx` and `AuthContext.tsx`.

### Database Tables (Supabase)

All tables have RLS enabled. All policies scope to `auth.uid() = user_id`.

- **`decks`** — HSK decks (id, name, hsk_level)
- **`cards`** — Flashcards (id, deck_id, hanzi, pinyin, meaning, hsk_level, ex_hanzi, ex_pinyin, ex_meaning)
- **`sessions`** — Completed session summaries
- **`user_card_progress`** — Per-card mastery (times_seen, times_got, consecutive_correct, last_result)
- **`resume_sessions`** — One row per user; upserted on every card rating for cross-device resume

`upsert_card_progress(p_user_id, p_card_id, p_result)` — Postgres RPC (SECURITY DEFINER) for atomic increment upserts to `user_card_progress`.

### Difficulty Filter Logic (`fetchCardsForSession`)

- **new** → card has no row in `user_card_progress`
- **review** → `last_result = 'got'`
- **hard** → `last_result = 'forgot'` OR (`consecutive_correct = 0` AND `times_seen > 0`)
- No filters selected → fetch all cards at that HSK level

### Auth Context (`context/AuthContext.tsx`)

Provides `{ session, user, loading, signIn, signUp, signOut, resetPassword, signInWithGoogle }`. On sign-in of a different user, it clears all `hanziflash_*` AsyncStorage keys to prevent state leakage between accounts.

### Design System

All visual tokens live in `theme/tokens.ts` (exported as `T`) and `theme/spacing.ts`. No hardcoded colors anywhere in components or screens — always reference `T.*`. Components are in `components/`: `Button`, `Card`, `Chip`, `Field`, `ProgressBar`, `Section`, `SegmentedControl`, `TabSwitcher`, `BottomSheetModal`. Documentation is in `DESIGN_SYSTEM.md`.

### Responsive Layout

Two breakpoints: `mobile` (< 768px) and `desktop` (>= 768px). No CSS media queries — everything uses `useWindowDimensions()`.

**`hooks/useResponsive.ts`** — `useResponsive()` returns `{ bp, isMobile, isDesktop, width }`. Call directly from any screen or component — no context provider needed.

**`components/ResponsiveShell.tsx`** — Convenience wrapper that constrains content width on desktop and passes through unchanged on mobile. Props: `children`, `maxWidth?` (default 520), `fill?` (default true), `style?`.

Default `maxWidth` values:
- **Form screens** (auth, session-setup, home, profile): `520`
- **Flashcard session**: `640`
- **Reader/prose** (future): `720`

**When to use what:**
- Simple containment → wrap in `<ResponsiveShell>`
- Custom responsive layouts (e.g. side-by-side list+detail) → use `useResponsive()` directly, skip the shell
- `BottomSheetModal` already adapts internally (centered dialog on desktop)

### Path Alias

`@/*` maps to the project root. Use `@/lib/progress`, `@/components/Button`, `@/theme/tokens`, etc.

### Environment Variables

Copy `.env.example` → `.env.local`. `EXPO_PUBLIC_` prefix exposes vars to the client bundle. `SUPABASE_SERVICE_KEY` and `ANTHROPIC_KEY` are scripts-only (never bundled).

### Deployment

- **Web**: Vercel — auto-deploys from `main` via `npx expo export --platform web` → `dist/`. Live at `https://mandarine-gamma.vercel.app`.
- **Native**: EAS Build (manual trigger — not yet configured).
- Supabase project ID: `kgyzfywfyczowvqmtqzy`.
