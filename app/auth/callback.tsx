import { useEffect, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';

// ─── OAuth Callback ───────────────────────────────────────────────────────────
// Web only: Supabase redirects here after Google sign-in with tokens in the
// URL fragment (#access_token=...&refresh_token=...).
//
// The Supabase JS client's onAuthStateChange listener (set up in AuthContext)
// automatically detects and processes those tokens when this page mounts,
// firing a SIGNED_IN event. The RouteGuard in _layout.tsx then redirects the
// user to /(tabs)/home.
//
// On native this route is never navigated to in-app — WebBrowser.openAuthSessionAsync
// intercepts the redirect before it reaches the router and the session is set
// manually in signInWithGoogle() via supabase.auth.setSession().

export default function AuthCallback() {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Nothing to do — just render a spinner while onAuthStateChange fires.
  useEffect(() => {
    // Supabase JS processes the URL fragment automatically on mount.
    // If tokens are present, onAuthStateChange fires → RouteGuard redirects.
  }, []);

  return (
    <View style={s.root}>
      <ActivityIndicator size="large" color={colors.textSecondary} />
    </View>
  );
}

const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
