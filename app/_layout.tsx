import { useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
// import { NoiseOverlay } from '@/components/NoiseOverlay';
// import { Scanlines } from '@/components/Scanlines';
import { DialRoot } from 'dialkit';
import 'dialkit/styles.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&family=Noto+Serif+SC:wght@300&family=Noto+Sans+SC:wght@400&family=Ma+Shan+Zheng&family=LXGW+WenKai+TC:wght@400&display=swap';
  document.head.appendChild(link);

  const link2 = document.createElement('link');
  link2.rel = 'stylesheet';
  link2.href = 'https://fonts.cdnfonts.com/css/harmonyos-sans';
  document.head.appendChild(link2);

  const link3 = document.createElement('link');
  link3.rel = 'stylesheet';
  link3.href = 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1/style.css';
  document.head.appendChild(link3);
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
    <ErrorBoundary>
    <ThemeProvider>
      <AuthProvider>
        <RouteGuard />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="session-setup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="session"       options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="card-detail"   options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="font-picker" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="profile"       options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="settings"       options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="design-system" options={{ animation: 'fade' }} />
        </Stack>
      </AuthProvider>
      {Platform.OS === 'web' && <DialRoot />}
    </ThemeProvider>
    </ErrorBoundary>
  );
}
