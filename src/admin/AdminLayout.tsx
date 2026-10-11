import { useEffect, useRef, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  HomeIcon,
  InboxIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { importBuiltins, isAdminUser, logOut, useAuthUser } from './adminFirebase';
import { AdminDataProvider, useAdminData } from './AdminData';
import { ToastProvider, useToast } from './ui';
import './admin.css';

const nav = [
  {
    heading: 'Dashboard',
    items: [
      { to: '/admin', label: 'Overview', icon: HomeIcon, end: true },
      { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
      { to: '/admin/messages', label: 'Messages', icon: InboxIcon, badge: true }
    ]
  },
  {
    heading: 'Website content',
    items: [
      { to: '/admin/projects', label: 'Projects', icon: RectangleStackIcon },
      { to: '/admin/services', label: 'Services', icon: WrenchScrewdriverIcon },
      { to: '/admin/testimonials', label: 'Testimonials', icon: ChatBubbleBottomCenterTextIcon },
      { to: '/admin/site', label: 'Site details', icon: AdjustmentsHorizontalIcon }
    ]
  },
  {
    heading: 'Growth',
    items: [{ to: '/admin/seo', label: 'SEO', icon: GlobeAltIcon }]
  },
  {
    heading: 'Account',
    items: [{ to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon }]
  }
];

const titles: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/analytics': 'Analytics',
  '/admin/messages': 'Messages',
  '/admin/projects': 'Projects',
  '/admin/services': 'Services',
  '/admin/testimonials': 'Testimonials',
  '/admin/site': 'Site details',
  '/admin/seo': 'SEO',
  '/admin/settings': 'Settings'
};

function Shell({ email }: { email: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { unread, pendingImport, contentLoaded, contentError, all, raw } = useAdminData();
  const toast = useToast();
  const [importing, setImporting] = useState(false);
  // The drawer counts as open only on the page it was opened on, so navigating closes it.
  const [drawerOn, setDrawerOn] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerOpen = drawerOn === pathname;

  useEffect(() => {
    document.title = `${unread > 0 ? `(${unread}) ` : ''}${titles[pathname] ?? 'Admin'} | Admin · Steven Imanzi`;
  }, [pathname, unread]);

  const saveToDatabase = async () => {
    setImporting(true);
    try {
      const n = await importBuiltins(all, raw);
      toast(`Saved ${n} item${n === 1 ? '' : 's'} to the database. Everything here is now real, editable data.`);
    } catch {
      toast('Could not save to the database. Check that you are signed in and the rules are deployed.', 'error');
    } finally {
      setImporting(false);
    }
  };

  // Close the account menu on outside click / Escape; lock scrolling while the drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOn(null);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const signOutNow = async () => {
    await logOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="adm-app">
      <aside id="adm-sidebar" className={`adm-sidebar ${drawerOpen ? 'open' : ''}`} aria-label="Admin navigation">
        <div className="adm-brand">
          <span className="adm-logo" aria-hidden="true">SI</span>
          <div>
            <strong>Steven Imanzi</strong>
            <small>Admin</small>
          </div>
          <button type="button" className="adm-iconbtn adm-only-mobile" onClick={() => setDrawerOn(null)} aria-label="Close menu">
            <XMarkIcon />
          </button>
        </div>

        <nav className="adm-nav">
          {nav.map(group => (
            <div key={group.heading} className="adm-nav-group">
              <span className="adm-nav-heading">{group.heading}</span>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) => `adm-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setDrawerOn(null)}
                >
                  <item.icon aria-hidden="true" />
                  <span>{item.label}</span>
                  {'badge' in item && item.badge && unread > 0 && <em className="adm-nav-badge">{unread}</em>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-link">
            <ArrowTopRightOnSquareIcon aria-hidden="true" />
            <span>View website</span>
          </a>
          <div className="adm-usercard">
            <span className="adm-avatar sm" aria-hidden="true">{email.charAt(0).toUpperCase()}</span>
            <div className="adm-usercard-text">
              <strong>Owner</strong>
              <small title={email}>{email}</small>
            </div>
            <button type="button" className="adm-iconbtn" onClick={signOutNow} aria-label="Sign out" title="Sign out">
              <ArrowRightStartOnRectangleIcon />
            </button>
          </div>
        </div>
      </aside>

      {drawerOpen && <div className="adm-scrim" onClick={() => setDrawerOn(null)} aria-hidden="true"></div>}

      <div className="adm-content">
        <header className="adm-topbar">
          <button
            type="button"
            className="adm-iconbtn adm-only-mobile"
            onClick={() => setDrawerOn(drawerOpen ? null : pathname)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="adm-sidebar"
          >
            <Bars3Icon />
          </button>

          <div className="adm-topbar-title">
            <span className="adm-muted">Admin</span>
            <strong>{titles[pathname] ?? 'Dashboard'}</strong>
          </div>

          <div className="adm-topbar-right">
            <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn adm-hide-sm">
              View website <ArrowTopRightOnSquareIcon aria-hidden="true" />
            </a>

            <div className="adm-usermenu" ref={menuRef}>
              <button
                type="button"
                className="adm-avatar"
                onClick={() => setMenuOpen(o => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                {email.charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="adm-dropdown" role="menu">
                  <div className="adm-dropdown-user">
                    <small className="adm-muted">Signed in as</small>
                    <strong>{email}</strong>
                  </div>
                  <NavLink to="/admin/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
                    <Cog6ToothIcon aria-hidden="true" /> Settings
                  </NavLink>
                  <button type="button" role="menuitem" onClick={signOutNow}>
                    <ArrowRightStartOnRectangleIcon aria-hidden="true" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="adm-main">
          {contentLoaded && !contentError && pendingImport > 0 && (
            <div className="adm-banner" role="status">
              <div>
                <strong>Save your website content to the database</strong>
                <p>
                  {pendingImport} item{pendingImport === 1 ? '' : 's'} (projects, services, testimonials and settings) still live
                  only in the website code. Save them once and this dashboard shows and manages the real, live data.
                </p>
              </div>
              <button type="button" className="adm-btn primary" onClick={saveToDatabase} disabled={importing}>
                {importing ? 'Saving…' : 'Save to database'}
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, ready } = useAuthUser();

  if (!ready) return <div className="adm-loading">Checking your sign-in…</div>;
  if (!isAdminUser(user)) return <Navigate to="/admin/login" replace />;

  return (
    <AdminDataProvider>
      <ToastProvider>
        <Shell email={user.email ?? ''} />
      </ToastProvider>
    </AdminDataProvider>
  );
}
