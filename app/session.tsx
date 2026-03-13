import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { T, MONO, FS, FW, LH, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
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
    </SafeAreaView>
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

  const { user }        = useAuth();
  const startedAt       = useRef<string>(new Date().toISOString());
  const sessionConfig   = useRef<SessionConfig | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const lastTap  = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const now = Date.now();
    if (now - lastTap.current < 300) {
      clearTimeout(tapTimer.current!);
      setReveal(5);
    } else {
      tapTimer.current = setTimeout(() => {
        setReveal(r => Math.min(r + 1, 5));
      }, 200);
    }
    lastTap.current = now;
  }, []);

  const rate = useCallback((result: 'got' | 'forgot') => {
    const card       = cards[idx];
    const newResults = { ...results, [card.id]: result };
    const nextIdx    = idx + 1;
    const isLast     = nextIdx >= cards.length;

    setResults(newResults);

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
      else { setIdx(nextIdx); setReveal(0); }
    });
  }, [cards, idx, results, user?.id]);

  const goBack = useCallback(() => {
    if (idx === 0) return;
    setIdx(i => i - 1);
    setReveal(0);
  }, [idx]);

  const restart = useCallback(() => {
    startedAt.current = new Date().toISOString();
    AsyncStorage.removeItem(RESUME_SESSION_KEY);
    if (user?.id) deleteResumeSession(user.id);  // fire-and-forget
    setCards(c => [...c].sort(() => Math.random() - 0.5));
    setIdx(0); setReveal(0); setResults({}); setDone(false);
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

      {/* Top bar */}
      <View style={s.topbar}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={s.iconBtnText}>✕</Text>
        </TouchableOpacity>

        <ProgressBar current={idx + 1} total={cards.length} style={{ flex: 1 }} />

        <TouchableOpacity
          style={[s.iconBtn, idx === 0 && s.iconBtnDisabled]}
          onPress={goBack} disabled={idx === 0}
        >
          <Text style={s.iconBtnText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Score strip */}
      <View style={s.scoreStrip}>
        <Text style={[s.scoreItem, s.scoreForgot]}>✕  {forgotCount}</Text>
        <Text style={s.scoreSep}>·</Text>
        <Text style={[s.scoreItem, s.scoreGot]}>{gotCount}  ✓</Text>
      </View>

      {/* Card */}
      <Animated.View
        style={[s.cardStage, { opacity: cardAnim, transform: [{ scale: cardScale }] }]}
      >
        <TouchableOpacity style={s.cardTouchable} onPress={handleTap} activeOpacity={1}>

          <View style={s.hskBadge}>
            <Text style={s.hskBadgeText}>HSK {card.hsk_level}</Text>
          </View>

          <Text style={s.hanziChar}>{card.hanzi}</Text>

          {reveal >= 1 && (
            <Text style={s.pinyinText}>{card.pinyin}</Text>
          )}

          {reveal >= 2 && card._example && (
            <View style={s.exampleBlock}>
              <View style={s.exDivider} />
              <Text style={s.exHanzi}>{card._example.hanzi}</Text>
              {reveal >= 3 && card._example.pinyin ? (
                <Text style={s.exPinyin}>{card._example.pinyin}</Text>
              ) : null}
            </View>
          )}

          {reveal >= 4 && card._example?.meaning && (
            <Text style={s.exMeaning}>{card._example.meaning}</Text>
          )}

          {reveal >= 5 && (
            <View style={s.meaningBlock}>
              {card.part_of_speech && <Text style={s.posTag}>{card.part_of_speech}</Text>}
              <Text style={s.meaningText}>{card.meaning}</Text>
            </View>
          )}

          {reveal < 5 && (
            <Text style={s.tapHint}>
              {reveal === 0 && 'tap · pinyin  ··  double tap · reveal all'}
              {reveal === 1 && 'tap · example  ··  double tap · reveal all'}
              {reveal === 2 && 'tap · example pinyin  ··  double tap · reveal all'}
              {reveal === 3 && 'tap · translation  ··  double tap · reveal all'}
              {reveal === 4 && 'tap · meaning'}
            </Text>
          )}

        </TouchableOpacity>
      </Animated.View>

      {/* FABs */}
      <View style={s.fabRow}>
        <TouchableOpacity style={[s.fab, s.fabForgot]} onPress={() => rate('forgot')} activeOpacity={0.8}>
          <Text style={[s.fabIcon, { color: T.error }]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.fab, s.fabGot]} onPress={() => rate('got')} activeOpacity={0.8}>
          <Text style={[s.fabIcon, { color: T.success }]}>✓</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  centered:{ alignItems: 'center', justifyContent: 'center' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm,
  },
  iconBtn:         { padding: space.sm, borderRadius: 8 },
  iconBtnDisabled: { opacity: 0.2 },
  iconBtnText:     { fontSize: FS.subheading, color: T.textMuted },

  scoreStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: space.md, paddingBottom: 10,
  },
  scoreItem:   { fontFamily: MONO, fontSize: FS.body, fontWeight: FW.medium },
  scoreForgot: { color: T.error },
  scoreGot:    { color: T.success },
  scoreSep:    { color: T.textMuted, fontSize: FS.ui },

  cardStage: { flex: 1, position: 'relative' },
  cardTouchable: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 36, paddingBottom: 110,
  },

  hskBadge: {
    position: 'absolute', top: 20, right: 28,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100,
  },
  hskBadgeText: { fontFamily: MONO, fontSize: FS.label, color: T.textMuted, letterSpacing: 1.5 },

  hanziChar: {
    fontSize: FS.hanzi, color: T.textHanzi, lineHeight: LH.hanzi,
    letterSpacing: LS.tighter * FS.hanzi,
    textShadowColor: 'rgba(240,235,224,0.06)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 40,
  },

  pinyinText: {
    fontFamily: MONO, fontSize: FS.pinyin, letterSpacing: 3,
    color: T.accent, opacity: 0.85, marginTop: 18,
  },

  exampleBlock: { marginTop: 22, width: '100%', alignItems: 'center' },
  exDivider:    { width: 24, height: 1, backgroundColor: T.border, marginBottom: 14 },
  exHanzi:      { fontSize: FS.subheading, color: '#C8BFA8', textAlign: 'center', lineHeight: LH.subheading },
  exPinyin:     { fontFamily: MONO, fontSize: FS.label, color: '#7A7060', textAlign: 'center', letterSpacing: 1 },

  exMeaning: {
    fontSize: FS.body, color: '#8C8070', textAlign: 'center',
    lineHeight: LH.body, marginTop: 10,
  },

  meaningBlock: { marginTop: 22, alignItems: 'center', gap: 6 },
  posTag:       { fontFamily: MONO, fontSize: FS.label, fontWeight: FW.medium, color: T.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  meaningText:  { fontSize: FS.subheading, color: T.textPrimary, textAlign: 'center', lineHeight: LH.subheading, letterSpacing: LS.tight * FS.subheading },

  tapHint: {
    position: 'absolute', bottom: 72,
    fontFamily: MONO, fontSize: FS.label, color: T.textMuted,
    letterSpacing: 1.5, opacity: 0.6,
  },

  fabRow: {
    position: 'absolute', bottom: 36, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  fab: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  fabForgot: {
    backgroundColor: 'rgba(224,82,82,0.12)',
    borderWidth: 1, borderColor: 'rgba(224,82,82,0.25)',
  },
  fabGot: {
    backgroundColor: 'rgba(74,158,107,0.12)',
    borderWidth: 1, borderColor: 'rgba(74,158,107,0.25)',
  },
  fabIcon: { fontSize: FS.subheading },
});

// ── Session Complete Styles ────────────────────────────────────────────────────
const sc = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: T.bg,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36,
  },
  seal:      { fontSize: FS.seal, color: T.accent, opacity: 0.3, marginBottom: space.xxxl },
  title:     { fontSize: FS.title, color: T.textPrimary, marginBottom: space.sm, textAlign: 'center', letterSpacing: LS.tight * FS.title },
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
