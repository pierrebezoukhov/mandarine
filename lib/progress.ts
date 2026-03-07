/**
 * lib/progress.ts
 *
 * All Supabase interactions for progress tracking.
 * No React dependency — pure async functions consumed by screens.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { SessionConfig, DifficultyFilter } from '@/app/session-setup';

// ── Types ─────────────────────────────────────────────────────────────────────

type ExSentence = { hanzi: string; pinyin: string; meaning: string };

export type Card = {
  id:             string;
  hanzi:          string;
  pinyin:         string;
  meaning:        string;
  part_of_speech: string | null;
  hsk_level:      number;
  ex_sentences:   ExSentence[] | null;
  ex_hanzi:       string | null;
  ex_pinyin:      string | null;
  ex_meaning:     string | null;
  _example:       ExSentence | null;
};

export type Results = Record<string, 'got' | 'forgot'>;

/** Stored in both AsyncStorage and resume_sessions.state JSONB */
export type ResumeState = {
  cards:     Card[];
  idx:       number;
  results:   Results;
  startedAt: string;   // ISO timestamp — when the session originally loaded cards
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function pickExample(c: Omit<Card, '_example'>): ExSentence | null {
  if (c.ex_sentences && c.ex_sentences.length > 0) {
    return c.ex_sentences[Math.floor(Math.random() * c.ex_sentences.length)];
  }
  if (c.ex_hanzi) {
    return { hanzi: c.ex_hanzi, pinyin: c.ex_pinyin ?? '', meaning: c.ex_meaning ?? '' };
  }
  return null;
}

// ── 1. fetchCardsForSession ───────────────────────────────────────────────────
/**
 * Fetches and returns a shuffled deck of `count` cards for a session.
 *
 * When `difficulties` is non-empty, filters cards by category (OR semantics):
 *   'new'    → card has no row in user_card_progress for this user
 *   'review' → last_result = 'got'
 *   'hard'   → last_result = 'forgot'
 *              OR (consecutive_correct = 0 AND times_seen > 0)
 *
 * When `difficulties` is empty, fetches all cards at the given HSK level
 * (preserving the original behaviour).
 *
 * Returns an empty array if the difficulty filters match no cards.
 */
export async function fetchCardsForSession(
  userId:      string,
  hskLevel:    number,
  count:       number,
  difficulties: DifficultyFilter[],
): Promise<Card[]> {

  let matchedIds: string[] | null = null;  // null = no filter

  if (difficulties.length > 0) {
    // Step 1: Get all card IDs at this HSK level
    const { data: levelCards, error: levelErr } = await supabase
      .from('cards')
      .select('id')
      .eq('hsk_level', hskLevel);

    if (levelErr || !levelCards) return [];

    const allLevelIds = levelCards.map(c => c.id as string);
    if (allLevelIds.length === 0) return [];

    // Step 2: Fetch this user's progress for those cards
    const { data: progressRows } = await supabase
      .from('user_card_progress')
      .select('card_id, last_result, consecutive_correct, times_seen')
      .eq('user_id', userId)
      .in('card_id', allLevelIds);

    const progressMap = new Map(
      (progressRows ?? []).map(r => [
        r.card_id as string,
        r as { card_id: string; last_result: string; consecutive_correct: number; times_seen: number },
      ])
    );

    // Step 3: Classify each card
    matchedIds = [];
    for (const id of allLevelIds) {
      const row = progressMap.get(id);
      for (const filter of difficulties) {
        if (filter === 'new' && !row) {
          matchedIds.push(id); break;
        }
        if (filter === 'review' && row?.last_result === 'got') {
          matchedIds.push(id); break;
        }
        if (
          filter === 'hard' && row &&
          (row.last_result === 'forgot' ||
           (row.consecutive_correct === 0 && row.times_seen > 0))
        ) {
          matchedIds.push(id); break;
        }
      }
    }

    if (matchedIds.length === 0) return [];
  }

  // Step 4: Fetch card rows
  let query = supabase
    .from('cards')
    .select('id, hanzi, pinyin, meaning, part_of_speech, hsk_level, ex_sentences, ex_hanzi, ex_pinyin, ex_meaning')
    .eq('hsk_level', hskLevel)
    .limit(count * 3);  // over-fetch for shuffle

  if (matchedIds !== null) {
    query = query.in('id', matchedIds);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  // Step 5: Shuffle, slice, resolve _example
  return (data as Omit<Card, '_example'>[])
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(c => ({ ...c, _example: pickExample(c) }));
}

// ── 2. upsertResumeSession ────────────────────────────────────────────────────
/**
 * Fire-and-forget upsert of the current session state to resume_sessions.
 * Called on every card rating so any signed-in device can resume.
 * Errors are swallowed — a failed upsert only affects cross-device resume.
 */
export function upsertResumeSession(userId: string, state: ResumeState): void {
  supabase
    .from('resume_sessions')
    .upsert(
      { user_id: userId, state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    .then(({ error }) => {
      if (error) console.warn('[progress] upsertResumeSession:', error.message);
    });
}

// ── 3. deleteResumeSession ────────────────────────────────────────────────────
/**
 * Deletes the resume_sessions row for the user.
 * Called at session end and when a new session is explicitly started.
 */
export async function deleteResumeSession(userId: string): Promise<void> {
  const { error } = await supabase
    .from('resume_sessions')
    .delete()
    .eq('user_id', userId);
  if (error) console.warn('[progress] deleteResumeSession:', error.message);
}

// ── 4. loadResumeState ────────────────────────────────────────────────────────
/**
 * Loads resume state. Tries Supabase first (cross-device), then falls back
 * to the AsyncStorage raw string the caller already has (avoids a second read).
 *
 * Back-compat: fills in missing `startedAt` if loading an old AsyncStorage
 * entry that pre-dates this schema.
 */
export async function loadResumeState(
  userId:          string | null,
  asyncStorageRaw: string | null,
): Promise<ResumeState | null> {
  // 1. Try DB (authoritative, cross-device)
  if (userId) {
    const { data } = await supabase
      .from('resume_sessions')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle();

    if (data?.state) {
      const s = data.state as Partial<ResumeState>;
      return {
        cards:     s.cards     ?? [],
        idx:       s.idx       ?? 0,
        results:   s.results   ?? {},
        startedAt: s.startedAt ?? new Date().toISOString(),
      };
    }
  }

  // 2. Fall back to AsyncStorage (same-device, offline)
  if (asyncStorageRaw) {
    try {
      const parsed = JSON.parse(asyncStorageRaw) as Partial<ResumeState>;
      return {
        cards:     parsed.cards     ?? [],
        idx:       parsed.idx       ?? 0,
        results:   parsed.results   ?? {},
        startedAt: parsed.startedAt ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  return null;
}

// ── 5. hasActiveResumeSession ─────────────────────────────────────────────────
/**
 * Returns true if there is a resumable session in the DB or AsyncStorage.
 * Used by home.tsx to enable/disable the Resume button.
 */
export async function hasActiveResumeSession(
  userId:          string | null,
  asyncStorageRaw: string | null,
): Promise<boolean> {
  if (userId) {
    const { data } = await supabase
      .from('resume_sessions')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) return true;
  }
  return asyncStorageRaw !== null;
}

// ── 6. writeSessionResults ────────────────────────────────────────────────────
/**
 * Called once at session end. Runs in parallel:
 *   a) INSERT into sessions (summary row)
 *   b) upsert_card_progress RPC for each unique card rated
 *
 * Errors are logged but not re-thrown — the session is already complete
 * from the user's perspective.
 */
export async function writeSessionResults(params: {
  userId:    string;
  config:    SessionConfig;
  results:   Results;
  startedAt: string;
}): Promise<void> {
  const { userId, config, results, startedAt } = params;

  const uniqueCardIds = Object.keys(results);
  const gotCount      = uniqueCardIds.filter(id => results[id] === 'got').length;
  const forgotCount   = uniqueCardIds.filter(id => results[id] === 'forgot').length;

  // a. Session summary row
  const sessionInsert = supabase.from('sessions').insert({
    user_id:      userId,
    deck_id:      config.deck?.id    ?? null,
    deck_name:    config.deck?.name  ?? null,
    card_count:   config.cardCount,
    unique_cards: uniqueCardIds.length,
    got_count:    gotCount,
    forgot_count: forgotCount,
    difficulties: config.difficulties,
    started_at:   startedAt,
    completed_at: new Date().toISOString(),
  });

  // b. Per-card progress upserts via atomic RPC
  const progressUpserts = uniqueCardIds.map(cardId =>
    supabase.rpc('upsert_card_progress', {
      p_user_id: userId,
      p_card_id: cardId,
      p_result:  results[cardId],
    })
  );

  const [sessionResult, ...progressResults] = await Promise.all([
    sessionInsert,
    ...progressUpserts,
  ]);

  if (sessionResult.error) {
    console.warn('[progress] sessions insert failed:', sessionResult.error.message);
  }
  progressResults.forEach((r, i) => {
    if (r.error) {
      console.warn(`[progress] upsert_card_progress failed for ${uniqueCardIds[i]}:`, r.error.message);
    }
  });
}

// ── AsyncStorage key constants (re-exported for screens to use) ────────────────
export const RESUME_SESSION_KEY  = 'hanziflash_resume_session';
export const SESSION_KEY         = 'hanziflash_active_session';
export const SESSION_CONFIG_KEY  = 'hanziflash_session_config';
