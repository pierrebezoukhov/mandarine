import { supabase } from '@/lib/supabase';
import type { Deck } from '@/lib/types';

/**
 * Fetches available decks — only those HSK levels that have cards.
 */
export async function fetchAvailableDecks(): Promise<Deck[]> {
  const [{ data: allDecks }, { data: cardLevels }] = await Promise.all([
    supabase.from('decks').select('*').order('hsk_level', { ascending: true }),
    supabase.from('cards').select('hsk_level'),
  ]);

  if (!allDecks || !cardLevels) return [];

  const levelsWithCards = new Set(cardLevels.map(c => c.hsk_level));
  return allDecks.filter(d => levelsWithCards.has(d.hsk_level)) as Deck[];
}
