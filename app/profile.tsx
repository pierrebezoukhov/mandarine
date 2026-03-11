import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { T, MONO, FS } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Avatar } from '@/components/Avatar';
import { StatCard } from '@/components/StatCard';
import { Section } from '@/components/Section';
import { ProgressBar } from '@/components/ProgressBar';
import {
  fetchProfile, fetchProgressStats, fetchRecentSessions,
  uploadAvatar, updateProfile,
  type Profile, type ProgressStats, type SessionSummary,
} from '@/lib/profile';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 7)  return `${diff}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user } = useAuth();

  const [profile,   setProfile]   = useState<Profile | null>(null);
  const [stats,     setStats]     = useState<ProgressStats | null>(null);
  const [sessions,  setSessions]  = useState<SessionSummary[]>([]);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchProfile(user.id),
      fetchProgressStats(user.id),
      fetchRecentSessions(user.id),
    ]).then(([p, s, r]) => {
      setProfile(p);
      setAvatarUri(p?.avatar_url ?? null);
      setStats(s);
      setSessions(r);
      setLoading(false);
    });
  }, [user?.id]);

  const pickAvatar = async () => {
    if (!user) return;
    try {
      // Dynamic import so the app doesn't crash if packages aren't installed yet
      const ImagePicker     = await import('expo-image-picker');
      const ImageManipulator = await import('expo-image-manipulator');

      if (Platform.OS !== 'web') {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (result.canceled) return;

      const originalUri = result.assets[0].uri;
      setAvatarUri(originalUri); // optimistic
      setUploading(true);

      const compressed = await ImageManipulator.manipulateAsync(
        originalUri,
        [{ resize: { width: 1080 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );

      const url = await uploadAvatar(user.id, compressed.uri);
      if (url) {
        setAvatarUri(url);
        await updateProfile(user.id, { avatar_url: url });
      }
    } catch (e) {
      console.warn('[profile] pickAvatar:', e);
    } finally {
      setUploading(false);
    }
  };

  const initials = (
    user?.user_metadata?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2) ??
    (user?.email?.[0] ?? '?')
  ).toUpperCase();

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={T.accent} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const hskLevels = [1, 2, 3, 4, 5, 6];
  const hasHskData = stats && Object.keys(stats.byHskLevel).length > 0;

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} style={s.headerBtn}>
          <Text style={s.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <View style={s.avatarContainer}>
            <Avatar
              uri={avatarUri}
              initials={initials}
              size={96}
              onPress={pickAvatar}
            />
            {uploading
              ? <ActivityIndicator size="small" color={T.textMuted} style={s.editBadge} />
              : <View style={s.editBadge} pointerEvents="none">
                  <Text style={s.editIcon}>✎</Text>
                </View>
            }
          </View>
        </View>

        {/* Global stats */}
        <Section label="GLOBAL PROGRESS">
          <View style={s.grid}>
            <StatCard
              label="Sessions"
              value={stats?.totalSessions ?? 0}
              style={s.cell}
            />
            <StatCard
              label="Cards seen"
              value={stats?.totalCards ?? 0}
              style={s.cell}
            />
          </View>
          <View style={[s.grid, s.gridGap]}>
            <StatCard
              label="Guessed"
              value={stats?.totalGot ?? 0}
              style={s.cell}
            />
            <StatCard
              label="Mastered"
              value={stats?.uniqueCardsMastered ?? 0}
              style={s.cell}
            />
          </View>
          <StatCard
            label="Avg/session"
            value={stats ? pct(stats.avgSessionSuccessRate) : '—'}
            style={s.gridGap}
          />
        </Section>

        {/* HSK breakdown */}
        {hasHskData && (
          <Section label="BY HSK LEVEL">
            {hskLevels.map(level => {
              const data = stats!.byHskLevel[level];
              if (!data) return null;
              return (
                <View key={level} style={s.hskRow}>
                  <Text style={s.hskLabel}>HSK {level}</Text>
                  <ProgressBar
                    current={data.got}
                    total={data.seen}
                    style={{ flex: 1 }}
                  />
                </View>
              );
            })}
          </Section>
        )}

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <Section label="RECENT SESSIONS">
            {sessions.map((session, i) => {
              const denom = session.unique_cards ?? session.card_count;
              const rate = denom > 0
                ? pct(session.got_count / denom)
                : '—';
              return (
                <View
                  key={session.id ?? i}
                  style={[s.sessionRow, i < sessions.length - 1 && s.sessionDivider]}
                >
                  <Text style={s.sessionDeck} numberOfLines={1}>
                    {session.deck_name ?? 'Session'}
                  </Text>
                  <Text style={s.sessionMeta}>
                    {session.unique_cards ?? session.card_count} cards · {rate} · {relativeDate(session.completed_at)}
                  </Text>
                </View>
              );
            })}
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  headerBtn:   { paddingVertical: 6, paddingHorizontal: 2, minWidth: 60 },
  backText:    { fontSize: FS.body, color: T.textSecondary },
  title:       { fontSize: FS.ui, color: T.textPrimary, fontWeight: '600' },
  settingsIcon: { fontSize: FS.heading, textAlign: 'right' },

  scroll: { paddingHorizontal: space.xl, paddingBottom: space.giant },

  avatarWrap:      { alignItems: 'center', paddingVertical: space.xxxl },
  avatarContainer: { position: 'relative' },
  editBadge: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: T.surface2,
    borderWidth:     1,
    borderColor:     T.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  editIcon: { fontSize: 11, color: T.textSecondary, lineHeight: 14 },

  grid:    { flexDirection: 'row', gap: 10 },
  gridGap: { marginTop: 10 },
  cell:    { flex: 1 },

  hskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: 14,
  },
  hskLabel: {
    fontSize: FS.label,
    color: T.textMuted,
    fontFamily: MONO,
    width: 44,
  },

  sessionRow: { paddingVertical: space.md },
  sessionDivider: { borderBottomWidth: 1, borderBottomColor: T.border },
  sessionDeck: { fontSize: FS.body, color: T.textPrimary, marginBottom: space.xs },
  sessionMeta: { fontSize: FS.label, color: T.textMuted, fontFamily: MONO },
});
