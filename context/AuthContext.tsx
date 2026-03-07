import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'hanziflash://auth/callback',
      },
    });
    return error;
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
