import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Session, User, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

// Required on native: completes the auth session when the browser redirects back
WebBrowser.maybeCompleteAuthSession();

// Session keys scoped to a user — cleared when a DIFFERENT user signs in
const USER_SESSION_KEYS = [
  'hanziflash_active_session',
  'hanziflash_resume_session',
  'hanziflash_session_config',
  'hanziflash_last_deck',
];
const LAST_USER_KEY = 'hanziflash_last_user_id';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  session:  Session | null;
  user:     User    | null;
  loading:  boolean;
  signIn:   (email: string, password: string) => Promise<AuthError | null>;
  signUp:   (email: string, password: string) => Promise<AuthError | null>;
  signOut:  () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthError | null>;
  signInWithGoogle: () => Promise<AuthError | null>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // On sign-in: if a different user is logging in, wipe the previous user's session data
      if (event === 'SIGNED_IN' && session?.user) {
        const lastUserId = await AsyncStorage.getItem(LAST_USER_KEY);
        if (lastUserId && lastUserId !== session.user.id) {
          await AsyncStorage.multiRemove(USER_SESSION_KEYS);
        }
        await AsyncStorage.setItem(LAST_USER_KEY, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Methods ────────────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  };

  const signUp = async (email: string, password: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect after email confirmation — update this to your app's URL
        emailRedirectTo: 'hanziflash://auth/confirm',
      },
    });
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'hanziflash://auth/reset-password',
    });
    return error;
  };

  const signInWithGoogle = async (): Promise<AuthError | null> => {
    if (Platform.OS === 'web') {
      // Web: full-page redirect — Supabase JS picks up tokens from the URL
      // fragment automatically via onAuthStateChange when /auth/callback loads.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      return error;
    }

    // Native: open an in-app browser, intercept the redirect, manually set session.
    // Linking.createURL uses the hanziflash:// scheme in production builds and
    // the exp:// scheme in Expo Go — both must be added to Supabase's redirect
    // allow-list (see Part 2 of setup docs).
    const redirectUrl = Linking.createURL('/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
    });
    if (error || !data.url) return error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type !== 'success') return null;

    // Tokens arrive in the URL fragment (#) or query string (?) depending on
    // the Supabase flow type. Parse whichever one is present.
    const fragment = result.url.includes('#')
      ? result.url.split('#')[1]
      : result.url.split('?')[1];
    const params = new URLSearchParams(fragment ?? '');
    const access_token  = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
      return setErr;
    }
    return null;
  };

  // ── Value ──────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider value={{
      session,
      user:    session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
