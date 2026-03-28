/**
 * lib/types.ts
 *
 * Domain types shared across the data layer and UI screens.
 */

export type Deck = {
  id: string;
  name: string;
  description: string;
  type: string;
  hsk_level: number | null;
  is_public: boolean;
};

export type DifficultyFilter = 'new' | 'review' | 'hard';

export type SessionConfig = {
  deck: Deck | null;
  cardCount: number;
  isCustomCount: boolean;
  difficulties: DifficultyFilter[];
};
