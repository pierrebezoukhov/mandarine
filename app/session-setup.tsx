import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, FlatList, SafeAreaView, ActivityIndicator, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { T, FS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { SegmentedControl } from '@/components/SegmentedControl';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Button } from '@/components/Button';
import { deleteResumeSession, RESUME_SESSION_KEY, SESSION_CONFIG_KEY } from '@/lib/progress';

// ── Types ─────────────────────────────────────────────────────────────────────
export type Deck = {
  id: string;
  name: string;
  description: string;
  type: string;
  hsk_level: number | null;
  is_public: boolean;
};

export type DifficultyFilter = 'new' | 'review' | 'hard';

export type SessionConfig = {
  deck: Deck | null;
  cardCount: number;
  isCustomCount: boolean;
  difficulties: DifficultyFilter[];
};

// ── Constants ─────────────────────────────────────────────────────────────────
const CARD_PRESETS = [10, 20, 50] as const;

const DIFFICULTIES: { key: DifficultyFilter; label: string; sub: string }[] = [
  { key: 'new',    label: 'New',    sub: "Haven't seen yet" },
  { key: 'review', label: 'Review', sub: 'Due for review'   },
  { key: 'hard',   label: 'Hard',   sub: 'Struggled with'   },
];

const LAST_DECK_KEY = 'hanziflash_last_deck';

const DEFAULT_CONFIG: SessionConfig = {
  deck: null,
  cardCount: 20,
  isCustomCount: false,
  difficulties: [],
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SessionSetupScreen() {
  const { user }                     = useAuth();
  const [config, setConfig]          = useState<SessionConfig>(DEFAULT_CONFIG);
  const [decks, setDecks]            = useState<Deck[]>([]);
  const [loadingDecks, setLoading]   = useState(true);
  const [showPicker, setShowPicker]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load decks + restore last used deck
  useEffect(() => {
    async function init() {
      const [{ data: allDecks }, { data: cardLevels }, lastDeckRaw] = await Promise.all([
        supabase.from('decks').select('*').order('hsk_level', { ascending: true }),
        supabase.from('cards').select('hsk_level'),
        AsyncStorage.getItem(LAST_DECK_KEY),
      ]);
      setLoading(false);

      if (allDecks && cardLevels) {
        const levelsWithCards = new Set(cardLevels.map(c => c.hsk_level));
        const available = allDecks.filter(d => levelsWithCards.has(d.hsk_level)) as Deck[];
        setDecks(available);

        if (lastDeckRaw) {
          try {
            const lastDeck = JSON.parse(lastDeckRaw) as Deck;
            if (available.find(d => d.id === lastDeck.id)) {
              setConfig(c => ({ ...c, deck: lastDeck }));
            } else {
              setConfig(c => ({ ...c, deck: available[0] ?? null }));
            }
          } catch {}
        } else {
          setConfig(c => ({ ...c, deck: available[0] ?? null }));
        }
      }
    }
    init();
  }, []);

  const selectDeck = (deck: Deck) => {
    setConfig(c => ({ ...c, deck }));
    AsyncStorage.setItem(LAST_DECK_KEY, JSON.stringify(deck));
  };

  const setCardCount = (count: number, isCustom = false) => {
    setConfig(c => ({ ...c, cardCount: count, isCustomCount: isCustom }));
  };

  const toggleDifficulty = (key: DifficultyFilter) => {
    setConfig(c => {
      const has = c.difficulties.includes(key);
      return {
        ...c,
        difficulties: has
          ? c.difficulties.filter(d => d !== key)
          : [...c.difficulties, key],
      };
    });
  };

  const startSession = async () => {
    await AsyncStorage.setItem(SESSION_CONFIG_KEY, JSON.stringify(config));
    await AsyncStorage.removeItem(RESUME_SESSION_KEY);
    if (user?.id) deleteResumeSession(user.id);  // fire-and-forget: clears DB resume for cross-device
    router.push('/session');
  };

  const closePicker = () => {
    setShowPicker(false);
    setSearchQuery('');
  };

  const canStart = config.deck !== null && config.cardCount > 0;

  const filteredDecks = searchQuery.trim()
    ? decks.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : decks;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Session</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Deck ────────────────────────────────────────────────────── */}
        <Section label="DECK">
          <TouchableOpacity
            style={s.deckSelector}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            {loadingDecks ? (
              <ActivityIndicator color={T.textMuted} size="small" />
            ) : config.deck ? (
              <View style={{ flex: 1 }}>
                <Text style={s.deckName}>{config.deck.name}</Text>
                <Text style={s.deckDesc} numberOfLines={1}>{config.deck.description}</Text>
              </View>
            ) : (
              <Text style={s.deckPlaceholder}>Choose a deck…</Text>
            )}
            <Text style={s.deckCaret}>↓</Text>
          </TouchableOpacity>
        </Section>

        {/* ── Session Size ─────────────────────────────────────────────── */}
        <Section label="CARDS PER SESSION">
          <SegmentedControl
            options={CARD_PRESETS.map(n => ({ label: String(n), value: n }))}
            value={config.isCustomCount ? '' : config.cardCount}
            onChange={v => {
              const n = v as number;
              setCardCount(n, n !== 10 && n !== 20 && n !== 50);
            }}
            allowCustom
            customValue={config.isCustomCount ? config.cardCount : undefined}
            onCustomChange={n => setCardCount(n, true)}
          />
        </Section>

        {/* ── Difficulty ───────────────────────────────────────────────── */}
        <Section label="DIFFICULTY">
          <View style={s.chips}>
            {DIFFICULTIES.map(({ key, label, sub }) => (
              <Chip
                key={key}
                label={label}
                sublabel={sub}
                active={config.difficulties.includes(key)}
                onPress={() => toggleDifficulty(key)}
              />
            ))}
          </View>
          {config.difficulties.length === 0 && (
            <Text style={s.diffHint}>No filter selected — all card types will be mixed</Text>
          )}
        </Section>

      </ScrollView>

      {/* ── Start button ─────────────────────────────────────────────── */}
      <View style={s.footer}>
        <Button
          label={`Start Session${config.deck ? `  ·  ${config.cardCount} cards` : ''}`}
          onPress={startSession}
          disabled={!canStart}
        />
      </View>

      {/* ── Deck picker sheet ─────────────────────────────────────────── */}
      <BottomSheetModal
        visible={showPicker}
        onClose={closePicker}
        title="Select Deck"
      >
        <View style={s.searchWrap}>
          <TextInput
            style={s.searchInput}
            placeholder="Search decks…"
            placeholderTextColor={T.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {loadingDecks ? (
          <ActivityIndicator color={T.accent} style={{ margin: 40 }} />
        ) : (
          <FlatList
            data={filteredDecks}
            keyExtractor={d => d.id}
            style={{ maxHeight: 380 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const active = config.deck?.id === item.id;
              return (
                <TouchableOpacity
                  style={[s.row, active && s.rowActive]}
                  onPress={() => { selectDeck(item); closePicker(); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowName, active && s.rowNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={s.rowDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>
                  {active && <Text style={s.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  scroll: { paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: 32 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md,
  },
  backBtn:     { width: 60 },
  backText:    { fontSize: FS.body, color: T.textMuted },
  headerTitle: { fontSize: FS.ui, color: T.textPrimary, fontWeight: '600' },

  // Deck selector
  deckSelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderWidth: 1, borderColor: T.border,
    borderRadius: 14, paddingHorizontal: space.lg, paddingVertical: 14,
  },
  deckName:        { fontSize: FS.ui, color: T.textPrimary, fontWeight: '500' },
  deckDesc:        { fontSize: FS.label, color: T.textMuted, marginTop: 2 },
  deckPlaceholder: { flex: 1, fontSize: FS.ui, color: T.textMuted },
  deckCaret:       { fontSize: FS.body, color: T.textMuted, marginLeft: space.md },

  // Difficulty chips container
  chips:    { gap: space.sm },
  diffHint: { fontSize: FS.label, color: T.textMuted, marginTop: space.sm },

  // Footer
  footer: {
    paddingHorizontal: space.xl,
    paddingBottom: Platform.OS === 'ios' ? space.xxl : space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: T.border,
  },

  // Deck picker search
  searchWrap: {
    backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border,
    borderRadius: 10, paddingHorizontal: space.md, marginBottom: space.sm,
  },
  searchInput: { color: T.textPrimary, fontSize: FS.ui, paddingVertical: 10 },

  // Deck list rows
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: T.border,
  },
  rowActive:     {},
  rowName:       { fontSize: FS.ui, color: T.textSecondary, fontWeight: '500' },
  rowNameActive: { color: T.textPrimary },
  rowDesc:       { fontSize: FS.label, color: T.textMuted, marginTop: 2 },
  checkmark:     { fontSize: FS.ui, color: T.accent, marginLeft: space.md },
});
