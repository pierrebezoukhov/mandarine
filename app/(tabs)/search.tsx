import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { MONO, FS, FW, LS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Icon } from '@/theme/icons';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { SearchField } from '@/components/SearchField';
import { SearchResultRow, MasteryLevel } from '@/components/SearchResultRow';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import {
  searchCards,
  SearchResult,
  getRecentSearches,
  addRecentSearch,
} from '@/lib/search';

const HSK_LEVELS = [1, 2, 3, 4, 5, 6];
const DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeHskLevels, setActiveHskLevels] = useState<number[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hskLevelsRef = useRef(activeHskLevels);
  hskLevelsRef.current = activeHskLevels;

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Load recent searches on focus
  useFocusEffect(
    useCallback(() => {
      getRecentSearches().then(setRecentSearches);
    }, [])
  );

  const doSearch = useCallback(async (q: string, levels: number[]) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchCards(trimmed, levels, user?.id);
      setResults(data);
      setHasSearched(true);
      await addRecentSearch(trimmed);
      setRecentSearches(await getRecentSearches());
    } catch {
      setResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleQueryChange = useCallback((v: string) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(v, hskLevelsRef.current);
    }, DEBOUNCE_MS);
  }, [doSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  }, []);

  const toggleHskLevel = useCallback((level: number) => {
    setActiveHskLevels(prev => {
      const next = prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level];
      // Re-search with new filters
      if (query.trim()) {
        doSearch(query, next);
      }
      return next;
    });
  }, [query, doSearch]);

  const handleRecentPress = useCallback((q: string) => {
    setQuery(q);
    doSearch(q, activeHskLevels);
  }, [doSearch, activeHskLevels]);

  const handleResultPress = useCallback((cardId: string) => {
    router.push({ pathname: '/card-detail', params: { id: cardId } });
  }, []);

  const renderResult = useCallback(({ item }: { item: SearchResult }) => (
    <SearchResultRow
      hanzi={item.hanzi}
      pinyin={item.pinyin}
      meaning={item.meaning}
      hskLevel={item.hsk_level}
      mastery={item.mastery as MasteryLevel | undefined}
      onPress={() => handleResultPress(item.id)}
    />
  ), [handleResultPress]);

  const showEmpty = !hasSearched && !query.trim();
  const showNoResults = hasSearched && results.length === 0 && !loading;

  return (
    <SafeAreaView style={s.root}>
      <ResponsiveShell maxWidth={720} align="start">
        <View style={s.searchHeader}>
          <SearchField
            value={query}
            onChange={handleQueryChange}
            onClear={handleClear}
            onSubmit={() => doSearch(query, activeHskLevels)}
            autoFocus
          />

          {/* HSK filter chips */}
          <View style={s.chips}>
            {HSK_LEVELS.map(level => (
              <Chip
                key={level}
                label={`HSK ${level}`}
                active={activeHskLevels.includes(level)}
                onPress={() => toggleHskLevel(level)}
                style={s.chip}
              />
            ))}
          </View>
        </View>

        {/* Recent searches (empty state) */}
        {showEmpty && recentSearches.length > 0 && (
          <View style={s.recents}>
            <Text style={s.recentsLabel}>RECENT SEARCHES</Text>
            {recentSearches.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={s.recentRow}
                onPress={() => handleRecentPress(q)}
              >
                <Text style={s.recentDot}>{Icon.separator}</Text>
                <Text style={s.recentText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {showEmpty && recentSearches.length === 0 && (
          <EmptyState
            icon={Icon.search}
            title="Search your cards"
            subtitle="Type hanzi, pinyin, or English to find cards"
          />
        )}

        {/* No results */}
        {showNoResults && (
          <EmptyState
            icon={Icon.close}
            title={`No cards match "${query.trim()}"`}
            subtitle="Try a different query or adjust your HSK filters"
          />
        )}

        {/* Results list */}
        {results.length > 0 && (
          <FlatList
            data={results}
            renderItem={renderResult}
            keyExtractor={item => item.id}
            style={s.list}
          />
        )}
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },

  searchHeader: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    gap: space.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },

  recents: {
    paddingHorizontal: space.xl,
    paddingTop: space.xxl,
  },
  recentsLabel: {
    fontFamily: MONO,
    fontSize: FS.label,
    fontWeight: FW.medium,
    color: t.textFaint,
    letterSpacing: LS.widest * FS.label,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.sm,
  },
  recentDot: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textFaint,
  },
  recentText: {
    fontFamily: MONO,
    fontSize: FS.body,
    color: t.textSecondary,
    letterSpacing: LS.wide * FS.body,
  },

  list: {
    flex: 1,
    marginTop: space.md,
  },
});
