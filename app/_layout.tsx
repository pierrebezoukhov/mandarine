import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  IBMPlexMono_400Regular,
} from '@expo-google-fonts/ibm-plex-mono/400Regular';
import {
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono/500Medium';

SplashScreen.preventAutoHideAsync();

// On web, load Noto Serif SC from Google Fonts CDN (dynamic subsetting, no 24MB bundle)
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@300&display=swap';
  document.head.appendChild(link);
}

function RouteGuard() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup    = segments[0] === 'auth';
    const inDesignSystem = segments[0] === 'design-system';

    if (inDesignSystem) return; // public — no auth required

    if (!session && !inAuthGroup) {
      router.replace('/auth');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [session, loading, segments]);

  return null;
}

export default function RootLayout() {
  // On native, load fonts from bundled assets. On web, Noto Serif SC comes from Google Fonts CDN.
  const fontMap: Record<string, any> = {
    'IBMPlexMono-Regular': IBMPlexMono_400Regular,
    'IBMPlexMono-Medium': IBMPlexMono_500Medium,
  };
  if (Platform.OS !== 'web') {
    fontMap['NotoSerifSC-Light'] = require('../assets/fonts/NotoSerifSC-Light.otf');
  }

  const [fontsLoaded] = useFonts(fontMap);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RouteGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="session-setup" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="session"       options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="profile"       options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings"       options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="design-system" options={{ animation: 'fade' }} />
      </Stack>
    </AuthProvider>
  );
}
