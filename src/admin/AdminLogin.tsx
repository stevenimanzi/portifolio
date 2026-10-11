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
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
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
          <h1>Welcome back</h1>
          <p className="adm-muted">Sign in to manage your website. Only the site owner can enter.</p>

          <label className="adm-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="adm-field">
            <span>Password</span>
            <div className="adm-passwrap">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          <button type="button" className="adm-textbtn" onClick={handleReset} disabled={busy}>Forgot password?</button>

          {error && <div className="adm-error" role="alert">{error}</div>}
          {info && <div className="adm-success" role="status">{info}</div>}

          <button type="submit" className="btn-neon adm-full" disabled={busy || !email || !password}>
            {busy ? 'Please wait…' : 'Sign in'}
          </button>

          <div className="adm-divider"><span>or</span></div>

          <button type="button" className="btn-neon-outline adm-full" onClick={handleGoogle} disabled={busy}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.33z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continue with Google
          </button>

          <Link to="/" className="adm-back">← Back to website</Link>
        </form>
      </main>
    </div>
  );
}
