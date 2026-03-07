// scripts/generate-examples.js
// Run with: node scripts/generate-examples.js
// Requires Node 18+ (uses built-in fetch)
// Reads credentials from .env.local — never commit that file.

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Parse .env.local ─────────────────────────────────────────────────────────
function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found — copy .env.example and fill in values');
  process.exit(1);
}
const env = parseEnv(envPath);

const ANTHROPIC_KEY = env.ANTHROPIC_KEY;
const SUPABASE_URL  = env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY  = env.SUPABASE_SERVICE_KEY;

if (!ANTHROPIC_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing ANTHROPIC_KEY, EXPO_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

// ── Supabase helpers ──────────────────────────────────────────────────────────
async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Claude API call ───────────────────────────────────────────────────────────
async function generateSentences(cards) {
  const wordList = cards
    .map(c => `${c.hanzi} (${c.pinyin}) — ${c.meaning}`)
    .join('\n');

  const prompt =
    `You are generating example sentences for a Mandarin Chinese flashcard app.\n` +
    `For each word below, write 3 short, natural example sentences (5–12 Chinese characters).\n` +
    `Return ONLY valid JSON — a single object mapping each hanzi to an array of 3 sentence objects.\n` +
    `Each sentence object must have exactly: "hanzi", "pinyin", "meaning" (English).\n` +
    `Use accurate tone marks in pinyin. Keep English concise.\n\n` +
    `Words:\n${wordList}\n\n` +
    `Format example:\n` +
    `{"好": [{"hanzi":"你好吗？","pinyin":"Nǐ hǎo ma?","meaning":"How are you?"}, ...],...}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw  = data.content[0].text.trim();
  // Strip optional markdown code fences
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

// ── Main ──────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 8;

async function main() {
  console.log('Fetching cards without ex_sentences...');

  // Fetch cards where ex_sentences is null (not yet generated)
  const cards = await sbFetch(
    '/cards?select=id,hanzi,pinyin,meaning&ex_sentences=is.null&order=hsk_level.asc,id.asc',
    { headers: { Prefer: 'return=representation' } },
  );

  if (!cards || cards.length === 0) {
    console.log('All cards already have example sentences.');
    return;
  }

  console.log(`Processing ${cards.length} cards in batches of ${BATCH_SIZE}...\n`);

  let successCount = 0;
  let failCount    = 0;

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch     = cards.slice(i, i + BATCH_SIZE);
    const batchNum  = Math.floor(i / BATCH_SIZE) + 1;
    const total     = Math.ceil(cards.length / BATCH_SIZE);
    const hanziList = batch.map(c => c.hanzi).join(' ');

    process.stdout.write(`[${batchNum}/${total}] ${hanziList} ... `);

    try {
      const sentences = await generateSentences(batch);

      // Update each card
      for (const card of batch) {
        const cardSentences = sentences[card.hanzi];
        if (!Array.isArray(cardSentences) || cardSentences.length === 0) {
          console.warn(`\n  ⚠ No sentences returned for ${card.hanzi}`);
          failCount++;
          continue;
        }

        await sbFetch(
          `/cards?id=eq.${card.id}`,
          { method: 'PATCH', body: JSON.stringify({ ex_sentences: cardSentences }) },
        );
        successCount++;
      }

      console.log('✓');
    } catch (err) {
      console.error(`✗\n  Error: ${err.message}`);
      failCount += batch.length;
    }

    // Brief pause between batches to respect rate limits
    if (i + BATCH_SIZE < cards.length) {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log(`\nDone. ${successCount} cards updated, ${failCount} failed.`);
  if (failCount > 0) {
    console.log('Re-run the script to retry failed cards (they still have ex_sentences = null).');
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
