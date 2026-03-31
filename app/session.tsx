import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Animated, ActivityIndicator, Platform, useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { INCONSOLATA, INCONSOLATA_MEDIUM, MONO, FS, FW, LH, LS } from '@/theme/tokens';
import { Icon } from '@/theme/icons';
import { space } from '@/theme/spacing';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { CornerOrnament } from '@/components/CornerOrnament';
import { TypewriterText } from '@/components/TypewriterText';
import type { SessionConfig } from '@/lib/types';
import {
  fetchCardsForSession, loadResumeState,
  upsertResumeSession, deleteResumeSession, writeSessionResults,
  RESUME_SESSION_KEY, SESSION_CONFIG_KEY,
  type Card, type Results, type ResumeState,
} from '@/lib/progress';
// import { useDialKit } from 'dialkit'; // disabled — using fixed values


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
  const [translationRevealed, setTranslationRevealed] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<'forgot' | 'got' | null>(null);

  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 700;
  const hanziSize = compact ? 84 : FS.hanzi;
  const hanziLH = compact ? 96 : FS.hanzi * LH.single;
  const cardMaxHeight = windowHeight - 252;

  const { user }        = useAuth();
  const { colors, isDark, fonts } = useTheme();
  const s = useMemo(() => makeStyles(colors, fonts.hanzi, fonts.hanziWeight), [colors, fonts.hanzi, fonts.hanziWeight]);

  // DialKit disabled — using fixed values matched to mockup
  // TODO: re-enable DialKit once design is finalized
  const dk = {
    // Card container
    cardMaxWidth:     420,
    cardPaddingH:     24,
    cardPaddingTop:   28,
    cardPaddingBot:   20,

    // Hanzi hero
    hanziSize:        76,
    hanziMarginBot:   14,
    hanziGlowRadius:  40,

    // Pinyin
    pinyinSize:       FS.body,
    pinyinGap:        6,
    pinyinMarginBot:  14,
    pinyinOpacity:    colors.opPinyin,
    pinyinColor:      colors.textPrimary,

    // Divider
    dividerHeight:    1,
    dividerMarginBot: 16,

    // POS tag
    posSize:          FS.micro,
    posLetterSpacing: 2,
    posMarginBot:     1,
    posColor:         colors.textPrimary,

    // Meaning
    meaningSize:      FS.body,
    meaningLineHeight:LH.normal,
    meaningLetterSp:  LS.wide * FS.body,
    meaningMarginBot: 16,
    meaningColor:     colors.textPrimary,

    // Example block
    exHanziSize:      FS.large,
    exPinyinSize:     FS.body,
    exTranslSize:     FS.small,

    // Tap hint
    tapHintSize:      FS.micro,
    tapHintMarginTop: 14,

    // Corner ornaments
    ornamentSize:     8,
    ornamentOpacity:  colors.opOrnament,
    ornamentOffset:   6,
    ornamentOffsetH:  10,

    // HSK badge
    badgeSize:        FS.micro,
    badgeLetterSp:    1.5,
    badgeOpacity:     colors.opHskBadge,
    badgeTop:         8,
    badgeRight:       14,

    // Score strip
    scoreSize:        FS.small,
    scoreSepSize:     FS.small,
    scoreGap:         10,
    scorePaddingBot:  14,

    // Rating buttons
    rateBtnSize:      64,
    rateBtnIconSize:  20,
    rateBtnGap:       16,
    rateBtnPaddingH:  40,
    rateBtnPaddingBot:24,

    // Animations
    entranceDamping:  18,
    entranceStiffness:200,
    entranceTranslY:  20,
    entranceScale:    0.96,
    revealDamping:    18,
    revealStiffness:  200,
    revealTranslY:    10,
    staggerDelay:     80,
    flashDuration:    600,
    exitDelay:        150,
    exitDuration:     250,

    // Colors
    hanziColor:       colors.textHanzi,
  };

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
      damping: dk.entranceDamping,
      stiffness: dk.entranceStiffness,
    }).start();
  }, [idx, cards.length]);

  const handleTap = useCallback(() => {
    setReveal(r => {
      if (r >= 2) return r;  // already fully revealed — do nothing
      const next = r + 1;
      if (next === 1) {
        pinyinAnim.setValue(0);
        Animated.spring(pinyinAnim, {
          toValue: 1, useNativeDriver: true, damping: dk.revealDamping, stiffness: dk.revealStiffness,
        }).start();
      }
      if (next === 2) {

        meaningAnim.setValue(0);
        hintAnim.setValue(0);
        Animated.stagger(dk.staggerDelay, [
          Animated.spring(meaningAnim, {
            toValue: 1, useNativeDriver: true, damping: dk.revealDamping, stiffness: dk.revealStiffness,
          }),
          Animated.spring(hintAnim, {
            toValue: 1, useNativeDriver: true, damping: dk.revealDamping, stiffness: dk.revealStiffness,
          }),
        ]).start();
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
      toValue: 0, duration: dk.flashDuration, useNativeDriver: true,
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
        toValue: 0, duration: dk.exitDuration, useNativeDriver: true,
      }).start(() => {
        if (isLast) { setDone(true); }
        else {
          flashAnim.setValue(0);  // kill leftover flash before new card
          pinyinAnim.setValue(0);
          meaningAnim.setValue(0);
          hintAnim.setValue(0);
          setIdx(nextIdx);
          setReveal(0);
          setTranslationRevealed(false);
        }
      });
    }, dk.exitDelay);
  }, [cards, idx, results, user?.id]);

  const goBack = useCallback(() => {
    if (idx === 0) return;
    setIdx(i => i - 1);
    setReveal(0);
    setTranslationRevealed(false);
  }, [idx]);

  const restart = useCallback(() => {
    startedAt.current = new Date().toISOString();
    AsyncStorage.removeItem(RESUME_SESSION_KEY);
    if (user?.id) deleteResumeSession(user.id);  // fire-and-forget
    setCards(c => [...c].sort(() => Math.random() - 0.5));
    pinyinAnim.setValue(0); meaningAnim.setValue(0); hintAnim.setValue(0);
    setIdx(0); setReveal(0); setResults({}); setDone(false);
    setTranslationRevealed(false);
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
        <Text style={{ fontFamily: MONO, color: colors.inkRedText, fontSize: FS.body, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: MONO, color: colors.textSecondary }}>← Go back</Text>
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
  const cardScale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [dk.entranceScale, 1] });
  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [dk.entranceTranslY, 0] });

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={640}>

      {/* Top bar */}
      <View style={s.topbar}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={s.iconBtnText}>{Icon.close}</Text>
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
      <View style={[s.scoreStrip, { gap: dk.scoreGap, paddingBottom: dk.scorePaddingBot }]}>
        <Text style={[s.scoreItem, s.scoreForgot, { fontSize: dk.scoreSize }]}>{Icon.close} {forgotCount}</Text>
        <Text style={[s.scoreSep, { fontSize: dk.scoreSepSize }]}>{Icon.separator}</Text>
        <Text style={[s.scoreItem, s.scorePending, { fontSize: dk.scoreSize }]}>{remaining}</Text>
        <Text style={[s.scoreSep, { fontSize: dk.scoreSepSize }]}>{Icon.separator}</Text>
        <Text style={[s.scoreItem, s.scoreGot, { fontSize: dk.scoreSize }]}>{Icon.correct} {gotCount}</Text>
      </View>

      {/* Card */}
      <Animated.View
        style={[s.cardStage, { opacity: cardAnim, transform: [{ scale: cardScale }, { translateY: cardTranslateY }] }]}
      >
        <TouchableOpacity
          style={s.cardTouchable}
          onPress={handleTap} activeOpacity={1}
        >
          {/* Card container */}
          <View style={[s.cardContainer, {
            maxWidth: dk.cardMaxWidth,
            paddingHorizontal: dk.cardPaddingH,
            paddingTop: dk.cardPaddingTop,
            paddingBottom: dk.cardPaddingBot,
          }]}>

            {/* Corner ornaments */}
            <CornerOrnament position="tl" size={dk.ornamentSize} opacity={dk.ornamentOpacity} offset={dk.ornamentOffset} offsetH={dk.ornamentOffsetH} />
            <CornerOrnament position="br" size={dk.ornamentSize} opacity={dk.ornamentOpacity} offset={dk.ornamentOffset} offsetH={dk.ornamentOffsetH} />

            {/* HSK badge */}
            <View style={[s.hskBadge, { top: dk.badgeTop, right: dk.badgeRight }]}>
              <Text style={[s.hskBadgeText, { fontSize: dk.badgeSize, letterSpacing: dk.badgeLetterSp, opacity: dk.badgeOpacity }]}>HSK {card.hsk_level}</Text>
            </View>

            {/* ── Zone 1: Definition (flex:2) — hanzi + pinyin + meaning ── */}
            <View style={s.zone1}>
              {/* Hanzi — serif, light weight, ink bleed */}
              <Text
                style={[s.hanziChar, compact && { fontSize: hanziSize, lineHeight: hanziLH }, {
                  fontSize: compact ? hanziSize : dk.hanziSize,
                  lineHeight: compact ? hanziLH : dk.hanziSize * LH.single,
                  color: dk.hanziColor,
                  textShadowRadius: dk.hanziGlowRadius,
                }]}
                adjustsFontSizeToFit numberOfLines={1}
              >{card.hanzi}</Text>

              {/* Stage 1: Pinyin + audio icon — spring-animated reveal */}
              <Animated.View style={[s.pinyinRow, { gap: dk.pinyinGap }, {
                opacity: reveal >= 1 ? pinyinAnim : 0,
                transform: [{ translateY: reveal >= 1
                  ? pinyinAnim.interpolate({ inputRange: [0, 1], outputRange: [dk.revealTranslY, 0] })
                  : dk.revealTranslY }],
              }]}>
                <Text style={[s.pinyinText, { fontSize: dk.pinyinSize, opacity: dk.pinyinOpacity, color: dk.pinyinColor }]}>{card.pinyin}</Text>
                <Text style={s.pinyinAudio}>♪</Text>
              </Animated.View>

              {/* Stage 2: POS + definition — staggered reveal */}
              <Animated.View style={[s.meaningBlock, {
                opacity: reveal >= 2 ? meaningAnim : 0,
                transform: [{ translateY: reveal >= 2
                  ? meaningAnim.interpolate({ inputRange: [0, 1], outputRange: [dk.revealTranslY, 0] })
                  : dk.revealTranslY }],
              }]}>
                {card.part_of_speech && <Text style={[s.posTag, { fontSize: dk.posSize, letterSpacing: dk.posLetterSpacing, marginBottom: dk.posMarginBot, color: dk.posColor }]}>{card.part_of_speech.charAt(0).toUpperCase()}</Text>}
                <Text style={[s.meaningText, { fontSize: dk.meaningSize, lineHeight: dk.meaningSize * dk.meaningLineHeight, letterSpacing: dk.meaningLetterSp, color: dk.meaningColor }]}>{card.meaning.replace(/; /g, '  ·  ')}</Text>
              </Animated.View>

              {/* Tap hint — inside zone 1 */}
              <Text style={[s.tapHint, reveal >= 2 && { opacity: 0 }, { fontSize: dk.tapHintSize }]} pointerEvents="none">
                {reveal === 0 ? 'tap · pinyin' : 'tap · meaning'}
              </Text>
            </View>

            {/* ── Divider ── */}
            <Animated.View style={[{ width: '100%' }, {
              opacity: reveal >= 2 ? meaningAnim : 0,
            }]}>
              <View style={[s.divider, { height: dk.dividerHeight }]} />
            </Animated.View>

            {/* ── Zone 2: Example (flex:1) ── */}
            <View style={s.zone2}>
              {card._example && (
                <Animated.View style={{
                  width: '100%',
                  opacity: reveal >= 2 ? hintAnim : 0,
                  transform: [{ translateY: reveal >= 2
                    ? hintAnim.interpolate({ inputRange: [0, 1], outputRange: [dk.revealTranslY, 0] })
                    : dk.revealTranslY }],
                  pointerEvents: reveal < 2 ? 'none' as const : 'auto' as const,
                }}>
                  {/* Example hanzi — prominent */}
                  <Text style={[s.exHanzi, { fontSize: dk.exHanziSize, lineHeight: dk.exHanziSize * LH.single }]}>{card._example.hanzi}</Text>

                  {/* Pinyin — always rendered, opacity-controlled */}
                  {card._example.pinyin && (
                    <Text style={[s.exPinyin, !translationRevealed && { opacity: 0 }]}>{card._example.pinyin}</Text>
                  )}

                  {/* Translation — typewriter reveal, starts after pinyin */}
                  {card._example.meaning && (
                    <TypewriterText
                      text={card._example.meaning}
                      active={translationRevealed}
                      delay={30}
                      startDelay={400}
                      style={s.exTranslation}
                    />
                  )}

                  {/* Tap hint — opacity-controlled to prevent layout shift */}
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); if (!translationRevealed) setTranslationRevealed(true); }}
                    activeOpacity={0.7}
                    style={[s.translateHint, translationRevealed && { opacity: 0, pointerEvents: 'none' as const }]}
                  >
                    <Text style={s.translateHintText}>▸ tap to translate</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>

            {/* Feedback flash — outline + glow */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                {
                  borderWidth: 2,
                  borderColor: flashColor.current === 'got'
                    ? colors.flashGotBorder
                    : colors.flashForgotBorder,
                  opacity: flashAnim,
                  ...(Platform.OS === 'web' ? {
                    boxShadow: flashColor.current === 'got'
                      ? `0 0 30px ${colors.flashGotGlow}, inset 0 0 20px ${colors.flashGotInset}`
                      : `0 0 30px ${colors.flashForgotGlow}, inset 0 0 20px ${colors.flashForgotInset}`,
                  } as any : {}),
                },
              ]}
            />
          </View>

        </TouchableOpacity>
      </Animated.View>

      {/* Rating buttons */}
      <View style={[s.buttonRow, { paddingHorizontal: dk.rateBtnPaddingH, paddingBottom: dk.rateBtnPaddingBot, gap: dk.rateBtnGap }]}>
        <TouchableOpacity
          style={[
            s.rateBtn, s.rateBtnForgot,
            hoveredBtn === 'forgot' && {
              backgroundColor: colors.forgotBtnBorder,
              borderColor: colors.forgotBtn,
              ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${colors.forgotBtnBorder}` } as any : {}),
            },
            { width: dk.rateBtnSize, height: dk.rateBtnSize },
          ]}
          onPress={() => rate('forgot')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setHoveredBtn('forgot'),
            onMouseLeave: () => setHoveredBtn(null),
          } as any : {})}
        >
          <Text style={[s.rateBtnIcon, {
            color: colors.forgotBtn,
            fontSize: dk.rateBtnIconSize,
          }]}>{Icon.close}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.rateBtn, s.rateBtnGot,
            hoveredBtn === 'got' && {
              backgroundColor: colors.gotBtnBorder,
              borderColor: colors.gotBtn,
              ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${colors.gotBtnBorder}` } as any : {}),
            },
            { width: dk.rateBtnSize, height: dk.rateBtnSize },
          ]}
          onPress={() => rate('got')}
          activeOpacity={0.8}
          {...(Platform.OS === 'web' ? {
            onMouseEnter: () => setHoveredBtn('got'),
            onMouseLeave: () => setHoveredBtn(null),
          } as any : {})}
        >
          <Text style={[s.rateBtnIcon, {
            color: colors.gotBtn,
            fontSize: dk.rateBtnIconSize,
          }]}>{Icon.correct}</Text>
        </TouchableOpacity>
      </View>

      </ResponsiveShell>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (t: ColorTheme, hanziFont: string, hanziWeight: string) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: t.bg },
  centered:{ alignItems: 'center', justifyContent: 'center' },

  topbar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingHorizontal: space.xl, paddingTop: space.md, paddingBottom: space.sm,
  },
  iconBtn:         { padding: space.sm },
  iconBtnDisabled: { opacity: 0.2 },
  iconBtnText:     { fontSize: FS.small, fontFamily: INCONSOLATA, letterSpacing: LS.tighter * FS.small, color: t.textSecondary },

  scoreStrip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: space.md, paddingBottom: 10,
  },
  scoreItem:   { fontFamily: MONO, fontSize: FS.small, fontWeight: FW.regular },
  scoreForgot: { color: t.scoreForgot },
  scoreGot:    { color: t.scoreGot },
  scorePending:{ color: t.scoreRemaining },
  scoreSep:    { fontFamily: MONO, color: t.textFaint, fontSize: FS.small },

  cardStage: { position: 'relative' },
  cardTouchable: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Card container — elevation shadow (dark), no border (light)
  cardContainer: {
    width: '100%', maxWidth: 420,
    backgroundColor: t.bgCard,
    borderWidth: 0,
    paddingHorizontal: space.xxl,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: `0 2px 16px ${t.cardElevation}, 0 0 0 1px ${t.cardHairline}`,
    } as any : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: t.cardElevation === 'rgba(0,0,0,0)' ? 0 : 0.5,
      shadowRadius: 16,
      elevation: t.cardElevation === 'rgba(0,0,0,0)' ? 0 : 12,
    }),
  },

  hskBadge: {
    position: 'absolute', top: 10, right: 14,
  },
  hskBadgeText: {
    fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textPrimary,
    letterSpacing: 1.5, opacity: t.opHskBadge,
  },

  // Hanzi — serif font, light weight, ink-bleed shadow
  // Two-zone card layout
  zone1: {
    flex: 2, width: '100%',
    alignItems: 'center', justifyContent: 'center',
    gap: 16,
  },
  zone2: {
    flex: 1, width: '100%',
    alignItems: 'flex-start', justifyContent: 'flex-start',
  },

  hanziChar: {
    fontFamily: hanziFont,
    fontSize: FS.display,
    fontWeight: hanziWeight as any,
    color: t.textHanzi,
    alignSelf: 'center',
    lineHeight: FS.display * LH.single,
    letterSpacing: LS.tighter * FS.display,
    textAlign: 'center',
    maxWidth: '100%',
    textShadowColor: t.inkRedGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },

  // Pinyin row (pinyin + audio icon)
  pinyinRow: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6,
  },
  pinyinText: {
    fontFamily: INCONSOLATA_MEDIUM, fontSize: FS.body, fontWeight: '500',
    letterSpacing: LS.wider * FS.body,
    color: t.textPrimary, opacity: t.opPinyin,
  },
  pinyinAudio: {
    fontFamily: INCONSOLATA, fontSize: FS.small, color: t.textFaint, opacity: 0.5,
  },

  // Divider
  divider: {
    width: '100%', height: 1,
    backgroundColor: t.dividerSubtle, marginVertical: 4,
  },

  // Meaning block (POS + definition)
  meaningBlock: { width: '100%', alignItems: 'flex-start' },
  posTag: {
    fontFamily: INCONSOLATA, fontSize: FS.micro,
    color: t.textPrimary, opacity: t.opDecorative,
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: 1,
  },
  meaningText: {
    fontFamily: INCONSOLATA, fontSize: FS.body, fontWeight: FW.regular, color: t.textPrimary,
    opacity: t.opMeaning,
    lineHeight: FS.body * LH.normal, letterSpacing: LS.wide * FS.body,
  },

  // Example sentence — inline on card surface
  exampleBlock: {
    width: '100%', alignSelf: 'stretch', alignItems: 'flex-start', marginBottom: space.md,
  },
  exHanzi: {
    fontFamily: hanziFont, fontSize: FS.large, fontWeight: hanziWeight as any,
    color: t.textPrimary,
    lineHeight: FS.large * LH.single, letterSpacing: LS.example * FS.large,
    marginBottom: 6,
  },
  exPinyin: {
    fontFamily: INCONSOLATA, fontSize: FS.body, color: t.textPrimary,
    opacity: t.opMeaning,
    letterSpacing: LS.example * FS.body, lineHeight: FS.body * LH.normal,
    marginBottom: space.xs,
  },
  exTranslation: {
    fontFamily: INCONSOLATA, fontSize: FS.small, color: t.textPrimary,
    opacity: t.opExampleEnglish,
  },
  translateHint: {
    marginTop: space.sm,
  },
  translateHintText: {
    fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textFaint,
    letterSpacing: LS.widest * FS.micro, textTransform: 'uppercase',
  },

  // Tap hint (inside card surface)
  tapHint: {
    alignSelf: 'center',
    fontFamily: INCONSOLATA, fontSize: FS.micro, color: t.textPrimary,
    opacity: t.opDecorative,
    letterSpacing: LS.extreme * FS.micro, textTransform: 'uppercase',
  },

  // Rating buttons — square-ish with text labels
  buttonRow: {
    flexDirection: 'row', justifyContent: 'center',
    paddingHorizontal: 40, paddingTop: 14, paddingBottom: 40,
    gap: space.lg,
  },
  rateBtn: {
    width: 64, height: 64,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { transition: 'background-color 150ms, border-color 150ms, box-shadow 200ms' } as any : {}),
  },
  rateBtnForgot: {
    backgroundColor: 'transparent',
    borderColor: t.forgotBtnBorder,
  },
  rateBtnGot: {
    backgroundColor: 'transparent',
    borderColor: t.gotBtnBorder,
  },
  rateBtnIcon: { fontFamily: MONO, fontSize: 20 },
});

// ── Session Complete Styles ────────────────────────────────────────────────────
const makeCompleteStyles = (t: ColorTheme) => StyleSheet.create({
  root: {
    flex: 1, backgroundColor: t.bg,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36,
  },
  seal:      { fontFamily: MONO, fontSize: FS.formTitle, color: t.inkRed, opacity: 0.3, marginBottom: space.xxl },
  title:     { fontFamily: MONO, fontSize: FS.formTitle, color: t.textPrimary, fontWeight: FW.medium, marginBottom: space.sm, textAlign: 'center', letterSpacing: LS.tighter * FS.formTitle },
  sub:       { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary, letterSpacing: 1, marginBottom: 40 },

  stats:     { flexDirection: 'row', alignItems: 'center', gap: space.xxl, marginBottom: 32 },
  stat:      { alignItems: 'center' },
  statVal:   { fontFamily: MONO, fontSize: FS.formTitle, lineHeight: FS.formTitle * LH.single, marginBottom: 6, letterSpacing: LS.tighter * FS.formTitle },
  statLabel: { fontFamily: MONO, fontSize: FS.label, color: t.textSecondary, letterSpacing: 1.5 },
  statSep:   { fontFamily: MONO, color: t.textSecondary, fontSize: FS.definition },

  pctBadge: {
    borderWidth: 1, borderColor: t.border,
    paddingHorizontal: space.xl, paddingVertical: space.sm, marginBottom: space.giant,
  },
  pctText: { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary, letterSpacing: 1 },

  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
