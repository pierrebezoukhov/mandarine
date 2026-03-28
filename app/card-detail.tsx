import { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { ColorTheme } from '@/theme/colors';
import { MONO, SERIF, FS, FW, LS, LH } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { fetchCardDetail, CardDetail } from '@/lib/search';
import { supabase } from '@/lib/supabase';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors, fonts } = useTheme();
  const { isDesktop } = useResponsive();
  const s = useMemo(() => makeStyles(colors, isDesktop, fonts.hanzi), [colors, isDesktop, fonts.hanzi]);

  const [card, setCard] = useState<CardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCardDetail(id, user?.id)
      .then(setCard)
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  const handleMarkForReview = useCallback(async () => {
    if (!user?.id || !id || marking) return;
    setMarking(true);
    try {
      await supabase.rpc('upsert_card_progress', {
        p_user_id: user.id,
        p_card_id: id,
        p_result: 'forgot',
      });
      const updated = await fetchCardDetail(id, user.id);
      if (updated) setCard(updated);
    } finally {
      setMarking(false);
    }
  }, [user?.id, id, marking]);

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ResponsiveShell maxWidth={640} align="start">
          <View style={s.loadingWrap}>
            <Text style={s.loadingText}>Loading...</Text>
          </View>
        </ResponsiveShell>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView style={s.root}>
        <ResponsiveShell maxWidth={640} align="start">
          <View style={s.loadingWrap}>
            <Text style={s.loadingText}>Card not found</Text>
          </View>
        </ResponsiveShell>
      </SafeAreaView>
    );
  }

  const accuracy = card.times_seen && card.times_seen > 0
    ? Math.round(((card.times_got ?? 0) / card.times_seen) * 100)
    : null;

  const lastReviewed = card.last_reviewed
    ? new Date(card.last_reviewed).toLocaleDateString()
    : null;

  // ── Left panel: hero + example ──────────────────────────────────────────
  const leftContent = (
    <View style={s.leftPanel}>
      <View style={s.hero}>
        <Text style={s.hanzi}>{card.hanzi}</Text>
        <Text style={s.pinyin}>{card.pinyin}</Text>
        <Text style={s.meaning}>{card.meaning}</Text>
        {card.part_of_speech && (
          <Badge label={card.part_of_speech} variant="muted" style={s.posBadge} />
        )}
      </View>

      {card.ex_hanzi && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>EXAMPLE</Text>
          <Text style={s.exHanzi}>{card.ex_hanzi}</Text>
          {card.ex_pinyin && <Text style={s.exPinyin}>{card.ex_pinyin}</Text>}
          {card.ex_meaning && <Text style={s.exMeaning}>{card.ex_meaning}</Text>}
        </View>
      )}
    </View>
  );

  // ── Right panel: stats + actions ────────────────────────────────────────
  const rightContent = (
    <View style={s.rightPanel}>
      {user && card.times_seen !== undefined && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>MASTERY</Text>
          <View style={isDesktop ? s.statsCol : s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statValue}>{card.times_seen ?? 0}</Text>
              <Text style={s.statLabel}>Seen</Text>
            </View>
            {accuracy !== null && (
              <View style={s.stat}>
                <Text style={s.statValue}>{accuracy}%</Text>
                <Text style={s.statLabel}>Accuracy</Text>
              </View>
            )}
            {lastReviewed && (
              <View style={s.stat}>
                <Text style={s.statValue}>{lastReviewed}</Text>
                <Text style={s.statLabel}>Last reviewed</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={s.actions}>
        <Button
          label={marking ? 'Marking...' : 'Mark for review'}
          variant="secondary"
          onPress={handleMarkForReview}
          disabled={marking}
        />
        <Button
          label="Study"
          variant="ghost"
          onPress={() => {}}
          disabled
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={640} align="start">
        <ScrollView contentContainerStyle={s.scroll}>
          {/* Back button */}
          <View style={s.nav}>
            <Button
              label={`${Icon.left} Back`}
              variant="ghost"
              onPress={() => router.back()}
            />
            <Badge label={`HSK ${card.hsk_level}`} />
          </View>

          {/* Content — side-by-side on desktop, stacked on mobile */}
          {isDesktop ? (
            <View style={s.twoPanel}>
              {leftContent}
              {rightContent}
            </View>
          ) : (
            <>
              {leftContent}
              {rightContent}
            </>
          )}
        </ScrollView>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme, isDesktop: boolean, hanziFont: string) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },

  scroll: {
    paddingBottom: space.massive,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.massive,
  },
  loadingText: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textFaint,
  },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },

  // ── Two-panel desktop layout ─────────────────────────────────────────
  twoPanel: {
    flexDirection: 'row',
    gap: space.xxxl,
  },
  leftPanel: {
    flex: 1,
  },
  rightPanel: {
    width: 200,
    paddingTop: space.huge,
  },

  hero: {
    alignItems: isDesktop ? 'flex-start' : 'center',
    paddingVertical: space.huge,
    paddingHorizontal: space.xxl,
  },
  hanzi: {
    fontFamily: hanziFont,
    fontSize: FS.hanzi,
    fontWeight: FW.light,
    color: t.textHanzi,
    letterSpacing: LS.tighter * FS.hanzi,
    lineHeight: FS.hanzi * LH.single,
  },
  pinyin: {
    fontFamily: MONO,
    fontSize: FS.pinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.wider * FS.pinyin,
    marginTop: space.md,
  },
  meaning: {
    fontFamily: MONO,
    fontSize: FS.definition,
    fontWeight: FW.light,
    color: t.textPrimary,
    letterSpacing: LS.wide * FS.definition,
    lineHeight: FS.definition * LH.normal,
    marginTop: space.sm,
    textAlign: isDesktop ? 'left' : 'center',
  },
  posBadge: {
    marginTop: space.md,
  },

  section: {
    paddingHorizontal: space.xxl,
    paddingTop: space.xxl,
  },
  sectionLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.medium,
    color: t.textFaint,
    letterSpacing: LS.widest * FS.label,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  exHanzi: {
    fontFamily: hanziFont,
    fontSize: FS.definition,
    color: t.textHanzi,
    lineHeight: FS.definition * LH.normal,
  },
  exPinyin: {
    fontFamily: MONO,
    fontSize: FS.exPinyin,
    fontStyle: 'italic',
    color: t.inkRedText,
    letterSpacing: LS.example * FS.exPinyin,
    marginTop: space.xs,
  },
  exMeaning: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.body,
    lineHeight: FS.body * LH.normal,
    marginTop: space.xs,
  },

  statsRow: {
    flexDirection: 'row',
    gap: space.xxl,
  },
  statsCol: {
    flexDirection: 'column',
    gap: space.lg,
  },
  stat: {
    alignItems: isDesktop ? 'flex-start' : 'center',
  },
  statValue: {
    fontFamily: MONO,
    fontSize: FS.definition,
    fontWeight: FW.medium,
    color: t.textPrimary,
  },
  statLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    color: t.textFaint,
    letterSpacing: LS.wider * FS.label,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  actions: {
    paddingHorizontal: isDesktop ? 0 : space.xxl,
    paddingTop: space.xxxl,
    gap: space.md,
  },
});
