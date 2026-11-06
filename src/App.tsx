import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Skills from './pages/Skills';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Header from './components/Header';
import Footer from './components/Footer';
import SiteBackground from './components/SiteBackground';
import SeoManager from './components/SeoManager';
import RevealManager from './components/RevealManager';
import { ContentProvider } from './content/ContentContext';
import { trackVisit } from './lib/publicApi';
import './App.css';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // One page view per page per session; the owner's own visits and /admin are ignored.
  useEffect(() => {
    if (!isAdmin) void trackVisit(pathname);
    window.scrollTo(0, 0); // Scroll to top on every route change
  }, [pathname, isAdmin]);

  return (
    <div className="app-wrapper">
      <SiteBackground />
      <SeoManager />
      <RevealManager />
      {!isAdmin && <Header />}

      <main className={isAdmin ? 'main-content main-content-admin' : 'main-content'}>
        <Suspense fallback={<div className="adm-loading">Loading…</div>}>
          <div key={isAdmin ? 'admin' : pathname} className={isAdmin ? undefined : 'page-fade'}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/services" element={<Services />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Suspense>
      </main>

      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ContentProvider>
        <Shell />
      </ContentProvider>
    </Router>
  );
}

export default App;
