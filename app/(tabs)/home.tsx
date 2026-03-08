import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { T, FS } from '@/theme/tokens';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { hasActiveResumeSession, RESUME_SESSION_KEY } from '@/lib/progress';
import { fetchProfile, updateProfile } from '@/lib/profile';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const [hasSession,   setHasSession]   = useState(false);
  const [displayName,  setDisplayName]  = useState<string | null>(null);

  // Fetch profile once; seed display_name from OAuth metadata if not set yet
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then(p => {
      if (p?.display_name) {
        setDisplayName(p.display_name);
      } else {
        const fallback = user.user_metadata?.full_name ?? null;
        setDisplayName(fallback);
        if (fallback) {
          updateProfile(user.id, { display_name: fallback });
        }
      }
    });
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      async function checkSession() {
        const asyncRaw = await AsyncStorage.getItem(RESUME_SESSION_KEY);
        const has = await hasActiveResumeSession(user?.id ?? null, asyncRaw);
        setHasSession(has);
      }
      checkSession();
    }, [user?.id])
  );

  const startNew = async () => {
    await AsyncStorage.removeItem(RESUME_SESSION_KEY);
    router.push('/session-setup');
  };

  const resumeSession = () => {
    router.push('/session?resume=true');
  };

  const name = displayName?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there';

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.logoHanzi}>漢字</Text>
          <Text style={s.logoLabel}>HANZIFLASH</Text>
        </View>
        <Avatar
          initials={(
            user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ??
            user?.email?.[0] ?? '?'
          ).toUpperCase()}
          size={36}
          onPress={() => router.push('/profile')}
        />
      </View>

      {/* Greeting */}
      <View style={s.greet}>
        <Text style={s.greetTitle}>Hello, {name}.</Text>
        <Text style={s.greetSub}>What would you like to do?</Text>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <Card
          icon="开"
          title="New session"
          subtitle="Start a fresh round of flashcards"
          variant="primary"
          onPress={startNew}
        />
        <Card
          icon="续"
          title="Resume session"
          subtitle={hasSession ? 'Continue where you left off' : 'No session in progress'}
          variant="secondary"
          onPress={resumeSession}
          disabled={!hasSession}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 28, paddingTop: 24, paddingBottom: 8,
  },
  logoHanzi:   { fontSize: FS.heading, color: T.textPrimary, letterSpacing: 2 },
  logoLabel:   { fontSize: FS.micro, color: T.textMuted, letterSpacing: 6, marginTop: 2 },

  greet:      { paddingHorizontal: 28, paddingTop: 48, paddingBottom: 40 },
  greetTitle: { fontSize: FS.display, color: T.textPrimary, fontStyle: 'italic', marginBottom: 6 },
  greetSub:   { fontSize: FS.body, color: T.textMuted, letterSpacing: 0.5 },

  actions: { paddingHorizontal: 20, gap: 12 },
});
