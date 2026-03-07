-- Run this in Supabase dashboard → SQL Editor
-- Adds the ex_sentences column to store AI-generated example sentences per card
-- Each entry: [{"hanzi": "...", "pinyin": "...", "meaning": "..."}, ...]

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS ex_sentences jsonb;
