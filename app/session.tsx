import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, ActivityIndicator, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { T, MONO, MONO_MEDIUM, SERIF, FS, FW, LH, LS } from '@/theme/tokens';
import { space, radius } from '@/theme/spacing';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import type { SessionConfig } from './session-setup';
import {
  fetchCardsForSession, loadResumeState,
  upsertResumeSession, deleteResumeSession, writeSessionResults,
  RESUME_SESSION_KEY, SESSION_CONFIG_KEY,
  type Card, type Results, type ResumeState,
} from '@/lib/progress';


// ── Session Complete ───────────────────────────────────────────────────────────
function SessionComplete({ got, forgot, total, onRestart }: {
  got: number; forgot: number; total: number; onRestart: () => void;
}) {
  const pct = total > 0 ? Math.round((got / total) * 100) : 0;
  return (
    <SafeAreaView style={sc.root}>
      <ResponsiveShell maxWidth={640} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={sc.seal}>印</Text>
      <Text style={sc.title}>Session complete</Text>
      <Text style={sc.sub}>{total} cards reviewed</Text>

      <View style={sc.stats}>
        <View style={sc.stat}>
          <Text style={[sc.statVal, { color: T.success }]}>{got}</Text>
          <Text style={sc.statLabel}>GOT IT</Text>
        </View>
        <Text style={sc.statSep}>·</Text>
        <View style={sc.stat}>
          <Text style={[sc.statVal, { color: T.error }]}>{forgot}</Text>
          <Text style={sc.statLabel}>FORGOT</Text>
        </View>
      </View>

      <View style={sc.pctBadge}>
        <Text style={sc.pctText}>{pct}% retention</Text>
      </View>

      <View style={sc.actions}>
        <Button label="Study again" onPress={onRestart} />
        <Button
          label="Back to home"
          variant="secondary"
          onPress={() => {
            AsyncStorage.removeItem(RESUME_SESSION_KEY);
            router.replace('/(tabs)/home');
          }}
        />
      </View>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

// ── Web-only scanline overlay ──────────────────────────────────────────────────
function Scanlines({ color = 'rgba(255,240,200,0.018)', gap = 3 }: { color?: string; gap?: number }) {
  if (Platform.OS !== 'web') return null;
  return (
    <View
      pointerEvents="none"
      style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        // @ts-expect-error — web-only CSS property
        backgroundImage: `repeating-linear-gradient(0deg, ${color} 0px, ${color} 1px, transparent 1px, transparent ${gap + 1}px)`,
      }}
    />
  );
}

// ── Corner ornament ────────────────────────────────────────────────────────────
function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posStyle = {
    tl: { top: 10, left: 14 },
    tr: { top: 10, right: 14 },
    bl: { bottom: 10, left: 14 },
    br: { bottom: 10, right: 14 },
  }[position];

  return (
    <Text style={[s.cornerOrnament, posStyle]}>+</Text>
  );
}

// ── Blur wrapper for translation text ──────────────────────────────────────────
function BlurredText({ text, revealed, onReveal }: {
  text: string; revealed: boolean; onReveal: () => void;
}) {
  return (
    <TouchableOpacity onPress={onReveal} activeOpacity={0.8}>
      <View style={s.blurWrapper}>
        <Text
          style={[
            s.hintTranslation,
            !revealed && Platform.OS === 'web' && ({
              filter: 'blur(5px)',
              userSelect: 'none',
            } as any),
            !revealed && Platform.OS !== 'web' && { opacity: 0.15 },
            revealed && { color: T.textPrimary },
          ]}
        >
          {text}
        </Text>
        {!revealed && (
          <View style={s.blurLabel}>
            <Text style={s.blurLabelText}>TAP TO REVEAL</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Main Session Screen ───────────────────────────────────────────────────────
export default function SessionScreen() {
  const { resume }            = useLocalSearchParams<{ resume?: string }>();
  const [cards, setCards]     = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [idx, setIdx]         = useState(0);
  const [reveal, setReveal]   = useState(0);
  const [results, setResults] = useState<Results>({});
  const [done, setDone]       = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [translationRevealed, setTranslationRevealed] = useState(false);

  const { user }        = useAuth();
  const startedAt       = useRef<string>(new Date().toISOString());
  const sessionConfig   = useRef<SessionConfig | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashColor = useRef<'got' | 'forgot' | null>(null);

  // Load session: resume from saved state (DB first, then AsyncStorage) OR fetch fresh
  useEffect(() => {
    async function load() {
      // ── Resume path ────────────────────────────────────────────────────────
      if (resume === 'true') {
        const resumeRaw = await AsyncStorage.getItem(RESUME_SESSION_KEY);
        const saved     = await loadResumeState(user?.id ?? null, resumeRaw);
        if (saved && saved.cards.length > 0) {
          startedAt.current = saved.startedAt;
          setCards(saved.cards);
          setIdx(saved.idx);
          setResults(saved.results);
          // Recover config so writeSessionResults works if the session finishes
          const cfgRaw = await AsyncStorage.getItem(SESSION_CONFIG_KEY);
          if (cfgRaw) { try { sessionConfig.current = JSON.parse(cfgRaw); } catch {} }
          setLoading(false);
          return;
        }
        // No resume data — fall through to fresh load
      }

      // ── Fresh load path ────────────────────────────────────────────────────
      const raw = await AsyncStorage.getItem(SESSION_CONFIG_KEY);
      if (!raw) { setError('No session config found.'); setLoading(false); return; }

      let config: SessionConfig;
      try { config = JSON.parse(raw); } catch { setError('Invalid session config.'); setLoading(false); return; }
      if (!config.deck) { setError('No deck selected.'); setLoading(false); return; }
      if (config.deck.hsk_level === null) { setError('Deck has no HSK level.'); setLoading(false); return; }
      if (!user?.id) { setError('Not signed in.'); setLoading(false); return; }

      sessionConfig.current = config;
      startedAt.current     = new Date().toISOString();

      const fetched = await fetchCardsForSession(
        user.id,
        config.deck.hsk_level,
        config.cardCount,
        config.difficulties,
      );

      if (fetched.length === 0) {
        setError(
          config.difficulties.length > 0
            ? 'No cards match the selected difficulty filters.'
            : 'No cards found for this deck.',
        );
        setLoading(false);
        return;
      }

      // Persist full session so it can be resumed if the user closes mid-way
      const initialResume: ResumeState = {
        cards: fetched, idx: 0, results: {}, startedAt: startedAt.current,
      };
      AsyncStorage.setItem(RESUME_SESSION_KEY, JSON.stringify(initialResume));
      upsertResumeSession(user.id, initialResume);  // fire-and-forget for cross-device

      setCards(fetched);
      setLoading(false);
    }
    load();
  }, [resume, user?.id]);

  // Card entrance animation
  useEffect(() => {
    if (cards.length === 0) return;
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
  }, [idx, cards.length]);

  const handleTap = useCallback(() => {
    setReveal(r => Math.min(r + 1, 2));
  }, []);

  const rate = useCallback((result: 'got' | 'forgot') => {
    const card       = cards[idx];
    const newResults = { ...results, [card.id]: result };
    const nextIdx    = idx + 1;
    const isLast     = nextIdx >= cards.length;

    setResults(newResults);

    // Feedback flash
    flashColor.current = result;
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0, duration: 500, useNativeDriver: true,
    }).start();

    if (!isLast) {
      // Keep resume state up-to-date in AsyncStorage and DB
      const resumeState: ResumeState = {
        cards, idx: nextIdx, results: newResults, startedAt: startedAt.current,
      };
      AsyncStorage.setItem(RESUME_SESSION_KEY, JSON.stringify(resumeState));
      if (user?.id) upsertResumeSession(user.id, resumeState);  // fire-and-forget
    } else {
      // Session complete: clear resume state, write results to DB
      AsyncStorage.removeItem(RESUME_SESSION_KEY);
      if (user?.id) {
        deleteResumeSession(user.id);   // fire-and-forget
        if (sessionConfig.current) {
          writeSessionResults({         // fire-and-forget
            userId:    user.id,
            config:    sessionConfig.current,
            results:   newResults,
            startedAt: startedAt.current,
          });
        }
      }
    }

    Animated.timing(cardAnim, {
      toValue: 0, duration: 180, useNativeDriver: true,
    }).start(() => {
      if (isLast) { setDone(true); }
      else {
        setIdx(nextIdx);
        setReveal(0);
        setHintOpen(false);
        setTranslationRevealed(false);
      }
    });
  }, [cards, idx, results, user?.id]);

  const goBack = useCallback(() => {
    if (idx === 0) return;
    setIdx(i => i - 1);
    setReveal(0);
    setHintOpen(false);
    setTranslationRevealed(false);
  }, [idx]);

  const restart = useCallback(() => {
    startedAt.current = new Date().toISOString();
    AsyncStorage.removeItem(RESUME_SESSION_KEY);
    if (user?.id) deleteResumeSession(user.id);  // fire-and-forget
    setCards(c => [...c].sort(() => Math.random() - 0.5));
    setIdx(0); setReveal(0); setResults({}); setDone(false);
    setHintOpen(false); setTranslationRevealed(false);
  }, [user?.id]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.root, s.centered]}>
        <ActivityIndicator color={T.accent} size="large" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[s.root, s.centered, { paddingHorizontal: 32 }]}>
        <Text style={{ color: T.error, fontSize: FS.ui, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: T.textMuted }}>← Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const gotCount    = Object.values(results).filter(v => v === 'got').length;
  const forgotCount = Object.values(results).filter(v => v === 'forgot').length;
  const remaining   = cards.length - gotCount - forgotCount;

  if (done) {
    return (
      <SessionComplete
        got={gotCount} forgot={forgotCount}
        total={cards.length} onRestart={restart}
      />
    );
  }

  const card      = cards[idx];
  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  return (
    <SafeAreaView style={s.root}>
      <Scanlines />
      <ResponsiveShell maxWidth={640}>

      {/* Top bar */}
      <View style={s.topbar}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={s.iconBtnText}>×</Text>
        </TouchableOpacity>

        <ProgressBar current={idx + 1} total={cards.length} style={{ flex: 1 }} />

        <TouchableOpacity
          style={[s.iconBtn, idx === 0 && s.iconBtnDisabled]}
          onPress={goBack} disabled={idx === 0}
        >
          <Text style={s.iconBtnText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Score strip: wrong · remaining · right */}
      <View style={s.scoreStrip}>
        <Text style={[s.scoreItem, s.scoreForgot]}>✕  {forgotCount}</Text>
        <Text style={s.scoreSep}>·</Text>
        <Text style={[s.scoreItem, s.scorePending]}>{remaining}</Text>
        <Text style={s.scoreSep}>·</Text>
        <Text style={[s.scoreItem, s.scoreGot]}>{gotCount}  ✓</Text>
      </View>

      {/* Card */}
      <Animated.View
        style={[s.cardStage, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}
      >
        <TouchableOpacity style={s.cardTouchable} onPress={handleTap} activeOpacity={1}>
          {/* Card container */}
          <View style={s.cardContainer}>
            <Scanlines color="rgba(255,240,200,0.012)" gap={4} />

            {/* Corner ornaments */}
            <CornerOrnament position="tl" />
            <CornerOrnament position="br" />

            {/* HSK badge */}
            <View style={s.hskBadge}>
              <Text style={s.hskBadgeText}>HSK {card.hsk_level}</Text>
            </View>

            {/* Hanzi — serif, light weight, ink bleed */}
            <Text style={s.hanziChar}>{card.hanzi}</Text>

            {/* Stage 1: Pinyin — always rendered, opacity-controlled */}
            <Text style={[s.pinyinText, reveal < 1 && { opacity: 0 }]}>
              {card.pinyin}
            </Text>

            {/* Stage 2: POS + definition */}
            <View style={[s.meaningBlock, reveal < 2 && { opacity: 0 }]}>
              <View style={s.divider} />
              {card.part_of_speech && <Text style={s.posTag}>{card.part_of_speech}</Text>}
              <Text style={s.meaningText}>{card.meaning}</Text>
            </View>

            {/* Stage 3: Example sentence (collapsible hint block) */}
            {card._example && (
              <View style={[s.hintBlock, reveal < 2 && { opacity: 0, pointerEvents: 'none' as const }]}>
                <TouchableOpacity
                  style={s.hintTrigger}
                  onPress={() => setHintOpen(o => !o)}
                  activeOpacity={0.7}
                >
                  <Text style={s.hintLabel}>EXAMPLE</Text>
                  <Text style={[s.hintIcon, hintOpen && s.hintIconOpen]}>▾</Text>
                </TouchableOpacity>

                <View style={[s.hintContent, !hintOpen && { opacity: 0 }]}>
                    <View style={s.hintDivider} />
                    {/* Example hanzi sentence */}
                    <Text style={s.hintHanzi}>{card._example.hanzi}</Text>
                    {/* Example pinyin */}
                    {card._example.pinyin && (
                      <Text style={s.hintPinyin}>{card._example.pinyin}</Text>
                    )}
                    {/* Translation — blurred until tapped */}
                    {card._example.meaning && (
                      <BlurredText
                        text={card._example.meaning}
                        revealed={translationRevealed}
                        onReveal={() => setTranslationRevealed(true)}
                      />
                    )}
                  </View>
              </View>
            )}

            {/* Feedback flash overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: flashColor.current === 'got'
                    ? 'rgba(58,122,68,0.25)'
                    : 'rgba(200,56,42,0.25)',
                  opacity: flashAnim,
                  borderRadius: 0,
                },
              ]}
            />
          </View>

          {/* Tap hint */}
          {reveal < 2 && (
            <Text style={s.tapHint}>
              {reveal === 0 && 'tap · pinyin'}
              {reveal === 1 && 'tap · meaning'}
            </Text>
          )}

        </TouchableOpacity>
      </Animated.View>

      {/* Rating buttons */}
      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[s.rateBtn, s.rateBtnForgot]}
          onPress={() => rate('forgot')}
          activeOpacity={0.8}
        >
          <Scanlines color="rgba(255,255,255,0.04)" gap={4} />
          <Text style={[s.rateBtnIcon, { color: T.error }]}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.rateBtn, s.rateBtnGot]}
          onPress={() => rate('got')}
          activeOpacity={0.8}
        >
          <Scanlines color="rgba(255,255,255,0.04)" gap={4} />
          <Text style={[s.rateBtnIcon, { color: T.success }]}>✓</Text>
        </TouchableOpacity>
      </View>

      </ResponsiveShell>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bgDeep },
  centered:{ alignItems: 'center', justifyContent: 'center' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm,
  },
  iconBtn:         { padding: space.sm, borderRadius: 8 },
  iconBtnDisabled: { opacity: 0.2 },
  iconBtnText:     { fontSize: 18, fontFamily: MONO, letterSpacing: LS.tighter * 18, color: T.textMuted },

  scoreStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: space.lg, paddingBottom: 10,
  },
  scoreItem:   { fontFamily: MONO, fontSize: FS.label, fontWeight: FW.medium },
  scoreForgot: { color: T.error },
  scoreGot:    { color: T.success },
  scorePending:{ color: T.textFaint },
  scoreSep:    { color: T.textFaint, fontSize: 10 },

  cardStage: { flex: 1, position: 'relative' },
  cardTouchable: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingBottom: 24,
  },

  // Card container — explicit bordered box
  cardContainer: {
    width: '100%', maxWidth: 340,
    backgroundColor: T.surfaceCard,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: space.xxl,
    paddingTop: 40,
    paddingBottom: space.xxl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Outer shadow (cross-platform)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },

  // Corner ornaments
  cornerOrnament: {
    position: 'absolute',
    fontFamily: MONO,
    fontSize: 10,
    color: T.textFaint,
    opacity: 0.5,
  },

  hskBadge: {
    position: 'absolute', top: 10, right: 14,
  },
  hskBadgeText: {
    fontFamily: MONO, fontSize: 9, color: T.textFaint,
    letterSpacing: 1.5, opacity: 0.6,
  },

  // Hanzi — serif font, light weight, ink-bleed shadow
  hanziChar: {
    fontFamily: SERIF,
    fontSize: FS.hanzi,
    fontWeight: FW.light,
    color: T.textHanzi,
    lineHeight: LH.hanzi,
    letterSpacing: LS.tighter * FS.hanzi,
    textAlign: 'center',
    textShadowColor: 'rgba(232,224,208,0.12)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
    marginBottom: space.xl,
  },

  // Pinyin — italic, red glow
  pinyinText: {
    fontFamily: MONO, fontSize: 18, letterSpacing: 3,
    color: '#e04030', fontStyle: 'italic', opacity: 0.9,
    marginBottom: space.lg,
    textShadowColor: 'rgba(200,56,42,0.18)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Divider
  divider: {
    width: '100%', height: 1,
    backgroundColor: T.border, marginBottom: space.lg,
  },

  // Meaning block (POS + definition)
  meaningBlock: { width: '100%', alignItems: 'flex-start', marginBottom: space.lg },
  posTag: {
    fontFamily: MONO, fontSize: 10,
    color: T.textFaint, letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: space.xs,
  },
  meaningText: {
    fontFamily: MONO, fontSize: 15, fontWeight: FW.light, color: T.textPrimary,
    lineHeight: 22, letterSpacing: 0.5,
  },

  // Hint block (collapsible example)
  hintBlock: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(30,28,24,1)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  hintTrigger: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.md, paddingVertical: space.sm,
  },
  hintLabel: {
    flex: 1, fontFamily: MONO, fontSize: 10,
    letterSpacing: 2, color: T.textFaint, textTransform: 'uppercase',
  },
  hintIcon: {
    fontFamily: MONO, fontSize: 10, color: T.textFaint,
  },
  hintIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  hintContent: {
    paddingHorizontal: space.md, paddingBottom: space.md,
  },
  hintDivider: {
    height: 1, backgroundColor: 'rgba(30,28,24,1)', marginBottom: space.sm,
  },
  hintHanzi: {
    fontFamily: SERIF, fontSize: 15, color: T.textPrimary,
    lineHeight: 22, letterSpacing: 1, marginBottom: space.sm,
  },
  hintPinyin: {
    fontFamily: MONO, fontSize: 11, color: T.textSecondary,
    fontStyle: 'italic', letterSpacing: 1, lineHeight: 17,
    marginBottom: space.sm,
  },
  hintTranslation: {
    fontFamily: MONO, fontSize: 12, color: T.textSecondary,
    letterSpacing: 0.5, lineHeight: 18,
  },

  // Blur wrapper for translation
  blurWrapper: { position: 'relative' },
  blurLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  blurLabelText: {
    fontFamily: MONO, fontSize: 9, letterSpacing: 3,
    color: T.textFaint, textTransform: 'uppercase',
  },

  // Tap hint
  tapHint: {
    marginTop: space.lg,
    fontFamily: MONO, fontSize: 9, color: T.textFaint,
    letterSpacing: 2, textTransform: 'uppercase',
  },

  // Rating buttons — square-ish with text labels
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 40, paddingBottom: 36,
    gap: space.lg,
  },
  rateBtn: {
    width: 64, height: 64, borderRadius: radius.square,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  rateBtnForgot: {
    backgroundColor: 'rgba(122,30,20,0.12)',
    borderColor: 'rgba(122,30,20,0.6)',
  },
  rateBtnGot: {
    backgroundColor: 'rgba(58,122,68,0.12)',
    borderColor: 'rgba(58,122,68,0.6)',
  },
  rateBtnIcon: { fontSize: 20 },
});

// ── Session Complete Styles ────────────────────────────────────────────────────
const sc = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: T.bgDeep,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36,
  },
  seal:      { fontSize: FS.seal, color: T.accent, opacity: 0.3, marginBottom: space.xxxl },
  title:     { fontSize: FS.title, color: T.textPrimary, fontWeight: FW.semibold, marginBottom: space.sm, textAlign: 'center', letterSpacing: LS.tight * FS.title },
  sub:       { fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1, marginBottom: 40 },

  stats:     { flexDirection: 'row', alignItems: 'center', gap: space.xxl, marginBottom: 32 },
  stat:      { alignItems: 'center' },
  statVal:   { fontSize: FS.score, lineHeight: LH.score, marginBottom: 6, letterSpacing: LS.tighter * FS.score },
  statLabel: { fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 },
  statSep:   { color: T.textMuted, fontSize: FS.subheading },

  pctBadge: {
    borderWidth: 1, borderColor: T.border, borderRadius: 100,
    paddingHorizontal: space.xl, paddingVertical: space.sm, marginBottom: space.giant,
  },
  pctText: { fontFamily: MONO, fontSize: FS.body, color: T.textMuted, letterSpacing: 1 },

  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
