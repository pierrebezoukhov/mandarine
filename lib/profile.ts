/**
 * lib/profile.ts
 *
 * All Supabase interactions for user profiles and progress stats.
 * No React dependency — pure async functions consumed by screens.
 */

import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Profile = {
  user_id:      string;
  display_name: string | null;
  native_lang:  string;
  target_hsk:   number;
  avatar_url:   string | null;
};

export type ProgressStats = {
  totalSessions:         number;
  totalCards:            number;  // SUM(unique_cards)
  totalGot:              number;
  totalForgot:           number;
  avgSessionSuccessRate: number;  // AVG(got/unique_cards) — unweighted per session
  globalSuccessRate:     number;  // SUM(got) / SUM(unique_cards) — weighted by volume
  uniqueCardsMastered:   number;  // consecutive_correct >= 3
  byHskLevel:            Record<number, { seen: number; got: number }>;
};

export type SessionSummary = {
  id:           string;
  deck_name:    string | null;
  card_count:   number;
  unique_cards: number | null;
  got_count:    number;
  forgot_count: number;
  completed_at: string;
};

// ── fetchProfile ──────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.warn('[profile] fetchProfile:', error.message);
  return (data as Profile) ?? null;
}

// ── updateProfile ─────────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  data: Partial<Omit<Profile, 'user_id'>>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { user_id: userId, ...data, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );
  if (error) console.warn('[profile] updateProfile:', error.message);
}

// ── uploadAvatar ──────────────────────────────────────────────────────────────
/**
 * Uploads a local image URI to Supabase Storage bucket "avatars".
 * Returns the public URL with a cache-buster, or null on failure.
 *
 * Requires: expo install expo-image-picker expo-image-manipulator
 */
export async function uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `${userId}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

  if (error) {
    console.warn('[profile] uploadAvatar:', error.message);
    return null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── fetchProgressStats ────────────────────────────────────────────────────────

export async function fetchProgressStats(userId: string): Promise<ProgressStats> {
  const [sessionsRes, masteredRes, progressRes] = await Promise.all([
    supabase
      .from('sessions')
      .select('unique_cards, got_count, forgot_count')
      .eq('user_id', userId),
    supabase
      .from('user_card_progress')
      .select('card_id')
      .eq('user_id', userId)
      .gte('consecutive_correct', 3),
    supabase
      .from('user_card_progress')
      .select('card_id, last_result')
      .eq('user_id', userId),
  ]);

  // Sessions aggregation
  const rows = (sessionsRes.data ?? []) as {
    unique_cards: number;
    got_count: number;
    forgot_count: number;
  }[];
  const totalSessions = rows.length;
  const totalCards    = rows.reduce((s, r) => s + (r.unique_cards ?? 0), 0);
  const totalGot      = rows.reduce((s, r) => s + (r.got_count    ?? 0), 0);
  const totalForgot   = rows.reduce((s, r) => s + (r.forgot_count ?? 0), 0);

  const rates = rows
    .filter(r => r.unique_cards > 0)
    .map(r => r.got_count / r.unique_cards);
  const avgSessionSuccessRate =
    rates.length > 0 ? rates.reduce((s, r) => s + r, 0) / rates.length : 0;
  const globalSuccessRate = totalCards > 0 ? totalGot / totalCards : 0;

  const uniqueCardsMastered = masteredRes.data?.length ?? 0;

  // byHskLevel: fetch hsk_level for each card seen
  const progressRows = (progressRes.data ?? []) as { card_id: string; last_result: string }[];
  const byHskLevel: Record<number, { seen: number; got: number }> = {};

  if (progressRows.length > 0) {
    const cardIds = progressRows.map(r => r.card_id);
    const { data: cardRows } = await supabase
      .from('cards')
      .select('id, hsk_level')
      .in('id', cardIds);

    const hskMap = new Map(
      (cardRows ?? []).map(c => [c.id as string, c.hsk_level as number]),
    );

    for (const row of progressRows) {
      const level = hskMap.get(row.card_id);
      if (!level) continue;
      if (!byHskLevel[level]) byHskLevel[level] = { seen: 0, got: 0 };
      byHskLevel[level].seen += 1;
      if (row.last_result === 'got') byHskLevel[level].got += 1;
    }
  }

  return {
    totalSessions,
    totalCards,
    totalGot,
    totalForgot,
    avgSessionSuccessRate,
    globalSuccessRate,
    uniqueCardsMastered,
    byHskLevel,
  };
}

// ── fetchRecentSessions ───────────────────────────────────────────────────────

export async function fetchRecentSessions(
  userId: string,
  limit = 5,
): Promise<SessionSummary[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, deck_name, card_count, unique_cards, got_count, forgot_count, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) console.warn('[profile] fetchRecentSessions:', error.message);
  return (data ?? []) as SessionSummary[];
}
