import { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { FS, FW, LS, MONO } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { hasActiveResumeSession, RESUME_SESSION_KEY } from '@/lib/progress';
import { fetchProfile, updateProfile } from '@/lib/profile';
import { ResponsiveShell } from '@/components/ResponsiveShell';
import { useResponsive } from '@/hooks/useResponsive';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const s = useMemo(() => makeStyles(colors, isDesktop), [colors, isDesktop]);
  const [hasSession,   setHasSession]   = useState(false);
  const [displayName,  setDisplayName]  = useState<string | null>(null);
  const [nameLoaded,   setNameLoaded]   = useState(false);

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
      setNameLoaded(true);
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
      <ResponsiveShell maxWidth={isDesktop ? 640 : 520} align="start">
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.logoHanzi}>漢字</Text>
            <Text style={s.logoLabel}>MANDARINE</Text>
          </View>
          {!isDesktop && (
            <Avatar
              initials={(
                user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ??
                user?.email?.[0] ?? '?'
              ).toUpperCase()}
              size={36}
              onPress={() => router.push('/profile')}
            />
          )}
        </View>

        {/* Greeting — hidden until profile name is loaded to prevent flash */}
        {nameLoaded && (
          <View style={s.greet}>
            <Text style={s.greetTitle}>Hello, {name}.</Text>
            <Text style={s.greetSub}>What would you like to do?</Text>
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
          <Card
            icon="开"
            title="New session"
            subtitle="Start a fresh round of flashcards"
            variant="primary"
            onPress={startNew}
            style={isDesktop && s.cardHalf}
          />
          <Card
            icon="续"
            title="Resume session"
            subtitle={hasSession ? 'Continue where you left off' : 'No session in progress'}
            variant="secondary"
            onPress={resumeSession}
            disabled={!hasSession}
            style={isDesktop && s.cardHalf}
          />
          <Card
            icon="+"
            title="Import cards"
            subtitle="From YouTube or a photo"
            variant="secondary"
            onPress={() => {}}
            disabled
            style={isDesktop && s.cardHalf}
          />
        </View>
      </ResponsiveShell>
    </SafeAreaView>
  );
}

const makeStyles = (t: ColorTheme, isDesktop: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: space.xxl, paddingTop: space.xxl, paddingBottom: space.sm,
  },
  logoHanzi:   { fontSize: FS.pinyin, color: t.inkRed, fontWeight: FW.medium },
  logoLabel:   { fontFamily: MONO, fontSize: FS.label, color: t.textFaint, marginTop: 2, letterSpacing: 4, textTransform: 'uppercase' },

  greet:      { paddingHorizontal: space.xxl, paddingTop: space.giant, paddingBottom: 40 },
  greetTitle: { fontFamily: MONO, fontSize: FS.formTitle, color: t.textPrimary, fontWeight: FW.medium, marginBottom: 6, letterSpacing: LS.tighter * FS.formTitle },
  greetSub:   { fontFamily: MONO, fontSize: FS.body, color: t.textSecondary },

  actions: {
    paddingHorizontal: space.xl,
    gap: space.md,
    ...(isDesktop ? {
      flexDirection: 'row',
      flexWrap: 'wrap',
    } : {}),
  },
  cardHalf: {
    flexBasis: '48%',
    flexGrow: 0,
  },
});
