import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { auth, isAdminUser, useAuthUser } from './adminFirebase';
import { markAsOwner } from '../lib/publicApi';
import './admin.css';

const errorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Wrong email or password, or this account has not been created yet in Firebase Authentication.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account uses that email address.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/network-request-failed': 'Network problem. Check your connection and try again.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not switched on yet in Firebase Authentication.',
  'auth/configuration-not-found': 'Authentication is not set up yet. In the Firebase console open Authentication and click Get started.',
  'auth/unauthorized-domain': 'This website address is not authorised in Firebase Authentication.'
};

const features = [
  'Visitors, locations and page views',
  'Messages from your contact form',
  'Edit projects, services and content',
  'SEO settings that Google can read'
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, ready } = useAuthUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    document.title = 'Admin sign in | Steven Imanzi';
  }, []);

  // Already signed in as the owner: go straight to the dashboard.
  useEffect(() => {
    if (ready && isAdminUser(user)) navigate('/admin', { replace: true });
  }, [ready, user, navigate]);

  const finish = async (signedIn: User) => {
    if (!isAdminUser(signedIn)) {
      await signOut(auth);
      setError('This account is not allowed to open the admin area.');
      return;
    }
    markAsOwner();
    navigate('/admin', { replace: true });
  };

  const fail = (err: unknown) => {
    const code = (err as { code?: string })?.code ?? '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
    setError(errorMessages[code] ?? 'Could not sign in. Please try again.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');

    const trimmedEmail = email.trim();

    // 1. First attempt MySQL backend authentication
    try {
      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('sm_admin_token', data.token);
          localStorage.setItem('sm_admin_user', JSON.stringify(data.user));
          markAsOwner();
          navigate('/admin', { replace: true });
          return;
        }
      }
    } catch {
      // Backend API offline or fetch failed: fall through to Firebase
    }

    // 2. Fall back to Firebase Authentication
    try {
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      await finish(result.user);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await finish(result.user);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Type your email address above first, then click “Forgot password?”.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('If that address has an account, a password reset link is on its way. Check your inbox and spam folder.');
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <aside className="adm-login-side">
        <div className="adm-brand">
          <span className="adm-logo" aria-hidden="true">SI</span>
          <div>
            <strong>Steven Imanzi</strong>
            <small>Website admin</small>
          </div>
        </div>
        <div>
          <h2>Everything about your website, in one place.</h2>
          <ul className="adm-login-features">
            {features.map(text => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
        <small className="adm-muted">© {new Date().getFullYear()} Steven Imanzi</small>
      </aside>

      <main className="adm-login-main">
        <form className="adm-login-card" onSubmit={handleSubmit} noValidate>
          <h1>Sign in</h1>
          <p className="adm-login-sub">Welcome back. Enter your details to open the dashboard.</p>

          {error && (
            <div className="adm-login-error" role="alert">
              {error}
            </div>
          )}

          {info && (
            <div className="adm-login-info" role="status">
              {info}
            </div>
          )}

          <label className="adm-field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={busy}
            />
          </label>

          <label className="adm-field">
            <span className="adm-field-row">
              <span>Password</span>
              <button type="button" className="adm-text-link" onClick={handleReset} tabIndex={-1}>
                Forgot password?
              </button>
            </span>
            <span className="adm-pass-wrap">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={busy}
              />
              <button
                type="button"
                className="adm-icon-btn adm-pass-toggle"
                onClick={() => setShow(s => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {show ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
              </button>
            </span>
          </label>

          <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="adm-login-sep" aria-hidden="true">
            <span>or</span>
          </div>

          <button
            type="button"
            className="adm-btn adm-btn-secondary adm-btn-block"
            onClick={handleGoogle}
            disabled={busy}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="adm-google-icon">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
              />
            </svg>
            Sign in with Google
          </button>

          <p className="adm-login-foot">
            <Link to="/">Back to the website</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
