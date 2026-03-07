import { useState, useEffect, useRef } from "react";

const TOKENS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500&family=Lora:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
  :root {
    --bg:           #131109;
    --bg-warm:      #1a1710;
    --surface:      #1e1b12;
    --surface-2:    #252118;
    --border:       rgba(255,248,220,0.08);
    --border-focus: rgba(255,248,220,0.22);
    --text-primary: #F0EBE0;
    --text-secondary:#A09880;
    --text-muted:   #5C5646;
    --accent:       #C0392B;
    --font-hanzi:   'Noto Sans SC', sans-serif;
    --font-serif:   'Lora', serif;
    --font-ui:      'DM Sans', sans-serif;
    --font-mono:    'DM Mono', monospace;
    --r-sm: 8px; --r-md: 12px; --r-pill: 100px;
  }
`;

const GLOBAL = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: var(--bg); }
  body { font-family: var(--font-ui); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
`;

const CSS = `
.auth-root {
  display: flex; flex-direction: column;
  min-height: 100dvh; max-width: 430px; margin: 0 auto;
  padding: 0 28px 40px;
  background: var(--bg);
  background-image: radial-gradient(ellipse 100% 50% at 50% 0%, #221e10 0%, var(--bg) 65%);
  position: relative; overflow: hidden;
}

/* Decorative background hanzi */
.auth-bg-hanzi {
  position: absolute; top: -20px; right: -24px;
  font-family: var(--font-hanzi); font-size: 220px; font-weight: 500;
  color: rgba(255,248,220,0.025); line-height: 1;
  pointer-events: none; user-select: none;
  letter-spacing: -0.02em;
}

/* Logo mark */
.auth-logo {
  padding-top: 64px; margin-bottom: 48px;
  animation: fadeUp 0.5s 0.1s both;
}
.auth-logo-hanzi {
  font-family: var(--font-hanzi); font-size: 32px; font-weight: 500;
  color: var(--text-primary); letter-spacing: 0.04em; display: block;
  margin-bottom: 4px;
}
.auth-logo-label {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--text-muted); letter-spacing: 0.14em;
}

/* Heading */
.auth-heading {
  font-family: var(--font-serif); font-style: italic;
  font-size: 26px; font-weight: 400;
  color: var(--text-primary); margin-bottom: 8px;
  animation: fadeUp 0.5s 0.15s both;
}
.auth-sub {
  font-size: 14px; color: var(--text-muted);
  margin-bottom: 36px; line-height: 1.5;
  animation: fadeUp 0.5s 0.2s both;
}

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 14px; animation: fadeUp 0.5s 0.25s both; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase;
}
.field-input {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); padding: 14px 16px;
  color: var(--text-primary); font-family: var(--font-ui);
  font-size: 15px; outline: none; width: 100%;
  transition: border-color 0.2s, background 0.2s;
  -webkit-appearance: none;
}
.field-input::placeholder { color: var(--text-muted); }
.field-input:focus {
  border-color: var(--border-focus);
  background: var(--surface-2);
}
.field-input.error { border-color: rgba(224,82,82,0.5); animation: shake 0.35s ease; }

.field-error {
  font-size: 11px; color: #E05252;
  font-family: var(--font-mono); letter-spacing: 0.04em;
}

/* Primary CTA */
.auth-cta {
  margin-top: 8px; padding: 15px;
  background: var(--accent); border: none; border-radius: var(--r-pill);
  color: #fff; font-family: var(--font-ui); font-size: 15px; font-weight: 500;
  cursor: pointer; letter-spacing: 0.01em;
  transition: opacity 0.15s, transform 0.1s;
}
.auth-cta:hover  { opacity: 0.88; }
.auth-cta:active { transform: scale(0.98); }
.auth-cta:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Divider */
.auth-divider {
  display: flex; align-items: center; gap: 12px; margin: 20px 0;
}
.auth-divider-line { flex: 1; height: 1px; background: var(--border); }
.auth-divider-text {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text-muted); letter-spacing: 0.1em;
}

/* OAuth buttons */
.oauth-row { display: flex; gap: 10px; }
.oauth-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 8px; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-md); cursor: pointer; color: var(--text-secondary);
  font-family: var(--font-ui); font-size: 13px; font-weight: 500;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.oauth-btn:hover { border-color: var(--border-focus); background: var(--surface-2); color: var(--text-primary); }
.oauth-btn svg { flex-shrink: 0; }

/* Footer link */
.auth-footer {
  margin-top: 32px; text-align: center;
  font-size: 13px; color: var(--text-muted);
  animation: fadeUp 0.5s 0.3s both;
}
.auth-link {
  color: var(--text-secondary); cursor: pointer; background: none; border: none;
  font-family: var(--font-ui); font-size: 13px; padding: 0;
  text-decoration: underline; text-decoration-color: rgba(160,152,128,0.3);
  text-underline-offset: 3px; transition: color 0.15s;
}
.auth-link:hover { color: var(--text-primary); }

/* Forgot password link */
.forgot-link {
  align-self: flex-end; background: none; border: none; padding: 0;
  font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
  letter-spacing: 0.06em; cursor: pointer; text-decoration: underline;
  text-decoration-color: rgba(92,86,70,0.4); text-underline-offset: 3px;
  transition: color 0.15s; margin-top: -6px;
}
.forgot-link:hover { color: var(--text-secondary); }

/* Success state */
.auth-success {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; flex: 1; gap: 16px; text-align: center;
  animation: fadeUp 0.4s ease both;
}
.auth-success-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(74,158,107,0.12); border: 1px solid rgba(74,158,107,0.25);
  display: flex; align-items: center; justify-content: center; color: #4A9E6B;
}
.auth-success-title { font-family: var(--font-serif); font-style: italic; font-size: 22px; }
.auth-success-sub { font-size: 13px; color: var(--text-muted); line-height: 1.6; max-width: 260px; }

/* Tab switcher (login / sign up) */
.auth-tabs {
  display: flex; gap: 0; margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  animation: fadeUp 0.5s 0.12s both;
}
.auth-tab {
  flex: 1; background: none; border: none; padding: 12px 0;
  font-family: var(--font-ui); font-size: 14px; font-weight: 500;
  color: var(--text-muted); cursor: pointer; position: relative;
  transition: color 0.2s;
}
.auth-tab.active { color: var(--text-primary); }
.auth-tab.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
  height: 1px; background: var(--text-primary);
}
`;

/* ── Google & Apple SVG icons ── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M15.5 8.18c0-.57-.05-1.12-.14-1.64H8v3.1h4.2a3.6 3.6 0 01-1.56 2.36v1.96h2.52C14.67 12.56 15.5 10.54 15.5 8.18z" fill="#4285F4"/>
    <path d="M8 16c2.12 0 3.9-.7 5.2-1.9l-2.54-1.97A4.88 4.88 0 018 13.1c-2.05 0-3.79-1.38-4.41-3.24H.97v2.03A7.99 7.99 0 008 16z" fill="#34A853"/>
    <path d="M3.59 9.86A4.8 4.8 0 013.33 8c0-.65.11-1.28.26-1.86V4.11H.97A8 8 0 000 8c0 1.29.31 2.51.97 3.89l2.62-2.03z" fill="#FBBC05"/>
    <path d="M8 3.18c1.16 0 2.2.4 3.02 1.18l2.26-2.26A7.97 7.97 0 008 0 7.99 7.99 0 00.97 4.11L3.59 6.14C4.21 4.28 5.95 3.18 8 3.18z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="15" height="16" viewBox="0 0 15 16" fill="currentColor">
    <path d="M12.44 8.42c-.02-1.9 1.56-2.82 1.63-2.86-0.89-1.3-2.27-1.48-2.76-1.5-1.17-.12-2.3.69-2.9.69-.6 0-1.52-.67-2.5-.65C4.6 4.12 3.3 4.96 2.6 6.24c-1.43 2.48-.37 6.14 1.02 8.15.68.98 1.49 2.08 2.55 2.04 1.02-.04 1.41-.66 2.64-.66 1.23 0 1.58.66 2.65.64 1.1-.02 1.8-1 2.47-1.98.78-1.13 1.1-2.23 1.12-2.29-.02-.01-2.15-.82-2.17-3.26l-.04.04zM10.52 2.6C11.08 1.92 11.46.97 11.35 0c-.85.03-1.88.57-2.49 1.24-.54.6-1.02 1.57-.89 2.49.94.07 1.9-.47 2.55-1.13z"/>
  </svg>
);

/* ── Screens ── */
function LoginForm({ onSwitch, onForgot, onSuccess }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1200);
  };

  return (
    <>
      <div className="auth-heading">Welcome back</div>
      <div className="auth-sub">Sign in to continue your practice.</div>
      <div className="auth-form">
        <div className="field">
          <label className="field-label">Email</label>
          <input className={`field-input ${error && !email ? "error" : ""}`}
            type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        <div className="field">
          <label className="field-label">Password</label>
          <input className={`field-input ${error && !password ? "error" : ""}`}
            type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        <button className="forgot-link" onClick={onForgot}>Forgot password?</button>
        {error && <span className="field-error">{error}</span>}
        <button className="auth-cta" onClick={submit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>

      <div className="auth-divider">
        <div className="auth-divider-line"/>
        <span className="auth-divider-text">or</span>
        <div className="auth-divider-line"/>
      </div>

      <div className="oauth-row">
        <button className="oauth-btn"><GoogleIcon /> Google</button>
      </div>

      <div className="auth-footer">
        No account?{" "}
        <button className="auth-link" onClick={() => onSwitch("signup")}>Create one</button>
      </div>
    </>
  );
}

function SignupForm({ onSwitch, onSuccess }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email) { setError("Please enter your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1200);
  };

  return (
    <>
      <div className="auth-heading">Start learning</div>
      <div className="auth-sub">Create your account to track progress across devices.</div>
      <div className="auth-form">
        <div className="field">
          <label className="field-label">Email</label>
          <input className={`field-input ${error && !email ? "error" : ""}`}
            type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        <div className="field">
          <label className="field-label">Password</label>
          <input className={`field-input ${error && password.length < 8 ? "error" : ""}`}
            type="password" placeholder="Min. 8 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        {error && <span className="field-error">{error}</span>}
        <button className="auth-cta" onClick={submit} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </div>

      <div className="auth-divider">
        <div className="auth-divider-line"/>
        <span className="auth-divider-text">or</span>
        <div className="auth-divider-line"/>
      </div>

      <div className="oauth-row">
        <button className="oauth-btn"><GoogleIcon /> Google</button>
      </div>

      <div className="auth-footer">
        Already have an account?{" "}
        <button className="auth-link" onClick={() => onSwitch("login")}>Sign in</button>
      </div>
    </>
  );
}

function ForgotForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  if (sent) return (
    <div className="auth-success">
      <div className="auth-success-icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 12l6 6L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="auth-success-title">Check your inbox</div>
      <div className="auth-success-sub">We sent a reset link to <strong>{email}</strong>. It expires in 15 minutes.</div>
      <button className="auth-link" style={{marginTop:8}} onClick={onBack}>Back to sign in</button>
    </div>
  );

  return (
    <>
      <button className="auth-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>
      <div className="auth-heading">Reset password</div>
      <div className="auth-sub">Enter your email and we'll send you a link to reset your password.</div>
      <div className="auth-form">
        <div className="field">
          <label className="field-label">Email</label>
          <input className="field-input" type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
          />
        </div>
        <button className="auth-cta" onClick={submit} disabled={loading || !email}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </div>
    </>
  );
}

/* ── Root ── */
export default function AuthScreen() {
  const [screen, setScreen] = useState("login"); // login | signup | forgot | done
  const cssRef = useRef(false);

  useEffect(() => {
    if (cssRef.current) return;
    cssRef.current = true;
    const el = document.createElement("style");
    el.textContent = TOKENS + GLOBAL + CSS + EXTRA_CSS;
    document.head.appendChild(el);
  }, []);

  return (
    <div className="auth-root">
      <div className="auth-bg-hanzi">学</div>

      <div className="auth-logo">
        <span className="auth-logo-hanzi">漢字</span>
        <span className="auth-logo-label">HANZIFLASH</span>
      </div>

      {screen !== "forgot" && screen !== "done" && (
        <div className="auth-tabs">
          <button className={`auth-tab ${screen === "login" ? "active" : ""}`} onClick={() => setScreen("login")}>Sign in</button>
          <button className={`auth-tab ${screen === "signup" ? "active" : ""}`} onClick={() => setScreen("signup")}>Create account</button>
        </div>
      )}

      {screen === "login"  && <LoginForm  onSwitch={setScreen} onForgot={() => setScreen("forgot")} onSuccess={() => setScreen("done")} />}
      {screen === "signup" && <SignupForm onSwitch={setScreen} onSuccess={() => setScreen("done")} />}
      {screen === "forgot" && <ForgotForm onBack={() => setScreen("login")} />}
      {screen === "done"   && (
        <div className="auth-success" style={{flex:1}}>
          <div className="auth-success-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M3 12l6 6L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="auth-success-title">You're in</div>
          <div className="auth-success-sub">Your progress will now sync across all your devices.</div>
          <button className="auth-cta" style={{marginTop:16, maxWidth:240, width:"100%"}} onClick={() => setScreen("login")}>
            Go to home
          </button>
        </div>
      )}
    </div>
  );
}

const EXTRA_CSS = `
.auth-back {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; color: var(--text-muted);
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em;
  cursor: pointer; padding: 0; margin-bottom: 28px;
  transition: color 0.15s;
}
.auth-back:hover { color: var(--text-secondary); }
`;
