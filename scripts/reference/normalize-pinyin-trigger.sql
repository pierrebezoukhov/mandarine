-- Postgres trigger: auto-populate pinyin_normalized on insert/update
-- Use this when import features are built so any card source gets normalization for free.
-- Run once in Supabase SQL editor to install.

CREATE OR REPLACE FUNCTION normalize_pinyin_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pinyin_normalized := LOWER(TRANSLATE(
    NEW.pinyin,
    'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü',
    'aaaaeeeeiiiioooouuuuuuuuu'
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalize_pinyin
BEFORE INSERT OR UPDATE OF pinyin ON cards
FOR EACH ROW EXECUTE FUNCTION normalize_pinyin_trigger();
