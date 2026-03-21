import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ColorTheme } from '@/theme/colors';
import { router } from 'expo-router';
import { FS, FW, LH } from '@/theme/tokens';
import { space } from '@/theme/spacing';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { ResponsiveShell } from '@/components/ResponsiveShell';


// ─── Login form ──────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onForgot }: { onSwitch: () => void; onForgot: () => void }) {
  const { signIn, signInWithGoogle } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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

      <Field label="EMAIL"    value={email}    onChange={setEmail}
        placeholder="you@example.com" hasError={!!error && !email} />
      <Field label="PASSWORD" value={password} onChange={setPassword}
        placeholder="••••••••" secureTextEntry hasError={!!error && !password}
        errorText={error || undefined} />

      <TouchableOpacity onPress={onForgot} style={s.forgotBtn}>
        <Text style={s.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button label="Sign in" onPress={submit} disabled={!email || !password} loading={loading} style={s.ctaTop} />

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Button label="Continue with Google" onPress={google} variant="secondary" />

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
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
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
      onSuccess(email);
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

      <Field label="EMAIL"    value={email}    onChange={setEmail}
        placeholder="you@example.com" hasError={!!error && !email} />
      <Field label="PASSWORD" value={password} onChange={setPassword}
        placeholder="Min. 8 characters" secureTextEntry
        hasError={!!error && password.length < 8} errorText={error || undefined} />

      <Button label="Create account" onPress={submit} disabled={!email || !password} loading={loading} style={s.ctaTop} />

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Button label="Continue with Google" onPress={google} variant="secondary" />

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
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    const err = await resetPassword(email);
    setLoading(false);
    if (err) setError(err.message);
    else     setSent(true);
  };

  if (sent) return (
    <View style={s.successWrap}>
      <View style={s.successIcon}>
        <Text style={{ color: colors.green, fontSize: FS.subheading }}>✓</Text>
      </View>
      <Text style={s.successTitle}>Check your inbox</Text>
      <Text style={s.successSub}>
        We sent a reset link to <Text style={{ color: colors.textSecondary }}>{email}</Text>.
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

      <Field label="EMAIL" value={email} onChange={setEmail}
        placeholder="you@example.com" errorText={error || undefined} />

      <Button label="Send reset link" onPress={submit} disabled={!email} loading={loading} style={s.ctaTop} />
    </>
  );
}

// ─── Email confirmation screen ───────────────────────────────────────────────
function ConfirmScreen({ email, onBack }: { email: string; onBack: () => void }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={s.successWrap}>
      <View style={s.successIcon}>
        <Text style={{ color: colors.green, fontSize: FS.subheading }}>✓</Text>
      </View>
      <Text style={s.successTitle}>Confirm your email</Text>
      <Text style={s.successSub}>
        We sent a confirmation link to{'\n'}
        <Text style={{ color: colors.textSecondary }}>{email}</Text>.
        {'\n\n'}Open the link then come back to sign in.
      </Text>
      <Text style={[s.footerLink, { marginTop: 16 }]} onPress={onBack}>Back to sign in</Text>
    </View>
  );
}

// ─── Root screen ─────────────────────────────────────────────────────────────
type Screen = 'login' | 'signup' | 'forgot' | 'confirm';

export default function AuthScreen() {
  const [screen, setScreen]           = useState<Screen>('login');
  const [signupEmail, setSignupEmail] = useState('');
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

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
        <ResponsiveShell maxWidth={520} fill={false}>
          {/* Logo */}
          <View style={s.logo}>
            <Text style={s.logoHanzi}>漢字</Text>
            <Text style={s.logoLabel}>MANDARINE</Text>
          </View>


          {screen === 'login'   && <LoginForm   onSwitch={() => setScreen('signup')} onForgot={() => setScreen('forgot')} />}
          {screen === 'signup'  && <SignupForm   onSwitch={() => setScreen('login')}  onSuccess={handleSignupSuccess} />}
          {screen === 'forgot'  && <ForgotForm   onBack={() => setScreen('login')} />}
          {screen === 'confirm' && <ConfirmScreen email={signupEmail} onBack={() => setScreen('login')} />}
        </ResponsiveShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const makeStyles = (t: ColorTheme) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: t.bg },
  scroll: { flexGrow: 1, paddingHorizontal: space.xxxl, paddingBottom: space.giant },

  logo:      { paddingTop: 72, marginBottom: space.giant },
  logoHanzi: { fontSize: FS.score, color: t.inkRed, fontWeight: FW.semibold, marginBottom: space.xs },
  logoLabel: { fontSize: FS.label, color: t.textFaint, letterSpacing: 4, textTransform: 'uppercase', marginTop: 2 },

  heading: { fontSize: FS.title, color: t.textPrimary, fontWeight: FW.semibold, marginBottom: space.xs },
  sub:     { fontSize: FS.body, color: t.textSecondary, marginBottom: space.xxxl, lineHeight: LH.body },

  ctaTop: { marginTop: space.sm },

  forgotBtn:  { alignSelf: 'flex-end', marginTop: -6, marginBottom: space.sm },
  forgotText: { fontSize: FS.label, color: t.textSecondary },

  divider:     { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: t.border },
  dividerText: { fontSize: FS.label, color: t.textFaint },

  footer:     { marginTop: space.xxxl, textAlign: 'center', fontSize: FS.body, color: t.textSecondary },
  footerLink: { color: t.inkRedText, textDecorationLine: 'underline' },

  backBtn:  { marginBottom: space.xxl },
  backText: { color: t.textSecondary, fontSize: FS.label },

  successWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.giant, gap: space.lg },
  successIcon:  { width: 56, height: 56, borderRadius: 28, backgroundColor: t.green === '#3a7a44' ? 'rgba(58,122,68,0.12)' : 'rgba(45,110,56,0.08)', borderWidth: 1, borderColor: t.green, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: FS.subheading, color: t.textPrimary },
  successSub:   { fontSize: FS.body, color: t.textSecondary, textAlign: 'center', lineHeight: LH.body, maxWidth: 260 },
});
