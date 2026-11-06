import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { auth, isAdminUser, useAuthUser } from './adminFirebase';
import { markAsOwner } from '../lib/publicApi';
import './admin.css';

const errorMessages: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This administrator account has been disabled.',
  'auth/user-not-found': 'No registered account found with that email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network problem. Check your internet connection and try again.'
};

const features = [
  {
    title: 'Traffic & Geo Analytics',
    desc: 'Real-time visitor counts, geographic locations and page views'
  },
  {
    title: 'Client Inquiries',
    desc: 'Instant contact form submissions and lead management'
  },
  {
    title: 'Content & Portfolio Control',
    desc: 'Seamlessly update projects, live demo links and services'
  },
  {
    title: 'SEO & Metadata Suite',
    desc: 'Search engine preview, meta descriptions and indexing controls'
  }
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
    document.title = 'Admin Gateway | Steven Imanzi';
  }, []);

  useEffect(() => {
    if (ready && isAdminUser(user)) {
      navigate('/admin', { replace: true });
    }
  }, [ready, user, navigate]);

  const finish = async (signedIn: User) => {
    if (!isAdminUser(signedIn)) {
      await signOut(auth);
      setError('Access denied. This account does not have administrative privileges.');
      return;
    }
    markAsOwner();
    navigate('/admin', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setInfo('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both your email address and password.');
      setBusy(false);
      return;
    }

    let mysqlAttempted = false;
    let mysqlRejected = false;

    // 1. Primary Authentication: MySQL Database API (/api/auth.php)
    try {
      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password })
      });
      mysqlAttempted = true;

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('sm_admin_token', data.token);
          localStorage.setItem('sm_admin_user', JSON.stringify(data.user));
          markAsOwner();
          navigate('/admin', { replace: true });
          return;
        }
      } else if (res.status === 401) {
        mysqlRejected = true;
      }
    } catch {
    }

    // 2. Secondary / Fallback Authentication: Firebase
    try {
      const result = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      await finish(result.user);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      if (mysqlRejected || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        setError('Invalid email or password. Please verify your credentials.');
      } else if (errorMessages[code]) {
        setError(errorMessages[code]);
      } else if (mysqlAttempted) {
        setError('Authentication failed. Please verify your credentials.');
      } else {
        setError('Could not sign in. Please verify your connection and try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please type your administrator email above first, then click “Forgot password?”.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setInfo('Password reset instructions have been dispatched if this address is registered.');
    } catch (err) {
      const code = (err as { code?: string })?.code ?? '';
      setError(errorMessages[code] ?? 'Could not request password reset. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      {/* Brand & system summary sidebar */}
      <aside className="adm-login-side">
        <div className="adm-brand">
          <span className="adm-logo" aria-hidden="true">SI</span>
          <div>
            <strong>Steven Imanzi</strong>
            <small>Executive Control Panel</small>
          </div>
        </div>

        <div className="adm-login-hero">
          <h2>Everything about your digital portfolio, in one unified place.</h2>
          <ul className="adm-features-list">
            {features.map(f => (
              <li key={f.title}>
                <span className="adm-feat-icon" aria-hidden="true">
                  <CheckIcon />
                </span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="adm-side-foot">
          <small className="adm-muted">© {new Date().getFullYear()} Steven Imanzi. Secure Infrastructure.</small>
        </div>
      </aside>

      
      <main className="adm-login-main">
        <div className="adm-login-shell">
          <div className="adm-card-glow" aria-hidden="true" />

          <form className="adm-auth-card" onSubmit={handleSubmit} noValidate>
            <div className="adm-auth-header">
              <h1>Admin Gateway</h1>
              <p className="adm-auth-sub">
                Sign in to manage portfolio content, inspect live visitor telemetry, and review inquiries.
              </p>
            </div>

            {error && (
              <div className="adm-alert adm-alert-bad" role="alert">
                <ExclamationCircleIcon className="adm-alert-svg" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="adm-alert adm-alert-info" role="status">
                <InformationCircleIcon className="adm-alert-svg" aria-hidden="true" />
                <span>{info}</span>
              </div>
            )}

            <div className="adm-auth-fields">
              
              <div className="adm-group">
                <label htmlFor="adm-email-input" className="adm-label">
                  Email Address
                </label>
                <div className="adm-input-wrap">
                  <EnvelopeIcon className="adm-input-icon" aria-hidden="true" />
                  <input
                    id="adm-email-input"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="info@stevenimanzi.info"
                    disabled={busy}
                    className="adm-auth-input"
                  />
                </div>
              </div>

              
              <div className="adm-group">
                <div className="adm-label-row">
                  <label htmlFor="adm-password-input" className="adm-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="adm-forgot-link"
                    onClick={handleReset}
                    disabled={busy}
                    tabIndex={-1}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="adm-input-wrap">
                  <LockClosedIcon className="adm-input-icon" aria-hidden="true" />
                  <input
                    id="adm-password-input"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={busy}
                    className="adm-auth-input with-toggle"
                  />
                  <button
                    type="button"
                    className="adm-toggle-visibility"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {show ? <EyeSlashIcon aria-hidden="true" /> : <EyeIcon aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="adm-btn-submit"
              disabled={busy}
            >
              {busy ? (
                <>
                  <ArrowPathIcon className="adm-spinner" aria-hidden="true" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>

            <div className="adm-auth-foot">
              <Link to="/" className="adm-back-link">
                <ArrowLeftIcon className="adm-back-icon" aria-hidden="true" />
                <span>Back to portfolio</span>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}