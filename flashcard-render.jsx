import { useState, useEffect, useRef } from "react";

const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
  :root {
    --bg: #131109; --bg-warm: #1a1710; --surface: #201d14; --surface-2: #272318;
    --border: rgba(255,248,220,0.07); --border-soft: rgba(255,248,220,0.04);
    --text-primary: #F0EBE0; --text-secondary: #A09880; --text-muted: #5C5646; --text-hanzi: #F5F0E8;
    --accent: #C0392B; --accent-soft: rgba(192,57,43,0.12);
    --again: #E05252; --hard: #C07A30; --good: #4A9E6B; --easy: #4A7EBD;
    --font-hanzi: 'Noto Sans SC', sans-serif; --font-serif: 'Lora', serif;
    --font-ui: 'DM Sans', sans-serif; --font-mono: 'DM Mono', monospace;
    --r-sm: 8px; --r-md: 14px; --r-lg: 24px; --r-pill: 100px;
  }
`;

const GLOBAL = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: var(--bg); }
  body { font-family: var(--font-ui); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

const CARDS = [
  { id:1, hanzi:"安静", pinyin:"ān jìng", meaning:"Quiet · peaceful · calm", part_of_speech:"adj.", hsk:3,
    ex_hanzi:"请保持安静，孩子们在睡觉。", ex_pinyin:"Qǐng bǎochí ānjìng, háizimen zài shuìjiào.", ex_meaning:"Please keep quiet — the children are sleeping." },
  { id:2, hanzi:"明白", pinyin:"míng bai", meaning:"To understand · to be clear", part_of_speech:"v.", hsk:3,
    ex_hanzi:"你明白我的意思吗？", ex_pinyin:"Nǐ míngbai wǒ de yìsi ma?", ex_meaning:"Do you understand what I mean?" },
  { id:3, hanzi:"突然", pinyin:"tū rán", meaning:"Suddenly · all at once", part_of_speech:"adv.", hsk:3,
    ex_hanzi:"他突然停下来，看着窗外。", ex_pinyin:"Tā tūrán tíng xiàlái, kànzhe chuāng wài.", ex_meaning:"He suddenly stopped and looked out the window." },
  { id:4, hanzi:"温柔", pinyin:"wēn róu", meaning:"Gentle · tender · soft", part_of_speech:"adj.", hsk:4,
    ex_hanzi:"她的声音很温柔。", ex_pinyin:"Tā de shēngyīn hěn wēnróu.", ex_meaning:"Her voice is very gentle." },
  { id:5, hanzi:"回忆", pinyin:"huí yì", meaning:"Memory · recollection · to recall", part_of_speech:"n. / v.", hsk:4,
    ex_hanzi:"那是一段美好的回忆。", ex_pinyin:"Nà shì yī duàn měihǎo de huíyì.", ex_meaning:"That is a beautiful memory." },
];

const RATINGS = [
  { key:"again", label:"Again", color:"var(--again)", interval:"< 1 min" },
  { key:"hard",  label:"Hard",  color:"var(--hard)",  interval:"< 6 min" },
  { key:"good",  label:"Good",  color:"var(--good)",  interval:"1 day"   },
  { key:"easy",  label:"Easy",  color:"var(--easy)",  interval:"4 days"  },
];

const CSS = `
.session-root {
  display: flex; flex-direction: column; height: 100dvh;
  max-width: 430px; margin: 0 auto; background: var(--bg);
  background-image: radial-gradient(ellipse 80% 60% at 50% 0%, #1f1b10 0%, var(--bg) 70%);
  position: relative;
}
.session-topbar {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px 12px; flex-shrink: 0;
}
.icon-btn {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 6px; border-radius: var(--r-sm); display: flex; transition: color 0.15s; flex-shrink: 0;
}
.icon-btn:hover { color: var(--text-secondary); }
.back-btn-disabled { opacity: 0.2; pointer-events: none; }
.progress-track { flex: 1; height: 2px; background: var(--surface-2); border-radius: 1px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 1px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); opacity: 0.7; }
.card-counter { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
.card-counter-total { opacity: 0.5; }

.score-strip {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 0 20px 14px; flex-shrink: 0;
}
.score-item {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 500;
}
.score-forgot { color: #E05252; }
.score-got    { color: #4A9E6B; }
.score-sep    { color: var(--text-muted); font-size: 16px; line-height: 1; }


  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 24px 36px 16px; cursor: pointer;
  position: relative; animation: scaleIn 0.28s cubic-bezier(0.34,1.3,0.64,1) both;
  transition: opacity 0.18s ease, transform 0.18s ease;
  -webkit-tap-highlight-color: transparent;
}
.card-stage.leaving { opacity: 0; transform: translateY(-8px) scale(0.98); }

.hsk-badge {
  position: absolute; top: 20px; right: 28px;
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  letter-spacing: 0.1em; border: 1px solid var(--border);
  padding: 3px 8px; border-radius: var(--r-pill);
}

.hanzi-block { display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.hanzi-char {
  font-family: var(--font-hanzi); font-size: clamp(72px, 22vw, 104px); font-weight: 400;
  color: var(--text-hanzi); line-height: 1; letter-spacing: -0.01em;
  text-shadow: 0 2px 40px rgba(240,235,224,0.06); user-select: none;
}

.reveal-row {
  width: 100%; display: flex; flex-direction: column; align-items: center; overflow: hidden;
  transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1);
}
.reveal-row.hidden { max-height: 0; opacity: 0; transform: translateY(-6px); pointer-events: none; }
.reveal-row.shown  { max-height: 200px; opacity: 1; transform: translateY(0); }

.pinyin-row { margin-top: 16px; }
.pinyin-text { font-family: var(--font-mono); font-size: 18px; letter-spacing: 0.12em; color: var(--accent); opacity: 0.85; }

.example-row { margin-top: 20px; width: 100%; }
.example-block { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.example-divider { width: 24px; height: 1px; background: var(--border); margin: 0 auto 14px; }
.ex-hanzi { font-family: var(--font-hanzi); font-size: 24px; color: #C8BFA8; text-align: center; line-height: 1.8; font-weight: 400; }
.ex-pinyin { font-family: var(--font-mono); font-size: 12px; color: #7A7060; text-align: center; letter-spacing: 0.06em; }

.ex-english-row { margin-top: 8px; }
.ex-meaning { font-family: var(--font-ui); font-size: 14px; color: #8C8070; text-align: center; line-height: 1.6; font-style: italic; }

.meaning-row { margin-top: 20px; gap: 6px; }
.pos-tag { font-family: var(--font-ui); font-size: 10px; font-weight: 500; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.meaning-text { font-family: var(--font-serif); font-size: 22px; font-weight: 400; color: var(--text-primary); text-align: center; line-height: 1.4; font-style: italic; }

.tap-hint {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  letter-spacing: 0.1em; white-space: nowrap; animation: fadeIn 0.6s 0.4s both; opacity: 0.6;
}

.fab-row {
  position: absolute; bottom: 32px; left: 0; right: 0;
  display: flex; justify-content: space-between;
  padding: 0 32px; pointer-events: none;
}
.fab {
  width: 60px; height: 60px; border-radius: 50%;
  border: none; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  pointer-events: all;
  transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.fab:active { transform: scale(0.92); }
.fab-forgot {
  background: rgba(224, 82, 82, 0.12);
  border: 1px solid rgba(224, 82, 82, 0.25);
  color: #E05252;
}
.fab-forgot:hover {
  background: rgba(224, 82, 82, 0.2);
  border-color: rgba(224, 82, 82, 0.4);
}
.fab-got {
  background: rgba(74, 158, 107, 0.12);
  border: 1px solid rgba(74, 158, 107, 0.25);
  color: #4A9E6B;
}
.fab-got:hover {
  background: rgba(74, 158, 107, 0.2);
  border-color: rgba(74, 158, 107, 0.4);
}

.complete-root {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100dvh; padding: 48px 36px; max-width: 430px; margin: 0 auto;
  background: var(--bg);
  background-image: radial-gradient(ellipse 80% 60% at 50% 0%, #1f1b10 0%, var(--bg) 70%);
  animation: fadeIn 0.4s ease both;
}
.complete-seal { font-family: var(--font-hanzi); font-size: 48px; color: var(--accent); opacity: 0.3; margin-bottom: 28px; }
.complete-title { font-family: var(--font-serif); font-size: 28px; font-weight: 400; color: var(--text-primary); font-style: italic; margin-bottom: 8px; text-align: center; }
.complete-sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.08em; margin-bottom: 40px; }
.complete-stats { display: flex; gap: 24px; margin-bottom: 32px; }
.cstat { text-align: center; }
.cstat-val { font-family: var(--font-serif); font-size: 40px; font-weight: 400; line-height: 1; margin-bottom: 6px; }
.cstat-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.complete-pct { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); letter-spacing: 0.1em; margin-bottom: 48px; padding: 8px 20px; border: 1px solid var(--border); border-radius: var(--r-pill); }
.complete-actions { display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 280px; }
.action-primary { padding: 15px 24px; background: var(--accent); border: none; border-radius: var(--r-pill); color: #fff; font-family: var(--font-ui); font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity 0.15s; }
.action-primary:hover { opacity: 0.88; }
.action-secondary { padding: 15px 24px; background: transparent; border: 1px solid var(--border); border-radius: var(--r-pill); color: var(--text-secondary); font-family: var(--font-ui); font-size: 14px; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
.action-secondary:hover { border-color: rgba(255,248,220,0.14); color: var(--text-primary); }
`;

function SessionComplete({ got, forgot, total, onRestart }) {
  const pct = Math.round((got / total) * 100);
  return (
    <div className="complete-root">
      <div className="complete-seal">印</div>
      <h1 className="complete-title">Session complete</h1>
      <p className="complete-sub">{total} cards reviewed</p>
      <div className="complete-stats">
        {[
          { label:"Got it",  val: got,    color:"var(--good)" },
          { label:"Forgot",  val: forgot, color:"var(--again)" },
        ].map(s => (
          <div key={s.label} className="cstat">
            <div className="cstat-val" style={{color:s.color}}>{s.val}</div>
            <div className="cstat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="complete-pct">{pct}% retention</div>
      <div className="complete-actions">
        <button className="action-primary" onClick={onRestart}>Study again</button>
        <button className="action-secondary">Back to decks</button>
      </div>
    </div>
  );
}

export default function FlashcardSession() {
  const [idx, setIdx]         = useState(0);
  const [reveal, setReveal]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [done, setDone]       = useState(false);
  const [results, setResults] = useState({}); // { cardId: 'got' | 'forgot' }
  const [leaving, setLeaving] = useState(false);
  const cssRef = useRef(false);

  useEffect(() => {
    if (cssRef.current) return;
    cssRef.current = true;
    const el = document.createElement("style");
    el.textContent = TOKENS + GLOBAL + CSS;
    document.head.appendChild(el);
  }, []);

  const card = CARDS[idx];
  const progress = (idx / CARDS.length) * 100;

  const lastTap = useRef(0);
  const tapTimer = useRef(null);

  const handleTap = () => {
    const now = Date.now();
    const delta = now - lastTap.current;
    lastTap.current = now;

    if (delta < 300) {
      // double tap — cancel pending single tap, reveal all
      clearTimeout(tapTimer.current);
      setReveal(4);
    } else {
      // wait briefly to confirm it's not a double tap
      tapTimer.current = setTimeout(() => {
        setReveal(r => r < 4 ? r + 1 : r);
      }, 220);
    }
  };

  const rate = (key) => {
    const result = key === "good" ? "got" : "forgot";
    setResults(r => ({ ...r, [CARDS[idx].id]: result }));
    setLeaving(true);
    setTimeout(() => {
      const next = idx + 1;
      if (next >= CARDS.length) { setDone(true); }
      else { setIdx(next); setReveal(0); setAnimKey(k => k + 1); }
      setLeaving(false);
    }, 220);
  };

  const goBack = () => {
    if (idx === 0) return;
    setIdx(i => i - 1);
    setReveal(0);
    setAnimKey(k => k + 1);
  };

  const gotCount = Object.values(results).filter(v => v === "got").length;
  const forgotCount = Object.values(results).filter(v => v === "forgot").length;

  const restart = () => { setIdx(0); setReveal(0); setAnimKey(k=>k+1); setDone(false); setResults({}); };

  if (done) return <SessionComplete got={gotCount} forgot={forgotCount} total={CARDS.length} onRestart={restart} />;

  return (
    <div className="session-root">
      <div className="session-topbar">
        <button className="icon-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{width:`${progress}%`}} />
        </div>
        <button
          className={`icon-btn back-btn ${idx === 0 ? "back-btn-disabled" : ""}`}
          onClick={goBack}
          aria-label="Previous card"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="card-counter">{idx+1}<span className="card-counter-total">/{CARDS.length}</span></span>
      </div>

      {/* Score strip */}
      <div className="score-strip">
        <span className="score-item score-forgot">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {forgotCount}
        </span>
        <span className="score-sep">·</span>
        <span className="score-item score-got">
          {gotCount}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 5.5l3 3L9 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      <div className={`card-stage ${leaving?"leaving":""}`} key={animKey} onClick={handleTap}>
        <div className="hsk-badge">HSK {card.hsk}</div>

        <div className="hanzi-block">
          <div className="hanzi-char">{card.hanzi}</div>
        </div>

        <div className={`reveal-row pinyin-row ${reveal>=1?"shown":"hidden"}`}>
          <span className="pinyin-text">{card.pinyin}</span>
        </div>

        <div className={`reveal-row example-row ${reveal>=2?"shown":"hidden"}`}>
          <div className="example-block">
            <div className="example-divider" />
            <p className="ex-hanzi">{card.ex_hanzi}</p>
            <p className="ex-pinyin">{card.ex_pinyin}</p>
          </div>
        </div>

        <div className={`reveal-row ex-english-row ${reveal>=3?"shown":"hidden"}`}>
          <p className="ex-meaning">{card.ex_meaning}</p>
        </div>

        <div className={`reveal-row meaning-row ${reveal>=4?"shown":"hidden"}`}>
          <span className="pos-tag">{card.part_of_speech}</span>
          <span className="meaning-text">{card.meaning}</span>
        </div>

        {reveal < 4 && (
          <div className="tap-hint">
            {reveal===0 && "tap · pinyin  ··  double tap · reveal all"}
            {reveal===1 && "tap · example  ··  double tap · reveal all"}
            {reveal===2 && "tap · translation  ··  double tap · reveal all"}
            {reveal===3 && "tap · meaning"}
          </div>
        )}
      </div>

      {/* Always-visible floating action buttons */}
      <div className="fab-row">
        <button
          className="fab fab-forgot"
          onClick={(e) => { e.stopPropagation(); rate("again"); }}
          aria-label="Forgot"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          className="fab fab-got"
          onClick={(e) => { e.stopPropagation(); rate("good"); }}
          aria-label="Got it"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 12l6 6L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
