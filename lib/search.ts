/**
 * lib/search.ts
 *
 * Search data layer — pure async functions, no React.
 * Follows the same pattern as lib/progress.ts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SearchResult = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk_level: number;
  part_of_speech: string | null;
  ex_hanzi: string | null;
  ex_pinyin: string | null;
  ex_meaning: string | null;
  mastery?: 'new' | 'review' | 'hard';
};

// ── Constants ────────────────────────────────────────────────────────────────

export const RECENT_SEARCHES_KEY = 'hanziflash_recent_searches';
const MAX_RECENT = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the string contains any CJK Unified Ideograph */
function hasCJK(s: string): boolean {
  return /[\u4e00-\u9fff]/.test(s);
}

/** Escape PostgREST filter meta-characters to prevent filter injection */
function escapeFilterValue(s: string): string {
  return s.replace(/[.,()\\]/g, '');
}

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

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchCards(
  query: string,
  hskLevels: number[],
  userId?: string,
  limit: number = 50,
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const safe = escapeFilterValue(trimmed);
  if (!safe) return [];

  // Build query with sanitized input
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

  // HSK level filter
  if (hskLevels.length > 0) {
    q = q.in('hsk_level', hskLevels);
  }

  // Order by HSK level, then hanzi for consistent results
  q = q.order('hsk_level').order('hanzi');

  const { data, error } = await q;
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // If userId is provided, join mastery data
  let masteryMap: Record<string, 'new' | 'review' | 'hard'> = {};

  if (userId && data.length > 0) {
    const cardIds = data.map(c => c.id);
    const { data: progress } = await supabase
      .from('user_card_progress')
      .select('card_id, last_result, consecutive_correct, times_seen')
      .eq('user_id', userId)
      .in('card_id', cardIds);

    if (progress) {
      for (const p of progress) {
        if (p.last_result === 'got') {
          masteryMap[p.card_id] = 'review';
        } else if (
          p.last_result === 'forgot' ||
          (p.consecutive_correct === 0 && p.times_seen > 0)
        ) {
          masteryMap[p.card_id] = 'hard';
        }
      }
    }
  }

  return data.map(c => ({
    ...c,
    mastery: userId
      ? (masteryMap[c.id] ?? 'new')
      : undefined,
  }));
}

// ── Card detail ───────────────────────────────────────────────────────────────

export type CardDetail = {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk_level: number;
  part_of_speech: string | null;
  ex_hanzi: string | null;
  ex_pinyin: string | null;
  ex_meaning: string | null;
  times_seen?: number;
  times_got?: number;
  last_result?: string;
  last_reviewed?: string;
};

export async function fetchCardDetail(
  cardId: string,
  userId?: string,
): Promise<CardDetail | null> {
  const { data: card, error } = await supabase
    .from('cards')
    .select('id, hanzi, pinyin, meaning, hsk_level, part_of_speech, ex_hanzi, ex_pinyin, ex_meaning')
    .eq('id', cardId)
    .single();

  if (error || !card) return null;

  if (!userId) return card;

  const { data: progress } = await supabase
    .from('user_card_progress')
    .select('times_seen, times_got, last_result, updated_at')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .maybeSingle();

  return {
    ...card,
    times_seen: progress?.times_seen ?? 0,
    times_got: progress?.times_got ?? 0,
    last_result: progress?.last_result ?? undefined,
    last_reviewed: progress?.updated_at ?? undefined,
  };
}

// ── Recent searches ───────────────────────────────────────────────────────────

export async function getRecentSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addRecentSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const existing = await getRecentSearches();
  // Remove duplicates, prepend new, cap at MAX_RECENT
  const updated = [trimmed, ...existing.filter(q => q !== trimmed)].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

export async function clearRecentSearches(): Promise<void> {
  await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ── Card progress ────────────────────────────────────────────────────────────

export async function markCardForReview(userId: string, cardId: string): Promise<void> {
  const { error } = await supabase.rpc('upsert_card_progress', {
    p_user_id: userId,
    p_card_id: cardId,
    p_result: 'forgot',
  });
  if (error) console.warn('[search] markCardForReview:', error.message);
}
