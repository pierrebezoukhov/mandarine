import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

// ─── Design tokens (match web prototype) ────────────────────────────────────
const T = {
  bg:          '#131109',
  surface:     '#1e1b12',
  surface2:    '#252118',
  border:      'rgba(255,248,220,0.08)',
  borderFocus: 'rgba(255,248,220,0.22)',
  textPrimary: '#F0EBE0',
  textSecondary:'#A09880',
  textMuted:   '#5C5646',
  accent:      '#C0392B',
  error:       '#E05252',
  success:     '#4A9E6B',
};

// ─── Shared field component ──────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, secureTextEntry = false, hasError = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean; hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        style={[s.fieldInput, focused && s.fieldInputFocused, hasError && s.fieldInputError]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={T.textMuted}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

// ─── Login form ──────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email)    { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) {
      // Supabase returns generic messages — map to friendly ones
      if (err.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in.');
      } else {
        setError(err.message);
      }
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const google = async () => {
    const err = await signInWithGoogle();
    if (err) setError(err.message);
  };

  return (
    <>
      <Text style={s.heading}>Welcome back</Text>
      <Text style={s.sub}>Sign in to continue your practice.</Text>

      <Field label="EMAIL" value={email} onChange={setEmail}
        placeholder="you@example.com" hasError={!!error && !email} />
      <Field label="PASSWORD" value={password} onChange={setPassword}
        placeholder="••••••••" secureTextEntry hasError={!!error && !password} />

      <TouchableOpacity onPress={onForgot} style={s.forgotBtn}>
        <Text style={s.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {!!error && <Text style={s.errorText}>{error}</Text>}

      <TouchableOpacity style={[s.cta, loading && s.ctaDisabled]} onPress={submit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.ctaText}>Sign in</Text>}
      </TouchableOpacity>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <TouchableOpacity style={s.oauthBtn} onPress={google}>
        <Text style={s.oauthText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={s.footer}>
        No account?{' '}
        <Text style={s.footerLink} onPress={onSwitch}>Create one</Text>
      </Text>
    </>
  );
}

// ─── Signup form ─────────────────────────────────────────────────────────────
function SignupForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: (email: string) => void }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email)              { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    const err = await signUp(email, password);
    setLoading(false);
    if (err) {
      if (err.message.includes('already registered')) {
        setError('An account with this email already exists.');
      } else {
        setError(err.message);
      }
    } else {
      onSuccess(email); // show confirmation screen
    }
  };

  const google = async () => {
    const err = await signInWithGoogle();
    if (err) setError(err.message);
  };

  return (
    <>
      <Text style={s.heading}>Start learning</Text>
      <Text style={s.sub}>Create your account to track progress across devices.</Text>

      <Field label="EMAIL" value={email} onChange={setEmail}
        placeholder="you@example.com" hasError={!!error && !email} />
      <Field label="PASSWORD" value={password} onChange={setPassword}
        placeholder="Min. 8 characters" secureTextEntry
        hasError={!!error && password.length < 8} />

      {!!error && <Text style={s.errorText}>{error}</Text>}

      <TouchableOpacity style={[s.cta, loading && s.ctaDisabled]} onPress={submit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.ctaText}>Create account</Text>}
      </TouchableOpacity>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <TouchableOpacity style={s.oauthBtn} onPress={google}>
        <Text style={s.oauthText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={s.footer}>
        Already have an account?{' '}
        <Text style={s.footerLink} onPress={onSwitch}>Sign in</Text>
      </Text>
    </>
  );
}

// ─── Forgot password form ────────────────────────────────────────────────────
function ForgotForm({ onBack }: { onBack: () => void }) {
  const { resetPassword } = useAuth();
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    const err = await resetPassword(email);
    setLoading(false);
    if (err) { setError(err.message); }
    else { setSent(true); }
  };

  if (sent) return (
    <View style={s.successWrap}>
      <View style={s.successIcon}>
        <Text style={{ color: T.success, fontSize: 22 }}>✓</Text>
      </View>
      <Text style={s.successTitle}>Check your inbox</Text>
      <Text style={s.successSub}>
        We sent a reset link to <Text style={{ color: T.textSecondary }}>{email}</Text>.
        {'\n'}It expires in 15 minutes.
      </Text>
      <Text style={[s.footerLink, { marginTop: 16 }]} onPress={onBack}>Back to sign in</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.heading}>Reset password</Text>
      <Text style={s.sub}>Enter your email and we'll send you a reset link.</Text>

      <Field label="EMAIL" value={email} onChange={setEmail} placeholder="you@example.com" />
      {!!error && <Text style={s.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[s.cta, (loading || !email) && s.ctaDisabled]}
        onPress={submit} disabled={loading || !email}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.ctaText}>Send reset link</Text>}
      </TouchableOpacity>
    </>
  );
}

// ─── Email confirmation screen ───────────────────────────────────────────────
function ConfirmScreen({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <View style={s.successWrap}>
      <View style={s.successIcon}>
        <Text style={{ color: T.success, fontSize: 22 }}>✓</Text>
      </View>
      <Text style={s.successTitle}>Confirm your email</Text>
      <Text style={s.successSub}>
        We sent a confirmation link to{'\n'}
        <Text style={{ color: T.textSecondary }}>{email}</Text>.
        {'\n\n'}Open the link then come back to sign in.
      </Text>
      <Text style={[s.footerLink, { marginTop: 16 }]} onPress={onBack}>Back to sign in</Text>
    </View>
  );
}

// ─── Root screen ─────────────────────────────────────────────────────────────
type Screen = 'login' | 'signup' | 'forgot' | 'confirm';

export default function AuthScreen() {
  const [screen, setScreen]         = useState<Screen>('login');
  const [signupEmail, setSignupEmail] = useState('');

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setScreen('confirm');
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={s.logo}>
          <Text style={s.logoHanzi}>漢字</Text>
          <Text style={s.logoLabel}>HANZIFLASH</Text>
        </View>

        {/* Tab switcher — hidden on forgot / confirm */}
        {screen !== 'forgot' && screen !== 'confirm' && (
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, screen === 'login' && s.tabActive]}
              onPress={() => setScreen('login')}
            >
              <Text style={[s.tabText, screen === 'login' && s.tabTextActive]}>Sign in</Text>
              {screen === 'login' && <View style={s.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, screen === 'signup' && s.tabActive]}
              onPress={() => setScreen('signup')}
            >
              <Text style={[s.tabText, screen === 'signup' && s.tabTextActive]}>Create account</Text>
              {screen === 'signup' && <View style={s.tabUnderline} />}
            </TouchableOpacity>
          </View>
        )}

        {screen === 'login'   && <LoginForm  onSwitch={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
        {screen === 'signup'  && <SignupForm onSwitch={() => setScreen('login')}  onSuccess={handleSignupSuccess} />}
        {screen === 'forgot'  && <ForgotForm onBack={() => setScreen('login')} />}
        {screen === 'confirm' && <ConfirmScreen email={signupEmail} onBack={() => setScreen('login')} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 48 },

  logo:      { paddingTop: 72, marginBottom: 48 },
  logoHanzi: { fontSize: 32, color: T.textPrimary, letterSpacing: 2, marginBottom: 4 },
  logoLabel: { fontSize: 11, color: T.textMuted, letterSpacing: 6 },

  tabs:         { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border, marginBottom: 32 },
  tab:          { flex: 1, paddingVertical: 12, alignItems: 'center', position: 'relative' },
  tabActive:    {},
  tabText:      { fontSize: 14, fontWeight: '500', color: T.textMuted },
  tabTextActive:{ color: T.textPrimary },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 1, backgroundColor: T.textPrimary },

  heading: { fontSize: 26, color: T.textPrimary, marginBottom: 8, fontStyle: 'italic' },
  sub:     { fontSize: 14, color: T.textMuted, marginBottom: 28, lineHeight: 21 },

  fieldWrap:       { marginBottom: 14 },
  fieldLabel:      { fontSize: 10, color: T.textMuted, letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  fieldInput:      { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, color: T.textPrimary, fontSize: 15 },
  fieldInputFocused:{ borderColor: T.borderFocus, backgroundColor: T.surface2 },
  fieldInputError: { borderColor: 'rgba(224,82,82,0.5)' },

  errorText: { fontSize: 11, color: T.error, letterSpacing: 0.5, marginBottom: 8, marginTop: -6 },

  cta:        { backgroundColor: T.accent, borderRadius: 100, padding: 15, alignItems: 'center', marginTop: 8 },
  ctaDisabled:{ opacity: 0.4 },
  ctaText:    { color: '#fff', fontSize: 15, fontWeight: '500' },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: -6, marginBottom: 8 },
  forgotText: { fontSize: 10, color: T.textMuted, letterSpacing: 1 },

  divider:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: T.border },
  dividerText: { fontSize: 10, color: T.textMuted, letterSpacing: 2 },

  oauthBtn:  { borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 13, alignItems: 'center', backgroundColor: T.surface },
  oauthText: { color: T.textSecondary, fontSize: 13, fontWeight: '500' },

  footer:     { marginTop: 28, textAlign: 'center', fontSize: 13, color: T.textMuted },
  footerLink: { color: T.textSecondary, textDecorationLine: 'underline' },

  backBtn:  { marginBottom: 24 },
  backText: { color: T.textMuted, fontSize: 11, letterSpacing: 1 },

  successWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 16 },
  successIcon:  { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(74,158,107,0.12)', borderWidth: 1, borderColor: 'rgba(74,158,107,0.25)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, color: T.textPrimary, fontStyle: 'italic' },
  successSub:   { fontSize: 13, color: T.textMuted, textAlign: 'center', lineHeight: 21, maxWidth: 260 },
});
