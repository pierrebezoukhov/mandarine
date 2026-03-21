import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, ActivityIndicator, Platform, ScrollView, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { MONO, MONO_MEDIUM, SERIF, FS, FW, LH, LS } from '@/theme/tokens';
import { space, radius } from '@/theme/spacing';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { Scanlines } from '@/components/Scanlines';
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
  const { colors } = useTheme();
  const sc = useMemo(() => makeCompleteStyles(colors), [colors]);
  const pct = total > 0 ? Math.round((got / total) * 100) : 0;
  return (
    <SafeAreaView style={sc.root}>
      <ResponsiveShell maxWidth={640} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={sc.seal}>印</Text>
      <Text style={sc.title}>Session complete</Text>
      <Text style={sc.sub}>{total} cards reviewed</Text>

      <View style={sc.stats}>
        <View style={sc.stat}>
          <Text style={[sc.statVal, { color: colors.green }]}>{got}</Text>
          <Text style={sc.statLabel}>GOT IT</Text>
        </View>
        <Text style={sc.statSep}>·</Text>
        <View style={sc.stat}>
          <Text style={[sc.statVal, { color: colors.redBtn }]}>{forgot}</Text>
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

// ── Corner ornament ────────────────────────────────────────────────────────────
function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const { colors } = useTheme();
  const posStyle = {
    tl: { top: 10, left: 14 },
    tr: { top: 10, right: 14 },
    bl: { bottom: 10, left: 14 },
    br: { bottom: 10, right: 14 },
  }[position];

  return (
    <Text style={[{
      position: 'absolute',
      fontFamily: MONO,
      fontSize: 10,
      color: colors.inkRedDim,
      opacity: 0.5,
    }, posStyle]}>+</Text>
  );
}

// ── Blur wrapper for example pinyin + translation ────────────────────────────
function BlurredExample({ pinyin, meaning, revealed, onReveal }: {
  pinyin?: string; meaning?: string; revealed: boolean; onReveal: () => void;
}) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity onPress={onReveal} activeOpacity={0.8}>
      <View style={s.blurWrapper}>
        <View
          style={[
            !revealed && Platform.OS === 'web' && ({
              filter: 'blur(5px)',
              userSelect: 'none',
            } as any),
            !revealed && Platform.OS !== 'web' && { opacity: 0.15 },
          ]}
        >
          {pinyin && <Text style={s.hintPinyin}>{pinyin}</Text>}
          {meaning && <Text style={s.hintTranslation}>{meaning}</Text>}
        </View>
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
  const [hoveredBtn, setHoveredBtn] = useState<'forgot' | 'got' | null>(null);

  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 700;
  const hanziSize = compact ? 84 : FS.hanzi;
  const hanziLH = compact ? 96 : LH.hanzi;
  const cardMaxHeight = windowHeight - 252;

  const { user }        = useAuth();
  const { colors, isDark } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const startedAt       = useRef<string>(new Date().toISOString());
  const sessionConfig   = useRef<SessionConfig | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const flashColor = useRef<'got' | 'forgot' | null>(null);

  // Stagger animations for content reveal
  const pinyinAnim = useRef(new Animated.Value(0)).current;
  const meaningAnim = useRef(new Animated.Value(0)).current;
  const hintAnim = useRef(new Animated.Value(0)).current;

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
    setReveal(r => {
      const next = Math.min(r + 1, 2);
      if (next === 1) {
        // Stagger: animate pinyin in
        pinyinAnim.setValue(0);
        Animated.spring(pinyinAnim, {
          toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200,
        }).start();
      }
      if (next === 2) {
        // Stagger: animate meaning, then hint block
        meaningAnim.setValue(0);
        hintAnim.setValue(0);
        Animated.stagger(80, [
          Animated.spring(meaningAnim, {
            toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200,
          }),
          Animated.spring(hintAnim, {
            toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200,
          }),
        ]).start();
        setHintOpen(true);
      }
      return next;
    });
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
      toValue: 0, duration: 600, useNativeDriver: true,
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

    setTimeout(() => {
      Animated.timing(cardAnim, {
        toValue: 0, duration: 250, useNativeDriver: true,
      }).start(() => {
        if (isLast) { setDone(true); }
        else {
          flashAnim.setValue(0);  // kill leftover flash before new card
          pinyinAnim.setValue(0);
          meaningAnim.setValue(0);
          hintAnim.setValue(0);
          setIdx(nextIdx);
          setReveal(0);
          setHintOpen(false);
          setTranslationRevealed(false);
        }
      });
    }, 150);
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
    pinyinAnim.setValue(0); meaningAnim.setValue(0); hintAnim.setValue(0);
    setIdx(0); setReveal(0); setResults({}); setDone(false);
    setHintOpen(false); setTranslationRevealed(false);
  }, [user?.id]);

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.root, s.centered]}>
        <ActivityIndicator color={colors.inkRed} size="large" />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={[s.root, s.centered, { paddingHorizontal: 32 }]}>
        <Text style={{ color: colors.inkRedText, fontSize: FS.ui, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: colors.textSecondary }}>← Go back</Text>
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
  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView style={s.root}>
      <Scanlines color={colors.scanline} />
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
        <Text style={[s.scoreItem, s.scoreForgot]}>× {forgotCount}</Text>
        <Text style={s.scoreSep}>·</Text>
        <Text style={[s.scoreItem, s.scorePending]}>{remaining}</Text>
        <Text style={s.scoreSep}>·</Text>
        <Text style={[s.scoreItem, s.scoreGot]}>✓ {gotCount}</Text>
      </View>

      {/* Card */}
      <Animated.View
        style={[s.cardStage, { opacity: cardAnim, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] }]}
      >
        <TouchableOpacity
          style={[s.cardTouchable, compact && { paddingBottom: 8 }]}
          onPress={handleTap} activeOpacity={1}
        >
          {/* Card container */}
          <View style={[s.cardContainer, { maxHeight: cardMaxHeight }]}>
            <Scanlines color={colors.scanline} gap={4} />

            {/* Corner ornaments */}
            <CornerOrnament position="tl" />
            <CornerOrnament position="br" />

            {/* HSK badge */}
            <View style={s.hskBadge}>
              <Text style={s.hskBadgeText}>HSK {card.hsk_level}</Text>
            </View>

            {/* Scrollable card content — safety net for short viewports */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{ alignItems: 'center', width: '100%' }}
            >
            {/* Hanzi — serif, light weight, ink bleed */}
            <Text
              style={[s.hanziChar, compact && { fontSize: hanziSize, lineHeight: hanziLH, marginBottom: space.md }]}
              adjustsFontSizeToFit numberOfLines={1}
            >{card.hanzi}</Text>

            {/* Stage 1: Pinyin + audio icon — spring-animated reveal */}
            <Animated.View style={[s.pinyinRow, {
              opacity: reveal >= 1 ? pinyinAnim : 0,
              transform: [{ translateY: reveal >= 1
                ? pinyinAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] })
                : 10 }],
            }]}>
              <Text style={s.pinyinText}>{card.pinyin}</Text>
              <Text style={s.pinyinAudio}>♪</Text>
            </Animated.View>

            {/* Stage 2: POS + definition — staggered reveal */}
            <Animated.View style={[s.meaningBlock, {
              opacity: reveal >= 2 ? meaningAnim : 0,
              transform: [{ translateY: reveal >= 2
                ? meaningAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] })
                : 10 }],
            }]}>
              <View style={s.divider} />
              {card.part_of_speech && <Text style={s.posTag}>{card.part_of_speech}</Text>}
              <Text style={s.meaningText}>{card.meaning.replace(/; /g, '  ·  ')}</Text>
            </Animated.View>

            {/* Stage 3: Example sentence (collapsible hint block) — staggered */}
            {card._example && (
              <Animated.View style={[s.hintBlock, {
                opacity: reveal >= 2 ? hintAnim : 0,
                transform: [{ translateY: reveal >= 2
                  ? hintAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] })
                  : 10 }],
                pointerEvents: reveal < 2 ? 'none' as const : 'auto' as const,
              }]}>
                <TouchableOpacity
                  style={s.hintTrigger}
                  onPress={(e) => { e.stopPropagation(); setHintOpen(o => !o); }}
                  activeOpacity={0.7}
                >
                  <Text style={s.hintLabel}>EXAMPLE</Text>
                  <Text style={[s.hintIcon, hintOpen && s.hintIconOpen]}>▾</Text>
                </TouchableOpacity>

                <View style={[s.hintContent, !hintOpen && { opacity: 0 }]}>
                    <View style={s.hintDivider} />
                    {/* Example hanzi sentence */}
                    <Text style={s.hintHanzi}>{card._example.hanzi}</Text>
                    {/* Pinyin + translation — blurred until tapped */}
                    <BlurredExample
                      pinyin={card._example.pinyin}
                      meaning={card._example.meaning}
                      revealed={translationRevealed}
                      onReveal={() => setTranslationRevealed(true)}
                    />
                  </View>
              </Animated.View>
            )}

            {/* Tap hint — inside card surface */}
            <Text style={[s.tapHint, reveal >= 2 && { opacity: 0 }]} pointerEvents="none">
              {reveal === 0 ? 'tap · pinyin' : 'tap · meaning'}
            </Text>
            </ScrollView>

            {/* Feedback flash — outline + glow */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderWidth: 2,
                  borderColor: flashColor.current === 'got'
                    ? colors.greenBright
                    : colors.inkRedText,
                  opacity: flashAnim,
                  ...(Platform.OS === 'web' ? {
                    boxShadow: flashColor.current === 'got'
                      ? `0 0 30px rgba(${isDark ? '79,168,88' : '58,138,66'},0.5), inset 0 0 20px rgba(${isDark ? '79,168,88' : '58,138,66'},0.15)`
                      : `0 0 30px rgba(${isDark ? '200,56,42' : '184,48,30'},0.5), inset 0 0 20px rgba(${isDark ? '200,56,42' : '184,48,30'},0.15)`,
                  } as any : {}),
                },
              ]}
            />
          </View>

        </TouchableOpacity>
      </Animated.View>

      {/* Rating buttons */}
      <View style={s.buttonRow}>
        <TouchableOpacity
          style={[
            s.rateBtn, s.rateBtnForgot,
            hoveredBtn === 'forgot' && {
              backgroundColor: isDark ? 'rgba(122,30,20,0.25)' : 'rgba(184,48,30,0.16)',
              borderColor: colors.inkRed,
              ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${colors.inkRedGlow}` } as any : {}),
            },
          ]}
          onPress={() => rate('forgot')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setHoveredBtn('forgot'),
            onMouseLeave: () => setHoveredBtn(null),
          } as any : {})}
        >
          <Scanlines color={colors.scanline} gap={4} />
          <Text style={[s.rateBtnIcon, {
            color: hoveredBtn === 'forgot' ? colors.inkRed : colors.inkRedDim,
            fontSize: 18,
          }]}>×</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.rateBtn, s.rateBtnGot,
            hoveredBtn === 'got' && {
              backgroundColor: isDark ? 'rgba(58,122,68,0.25)' : 'rgba(45,110,56,0.16)',
              borderColor: colors.greenBright,
              ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px rgba(${isDark ? '58,122,68' : '45,110,56'},0.2)` } as any : {}),
            },
          ]}
          onPress={() => rate('got')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setHoveredBtn('got'),
            onMouseLeave: () => setHoveredBtn(null),
          } as any : {})}
        >
          <Scanlines color={colors.scanline} gap={4} />
          <Text style={[s.rateBtnIcon, {
            color: hoveredBtn === 'got' ? colors.greenBright : colors.green,
          }]}>✓</Text>
        </TouchableOpacity>
      </View>

      </ResponsiveShell>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: t.bg },
  centered:{ alignItems: 'center', justifyContent: 'center' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm,
  },
  iconBtn:         { padding: space.sm, borderRadius: 8 },
  iconBtnDisabled: { opacity: 0.2 },
  iconBtnText:     { fontSize: 18, fontFamily: MONO, letterSpacing: LS.tighter * 18, color: t.textSecondary },

  scoreStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: space.md, paddingBottom: 10,
  },
  scoreItem:   { fontFamily: MONO, fontSize: FS.label, fontWeight: FW.medium },
  scoreForgot: { color: t.inkRedDim },
  scoreGot:    { color: t.green },
  scorePending:{ color: t.textFaint },
  scoreSep:    { color: t.textFaint, fontSize: 10 },

  cardStage: { flex: 1, position: 'relative' },
  cardTouchable: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingBottom: 16,
  },

  // Card container — explicit bordered box
  cardContainer: {
    width: '100%', maxWidth: 340,
    backgroundColor: t.bgCard,
    borderWidth: 1.5,
    borderColor: t.border,
    paddingHorizontal: space.xxl,
    paddingTop: 28,
    paddingBottom: space.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Outer shadow (cross-platform)
    shadowColor: t.cardShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 12,
  },

  hskBadge: {
    position: 'absolute', top: 10, right: 14,
  },
  hskBadgeText: {
    fontFamily: MONO, fontSize: 9, color: t.textFaint,
    letterSpacing: 1.5, opacity: 0.6,
  },

  // Hanzi — serif font, light weight, ink-bleed shadow
  hanziChar: {
    fontFamily: SERIF,
    fontSize: FS.hanzi,
    fontWeight: FW.light,
    color: t.textHanzi,
    lineHeight: LH.hanzi,
    letterSpacing: LS.tighter * FS.hanzi,
    textAlign: 'center',
    maxWidth: '100%',
    textShadowColor: t.inkRedGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
    marginBottom: space.xl,
  },

  // Pinyin row (pinyin + audio icon)
  pinyinRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: space.lg,
  },
  pinyinText: {
    fontFamily: MONO, fontSize: 18, letterSpacing: LS.wider * 18,
    color: t.inkRedText, fontStyle: 'italic', opacity: 0.9,
    textShadowColor: t.inkRedGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  pinyinAudio: {
    fontSize: 12, color: t.textFaint, opacity: 0.6,
  },

  // Divider
  divider: {
    width: '100%', height: 1,
    backgroundColor: t.border, marginBottom: space.lg,
  },

  // Meaning block (POS + definition)
  meaningBlock: { width: '100%', alignItems: 'flex-start', marginBottom: space.lg },
  posTag: {
    fontFamily: MONO, fontSize: 10,
    color: t.textFaint, letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: space.xs,
  },
  meaningText: {
    fontFamily: MONO, fontSize: 15, fontWeight: FW.light, color: t.textSecondary,
    lineHeight: 22, letterSpacing: 0.5,
  },

  // Hint block (collapsible example)
  hintBlock: {
    width: '100%',
    borderWidth: 1,
    borderColor: t.borderDim,
    backgroundColor: t.bgCard2,
    overflow: 'hidden',
  },
  hintTrigger: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: space.md, paddingVertical: space.sm,
  },
  hintLabel: {
    flex: 1, fontFamily: MONO, fontSize: 10,
    letterSpacing: LS.widest * 10, color: t.textFaint, textTransform: 'uppercase',
  },
  hintIcon: {
    fontFamily: MONO, fontSize: 10, color: t.textFaint,
  },
  hintIconOpen: {
    transform: [{ rotate: '180deg' }],
  },
  hintContent: {
    paddingHorizontal: space.md, paddingBottom: space.md,
  },
  hintDivider: {
    height: 1, backgroundColor: t.borderDim, marginBottom: space.sm,
  },
  hintHanzi: {
    fontFamily: SERIF, fontSize: FS.pinyin, color: t.textPrimary,
    lineHeight: LH.pinyin, letterSpacing: 1, marginBottom: space.sm,
  },
  hintPinyin: {
    fontFamily: MONO, fontSize: 11, color: t.inkRedText,
    fontStyle: 'italic', letterSpacing: LS.wider * 11, lineHeight: 17,
    marginBottom: space.xs,
  },
  hintTranslation: {
    fontFamily: MONO, fontSize: 10, color: t.textSecondary,
    letterSpacing: 0.5, lineHeight: 16,
  },

  // Blur wrapper for translation
  blurWrapper: { position: 'relative' },
  blurLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start', justifyContent: 'center',
  },
  blurLabelText: {
    fontFamily: MONO, fontSize: 9, letterSpacing: 3,
    color: t.textFaint, textTransform: 'uppercase',
  },

  // Tap hint (inside card surface)
  tapHint: {
    marginTop: space.md,
    fontFamily: MONO, fontSize: 9, color: t.textFaint,
    letterSpacing: LS.extreme * 9, textTransform: 'uppercase',
  },

  // Rating buttons — square-ish with text labels
  buttonRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 40, paddingBottom: 24,
    gap: space.lg,
  },
  rateBtn: {
    width: 64, height: 64, borderRadius: radius.square,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { transition: 'background-color 150ms, border-color 150ms, box-shadow 200ms' } as any : {}),
  },
  rateBtnForgot: {
    backgroundColor: t.inkRedGlow,
    borderColor: t.inkRedDim,
  },
  rateBtnGot: {
    backgroundColor: t.green === '#3a7a44'
      ? 'rgba(58,122,68,0.12)'     // dark
      : 'rgba(45,110,56,0.08)',     // light
    borderColor: t.green,
  },
  rateBtnIcon: { fontSize: 20 },
});

// ── Session Complete Styles ────────────────────────────────────────────────────
const makeCompleteStyles = (t: ColorTheme) => StyleSheet.create({
  root: {
    flex: 1, backgroundColor: t.bg,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36,
  },
  seal:      { fontSize: FS.seal, color: t.inkRed, opacity: 0.3, marginBottom: space.xxxl },
  title:     { fontSize: FS.title, color: t.textPrimary, fontWeight: FW.semibold, marginBottom: space.sm, textAlign: 'center', letterSpacing: LS.tight * FS.title },
  sub:       { fontFamily: MONO, fontSize: FS.label, color: t.textSecondary, letterSpacing: 1, marginBottom: 40 },

  stats:     { flexDirection: 'row', alignItems: 'center', gap: space.xxl, marginBottom: 32 },
  stat:      { alignItems: 'center' },
  statVal:   { fontSize: FS.score, lineHeight: LH.score, marginBottom: 6, letterSpacing: LS.tighter * FS.score },
  statLabel: { fontFamily: MONO, fontSize: FS.label, color: t.textSecondary, letterSpacing: 1.5 },
  statSep:   { color: t.textSecondary, fontSize: FS.subheading },

  pctBadge: {
    borderWidth: 1, borderColor: t.border, borderRadius: 100,
    paddingHorizontal: space.xl, paddingVertical: space.sm, marginBottom: space.giant,
  },
  pctText: { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary, letterSpacing: 1 },

  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
