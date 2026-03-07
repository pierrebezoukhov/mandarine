-- ============================================================
-- hanziflash progress tables
-- Run once in: Supabase dashboard → SQL Editor
-- ============================================================

-- ── 1. sessions ──────────────────────────────────────────────────────────────
-- One row per completed session. Written once at session end.
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id      UUID REFERENCES decks(id) ON DELETE SET NULL,
  deck_name    TEXT,                  -- snapshot in case deck is later deleted
  card_count   INT  NOT NULL,         -- config.cardCount (original target)
  unique_cards INT  NOT NULL,         -- count of distinct card IDs actually rated
  got_count    INT  NOT NULL DEFAULT 0,
  forgot_count INT  NOT NULL DEFAULT 0,
  difficulties TEXT[],               -- e.g. {'new','hard'} or empty array
  started_at   TIMESTAMPTZ NOT NULL, -- set when session loads, not Postgres default
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── 2. user_card_progress ─────────────────────────────────────────────────────
-- One row per (user_id, card_id) pair. Upserted at session end via RPC below.
CREATE TABLE IF NOT EXISTS user_card_progress (
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id             UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  times_seen          INT  NOT NULL DEFAULT 0,
  times_got           INT  NOT NULL DEFAULT 0,
  times_forgot        INT  NOT NULL DEFAULT 0,
  consecutive_correct INT  NOT NULL DEFAULT 0,  -- resets to 0 on 'forgot'
  last_result         TEXT CHECK (last_result IN ('got', 'forgot')),
  last_seen_at        TIMESTAMPTZ,
  PRIMARY KEY (user_id, card_id)
);

ALTER TABLE user_card_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own progress"
  ON user_card_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own progress"
  ON user_card_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON user_card_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast difficulty-filter queries (new / review / hard)
CREATE INDEX IF NOT EXISTS idx_ucp_user_last_result
  ON user_card_progress (user_id, last_result);

-- ── 3. resume_sessions ────────────────────────────────────────────────────────
-- One row per user. Upserted on every card rating. Deleted at session end.
-- state JSONB shape: { cards, idx, results, startedAt }
CREATE TABLE IF NOT EXISTS resume_sessions (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resume_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own resume"
  ON resume_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users upsert own resume"
  ON resume_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own resume"
  ON resume_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own resume"
  ON resume_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ── 4. Stored procedure: atomic increment upsert for card progress ────────────
--
-- SECURITY DEFINER runs as the table owner, bypassing RLS safely.
-- This is acceptable because the function only ever writes rows where
-- user_id = p_user_id — the caller's own identity.
--
CREATE OR REPLACE FUNCTION upsert_card_progress(
  p_user_id UUID,
  p_card_id UUID,
  p_result  TEXT
) RETURNS VOID
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_card_progress
    (user_id, card_id, times_seen, times_got, times_forgot,
     consecutive_correct, last_result, last_seen_at)
  VALUES (
    p_user_id,
    p_card_id,
    1,
    CASE WHEN p_result = 'got'    THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'forgot' THEN 1 ELSE 0 END,
    CASE WHEN p_result = 'got'    THEN 1 ELSE 0 END,
    p_result,
    now()
  )
  ON CONFLICT (user_id, card_id) DO UPDATE SET
    times_seen          = user_card_progress.times_seen + 1,
    times_got           = user_card_progress.times_got
                          + CASE WHEN p_result = 'got' THEN 1 ELSE 0 END,
    times_forgot        = user_card_progress.times_forgot
                          + CASE WHEN p_result = 'forgot' THEN 1 ELSE 0 END,
    consecutive_correct = CASE WHEN p_result = 'got'
                            THEN user_card_progress.consecutive_correct + 1
                            ELSE 0 END,
    last_result  = p_result,
    last_seen_at = now();
END;
$$;

-- Allow signed-in users to call the function via the JS client
GRANT EXECUTE ON FUNCTION upsert_card_progress(UUID, UUID, TEXT) TO authenticated;
